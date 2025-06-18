import mongoose from 'mongoose';

const statsSchema = new mongoose.Schema({
  gamesPlayed: { type: Number, default: 0 },
  wins: { type: Number, default: 0 },
  totalScore: { type: Number, default: 0 },
  totalGuesses: { type: Number, default: 0 },
  correctGuesses: { type: Number, default: 0 }
});

const userSchema = new mongoose.Schema({
  username: { type: String, required: true, unique: true, trim: true },
  email: { type: String, required: true, unique: true, trim: true },
  passwordHash: { type: String, required: true },
  stats: { type: statsSchema, default: () => ({}) }
});

const User = mongoose.model('User', userSchema);

export default User;