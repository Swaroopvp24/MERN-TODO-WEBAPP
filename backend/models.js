import mongoose from 'mongoose';

// --- User Model ---
const UserSchema = new mongoose.Schema({
  username: { type: String, required: true, unique: true },
  password: { type: String, required: true }
});

// --- Todo Model ---
const TodoSchema = new mongoose.Schema({
  text: { type: String, required: true },
  description: { type: String },
  date: { type: String },
  time: { type: String },
  isFullDay: { type: Boolean, default: false },
  completed: { type: Boolean, default: false },
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true }
});

// Named exports
export const User = mongoose.model('User', UserSchema);
export const Todo = mongoose.model('Todo', TodoSchema);