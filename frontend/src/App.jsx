import React, { useState, useEffect } from 'react';
import { Trash2, Check, Plus, LogOut, Loader2, User, Lock, Calendar, Clock, Pencil, AlertCircle } from 'lucide-react';
import './App.css';

// --- CONFIGURATION ---
const API_URL = 'http://localhost:5000/api';

// --- API SERVICES ---
const api = {
  login: async (username, password) => {
    const res = await fetch(`${API_URL}/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username, password }),
    });
    if (!res.ok) throw new Error((await res.json()).message);
    return res.json();
  },

  register: async (username, password) => {
    const res = await fetch(`${API_URL}/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username, password }),
    });
    if (!res.ok) throw new Error((await res.json()).error);
    return res.json();
  },

  getTodos: async (token) => {
    const res = await fetch(`${API_URL}/todos`, {
      headers: { 'Authorization': `Bearer ${token}` }
    });
    if (!res.ok) throw new Error('Failed to fetch');
    return res.json();
  },

  addTodo: async (token, todoData) => {
    const res = await fetch(`${API_URL}/todos`, {
      method: 'POST',
      headers: { 
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify(todoData)
    });
    return res.json();
  },

  // Update existing todo (Edit)
  updateTodo: async (token, id, todoData) => {
    const res = await fetch(`${API_URL}/todos/${id}`, {
      method: 'PUT',
      headers: { 
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify(todoData)
    });
    return res.json();
  },

  // Toggle completion (Send empty body for simple toggle)
  toggleTodo: async (token, id) => {
    const res = await fetch(`${API_URL}/todos/${id}`, {
      method: 'PUT',
      headers: { 'Authorization': `Bearer ${token}` }
    });
    return res.json();
  },

  deleteTodo: async (token, id) => {
    await fetch(`${API_URL}/todos/${id}`, {
      method: 'DELETE',
      headers: { 'Authorization': `Bearer ${token}` }
    });
    return true;
  }
};

// --- COMPONENTS ---

const AuthScreen = ({ onLogin }) => {
  const [isLogin, setIsLogin] = useState(true);
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      if (isLogin) {
        const data = await api.login(username, password);
        onLogin(data);
      } else {
        await api.register(username, password);
        setIsLogin(true);
        setError('Registration successful! Please login.');
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100 p-4">
      <div className="bg-white p-8 rounded-2xl shadow-xl w-full max-w-md border border-gray-100">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-800 mb-2">
            {isLogin ? 'Welcome Back' : 'Create Account'}
          </h1>
          <p className="text-gray-500">
            {isLogin ? 'Enter your details to access your todos' : 'Sign up to start organizing your life'}
          </p>
        </div>

        {error && (
          <div className={`p-4 rounded-lg mb-6 text-sm font-medium ${error.includes('successful') ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-5">
          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-700 ml-1">Username</label>
            <div className="relative">
              <User className="w-5 h-5 absolute left-3 top-3 text-gray-400" />
              <input
                type="text"
                required
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none transition-all"
                placeholder="Enter username"
              />
            </div>
          </div>
          
          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-700 ml-1">Password</label>
            <div className="relative">
              <Lock className="w-5 h-5 absolute left-3 top-3 text-gray-400" />
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none transition-all"
                placeholder="Enter password"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-semibold py-3 rounded-xl transition-all duration-200 transform hover:scale-[1.02] flex items-center justify-center shadow-lg shadow-indigo-200"
          >
            {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : (isLogin ? 'Sign In' : 'Sign Up')}
          </button>
        </form>

        <div className="mt-6 text-center">
          <button
            onClick={() => { setIsLogin(!isLogin); setError(''); }}
            className="text-indigo-600 hover:text-indigo-800 text-sm font-medium hover:underline"
          >
            {isLogin ? "Don't have an account? Sign up" : "Already have an account? Sign in"}
          </button>
        </div>
      </div>
    </div>
  );
};

const TodoScreen = ({ user, token, onLogout }) => {
  const [todos, setTodos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [formError, setFormError] = useState('');
  
  // Edit Mode State
  const [editingId, setEditingId] = useState(null); // ID of todo being edited, or null

  const initialFormState = {
    text: '',
    description: '',
    date: '',
    time: '',
    isFullDay: false
  };

  const [formData, setFormData] = useState(initialFormState);

  useEffect(() => {
    loadTodos();
  }, []);

  const loadTodos = async () => {
    try {
      const data = await api.getTodos(token);
      setTodos(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  // --- VALIDATION LOGIC ---
  const validateForm = () => {
    if (!formData.text.trim()) return "Task title is required.";

    if (formData.date) {
      const today = new Date();
      today.setHours(0, 0, 0, 0); // Reset time to start of day
      const inputDate = new Date(formData.date);
      // Fix timezone offset issue by treating the input as local midnight
      // actually new Date('YYYY-MM-DD') is UTC, but we want local comparison
      // Simpler approach: Compare ISO Strings YYYY-MM-DD
      const todayStr = new Date().toLocaleDateString('en-CA'); // "YYYY-MM-DD" in local time
      
      if (formData.date < todayStr) {
        return "You cannot set a date in the past.";
      }

      // If date is today, check time
      if (formData.date === todayStr && !formData.isFullDay && formData.time) {
        const now = new Date();
        const currentMinutes = now.getHours() * 60 + now.getMinutes();
        
        const [hours, minutes] = formData.time.split(':').map(Number);
        const inputMinutes = hours * 60 + minutes;

        if (inputMinutes < currentMinutes) {
          return "You cannot set a time in the past for today.";
        }
      }
    }
    return null; // No error
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setFormError('');

    // Run Validation
    const error = validateForm();
    if (error) {
      setFormError(error);
      return;
    }

    try {
      if (editingId) {
        // UPDATE MODE
        const updatedTodo = await api.updateTodo(token, editingId, formData);
        setTodos(todos.map(t => t._id === editingId ? updatedTodo : t));
      } else {
        // ADD MODE
        const todo = await api.addTodo(token, formData);
        setTodos([...todos, todo]);
      }
      
      // Cleanup
      setFormData(initialFormState);
      setEditingId(null);
      setShowForm(false);
    } catch (err) {
      console.error(err);
      setFormError("Something went wrong. Please try again.");
    }
  };

  const startEdit = (todo) => {
    setFormData({
      text: todo.text,
      description: todo.description || '',
      date: todo.date || '',
      time: todo.time || '',
      isFullDay: todo.isFullDay || false
    });
    setEditingId(todo._id);
    setFormError('');
    setShowForm(true);
  };

  const cancelEdit = () => {
    setFormData(initialFormState);
    setEditingId(null);
    setFormError('');
    setShowForm(false);
  };

  const handleToggle = async (id) => {
    try {
      setTodos(todos.map(t => t._id === id ? { ...t, completed: !t.completed } : t));
      await api.toggleTodo(token, id);
    } catch (err) {
      loadTodos();
    }
  };

  const handleDelete = async (id) => {
    if(!window.confirm("Are you sure you want to delete this task?")) return;
    try {
      setTodos(todos.filter(t => t._id !== id));
      await api.deleteTodo(token, id);
    } catch (err) {
      loadTodos();
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 p-4 sm:p-8">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <header className="flex flex-col sm:flex-row justify-between items-center mb-8 gap-4">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold text-gray-800">My Tasks</h1>
            <p className="text-gray-500 mt-1">Hello, {user}</p>
          </div>
          <button
            onClick={onLogout}
            className="flex items-center gap-2 px-4 py-2 bg-white text-gray-700 rounded-lg hover:bg-gray-100 border border-gray-200 transition-colors shadow-sm"
          >
            <LogOut className="w-4 h-4" />
            <span>Sign Out</span>
          </button>
        </header>

        {/* Add Button */}
        {!showForm && (
          <button
            onClick={() => setShowForm(true)}
            className="w-full mb-6 bg-white border border-dashed border-gray-300 rounded-xl p-4 text-gray-500 hover:text-indigo-600 hover:border-indigo-300 hover:bg-indigo-50 transition-all flex items-center justify-center gap-2 font-medium"
          >
            <Plus className="w-5 h-5" /> Add New Task
          </button>
        )}

        {/* Form (Add / Edit) */}
        {showForm && (
          <div className="bg-white p-6 rounded-xl shadow-lg border border-gray-100 mb-6 animate-in fade-in slide-in-from-top-4 duration-300">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-lg font-semibold text-gray-800">
                {editingId ? 'Edit Task' : 'New Task'}
              </h2>
              <button onClick={cancelEdit} className="text-gray-400 hover:text-gray-600">
                Cancel
              </button>
            </div>

            {formError && (
              <div className="mb-4 p-3 bg-red-50 text-red-600 text-sm rounded-lg flex items-center gap-2">
                <AlertCircle className="w-4 h-4" />
                {formError}
              </div>
            )}
            
            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Title */}
              <input
                type="text"
                placeholder="Task title..."
                className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 font-medium"
                value={formData.text}
                onChange={(e) => setFormData({...formData, text: e.target.value})}
                required
              />

              {/* Description */}
              <textarea
                placeholder="Description (optional)..."
                className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 resize-none h-24"
                value={formData.description}
                onChange={(e) => setFormData({...formData, description: e.target.value})}
              />

              {/* Date/Time Row */}
              <div className="flex flex-col sm:flex-row gap-4">
                <div className="flex-1 relative">
                  <Calendar className="absolute left-3 top-3 w-5 h-5 text-gray-400" />
                  <input
                    type="date"
                    className="w-full pl-10 pr-4 py-2.5 bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    value={formData.date}
                    onChange={(e) => setFormData({...formData, date: e.target.value})}
                  />
                </div>

                <div className="flex-1 flex gap-2">
                   {!formData.isFullDay && (
                     <div className="relative flex-1">
                        <Clock className="absolute left-3 top-3 w-5 h-5 text-gray-400" />
                        <input
                          type="time"
                          className="w-full pl-10 pr-4 py-2.5 bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                          value={formData.time}
                          onChange={(e) => setFormData({...formData, time: e.target.value})}
                        />
                     </div>
                   )}
                   
                   <label className={`flex items-center justify-center gap-2 px-4 rounded-lg border cursor-pointer transition-all ${formData.isFullDay ? 'bg-indigo-50 border-indigo-200 text-indigo-700' : 'bg-gray-50 border-gray-200 text-gray-600'}`}>
                      <input 
                        type="checkbox" 
                        checked={formData.isFullDay}
                        onChange={(e) => setFormData({...formData, isFullDay: e.target.checked})}
                        className="w-4 h-4 rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
                      />
                      <span className="text-sm font-medium whitespace-nowrap">All Day</span>
                   </label>
                </div>
              </div>

              <button
                type="submit"
                className="w-full bg-indigo-600 hover:bg-indigo-700 text-white py-3 rounded-lg font-semibold transition-colors shadow-md shadow-indigo-200"
              >
                {editingId ? 'Update Task' : 'Create Task'}
              </button>
            </form>
          </div>
        )}

        {/* List */}
        {loading ? (
          <div className="flex justify-center py-12">
            <Loader2 className="w-8 h-8 animate-spin text-indigo-600" />
          </div>
        ) : todos.length === 0 ? (
          <div className="text-center py-12 bg-white rounded-xl border border-dashed border-gray-300">
            <div className="text-gray-400 mb-2">No tasks yet</div>
            <p className="text-sm text-gray-500">Add a task above to get started!</p>
          </div>
        ) : (
          <div className="grid gap-3">
            {todos.map((todo) => (
              <div
                key={todo._id}
                className={`group flex items-start gap-4 p-4 bg-white rounded-xl border transition-all duration-200 ${
                  todo.completed ? 'border-gray-100 bg-gray-50' : 'border-gray-200 hover:shadow-md'
                }`}
              >
                <button
                  onClick={() => handleToggle(todo._id)}
                  className={`mt-1 shrink-0 w-6 h-6 rounded-full border-2 flex items-center justify-center transition-colors ${
                    todo.completed
                      ? 'bg-green-500 border-green-500 text-white'
                      : 'border-gray-300 text-transparent hover:border-green-500'
                  }`}
                >
                  <Check className="w-3.5 h-3.5" strokeWidth={3} />
                </button>

                <div className="flex-1 min-w-0">
                  <h3 className={`text-lg font-medium transition-all ${
                      todo.completed ? 'text-gray-400 line-through' : 'text-gray-800'
                    }`}>
                    {todo.text}
                  </h3>
                  
                  {todo.description && (
                    <p className={`mt-1 text-sm ${todo.completed ? 'text-gray-300' : 'text-gray-600'}`}>
                      {todo.description}
                    </p>
                  )}

                  {(todo.date || todo.time) && (
                    <div className="flex flex-wrap gap-2 mt-3">
                      {todo.date && (
                        <span className={`inline-flex items-center gap-1 text-xs px-2 py-1 rounded-md ${todo.completed ? 'bg-gray-100 text-gray-400' : 'bg-blue-50 text-blue-700'}`}>
                          <Calendar className="w-3 h-3" />
                          {todo.date}
                        </span>
                      )}
                      {(todo.time || todo.isFullDay) && (
                        <span className={`inline-flex items-center gap-1 text-xs px-2 py-1 rounded-md ${todo.completed ? 'bg-gray-100 text-gray-400' : 'bg-orange-50 text-orange-700'}`}>
                          <Clock className="w-3 h-3" />
                          {todo.isFullDay ? 'All Day' : todo.time}
                        </span>
                      )}
                    </div>
                  )}
                </div>
                
                {/* Actions */}
                <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                  <button
                    onClick={() => startEdit(todo)}
                    className="p-2 text-gray-400 hover:text-indigo-500 hover:bg-indigo-50 rounded-lg transition-all"
                    title="Edit task"
                  >
                    <Pencil className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => handleDelete(todo._id)}
                    className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-all"
                    title="Delete task"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default function App() {
  const [token, setToken] = useState(localStorage.getItem('token'));
  const [user, setUser] = useState(localStorage.getItem('username'));

  const handleLogin = (data) => {
    localStorage.setItem('token', data.token);
    localStorage.setItem('username', data.username);
    setToken(data.token);
    setUser(data.username);
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('username');
    setToken(null);
    setUser(null);
  };

  return (
    <>
      {token ? (
        <TodoScreen user={user} token={token} onLogout={handleLogout} />
      ) : (
        <AuthScreen onLogin={handleLogin} />
      )}
    </>
  );
}