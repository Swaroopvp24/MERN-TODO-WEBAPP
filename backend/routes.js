import express from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { User, Todo } from './models.js'; // Note the .js extension
import { authenticateToken, JWT_SECRET } from './middleware.js'; // Note the .js extension

const router = express.Router();

// --- AUTH ROUTES ---

// Register
router.post('/register', async (req, res) => {
  try {
    const { username, password } = req.body;
    const hashedPassword = await bcrypt.hash(password, 10);
    const user = new User({ username, password: hashedPassword });
    await user.save();
    res.status(201).json({ message: 'User created successfully' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Login
router.post('/login', async (req, res) => {
  try {
    const { username, password } = req.body;
    const user = await User.findOne({ username });
    if (!user) return res.status(400).json({ message: 'User not found' });

    const validPassword = await bcrypt.compare(password, user.password);
    if (!validPassword) return res.status(400).json({ message: 'Invalid credentials' });

    const token = jwt.sign({ id: user._id, username: user.username }, JWT_SECRET, { expiresIn: '1h' });
    res.json({ token, username: user.username });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// --- TODO ROUTES ---

// Get Todos
router.get('/todos', authenticateToken, async (req, res) => {
  try {
    const todos = await Todo.find({ user: req.user.id });
    res.json(todos);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Add Todo
router.post('/todos', authenticateToken, async (req, res) => {
  try {
    const { text, description, date, time, isFullDay } = req.body;
    
    const todo = new Todo({
      text,
      description,
      date,
      time,
      isFullDay,
      user: req.user.id
    });
    
    await todo.save();
    res.status(201).json(todo);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Update Todo (Edit & Toggle)
router.put('/todos/:id', authenticateToken, async (req, res) => {
  try {
    const todo = await Todo.findOne({ _id: req.params.id, user: req.user.id });
    if (!todo) return res.status(404).json({ message: 'Todo not found' });
    
    if (Object.keys(req.body).length === 0) {
      todo.completed = !todo.completed;
    } else {
      if (req.body.text !== undefined) todo.text = req.body.text;
      if (req.body.description !== undefined) todo.description = req.body.description;
      if (req.body.date !== undefined) todo.date = req.body.date;
      if (req.body.time !== undefined) todo.time = req.body.time;
      if (req.body.isFullDay !== undefined) todo.isFullDay = req.body.isFullDay;
    }

    await todo.save();
    res.json(todo);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Delete Todo
router.delete('/todos/:id', authenticateToken, async (req, res) => {
  try {
    await Todo.findOneAndDelete({ _id: req.params.id, user: req.user.id });
    res.json({ message: 'Todo deleted' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

export default router;