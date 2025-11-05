import express from 'express';
import { createServer } from 'http';
import { Server } from 'socket.io';
import cors from 'cors';
import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import dotenv from 'dotenv';
import User from './models/User.js';
import authMiddleware from './authMiddleware.js';

dotenv.config();

const app = express();
app.use(cors({ origin: process.env.CLIENT_URL || 'http://localhost:3000' }));
app.use(express.json());

const server = createServer(app);
const io = new Server(server, {
  cors: { origin: process.env.CLIENT_URL || 'http://localhost:3000', methods: ['GET', 'POST'] },
});

const MONGO_URI = process.env.MONGO_URI || '';
const JWT_SECRET = process.env.JWT_SECRET || 'dev-secret';
const PORT = process.env.PORT || 3001;

// Connect to MongoDB
mongoose
  .connect(MONGO_URI)
  .then(() => {})
  .catch(() => {});

// Auth routes
app.post('/api/auth/register', async (req, res) => {
  try {
    const { username, email, password } = req.body;
    if (!username || !email || !password) {
      return res.status(400).json({ msg: 'Please enter all fields.' });
    }

    let user = await User.findOne({ $or: [{ email }, { username }] });
    if (user) {
      return res.status(400).json({ msg: 'User with this email or username already exists.' });
    }

    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash(password, salt);

    user = new User({ username, email, passwordHash });
    await user.save();

    return res.status(201).json({ msg: 'User registered successfully!' });
  } catch (err) {
    console.error('Registration error:', err);
    return res.status(500).json({ msg: 'Server Error' });
  }
});

app.post('/api/auth/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({ msg: 'Please enter all fields.' });
    }

    const user = await User.findOne({ email });
    if (!user) {
      return res.status(400).json({ msg: 'Invalid credentials.' });
    }

    const isMatch = await bcrypt.compare(password, user.passwordHash);
    if (!isMatch) {
      return res.status(400).json({ msg: 'Invalid credentials.' });
    }

    const token = jwt.sign({ id: user._id, username: user.username }, JWT_SECRET, {
      expiresIn: '3h',
    });

    return res.json({
      token,
      user: { id: user._id, username: user.username, email: user.email },
    });
  } catch (err) {
    console.error('Login error:', err);
    return res.status(500).json({ msg: 'Server Error' });
  }
});

app.get('/api/user/stats', authMiddleware, async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select('-passwordHash');
    if (!user) {
      return res.status(404).json({ msg: 'User not found' });
    }
    return res.json(user.stats);
  } catch (err) {
    console.error('Stats error:', err);
    return res.status(500).json({ msg: 'Server Error' });
  }
});

// Game state
const rooms = {};
const wordList = ['tree', 'house', 'react', 'banana', 'computer', 'cloud', 'ocean', 'sun'];
const DEFAULT_DRAW_TIME = 90;
const DEFAULT_MAX_ROUNDS = 3;

async function updatePlayerStats(players, winnerDBId) {
  try {
    for (const player of players) {
      if (!player.userId) continue;
      const isWinner = !!winnerDBId && String(player.userId) === String(winnerDBId);
      await User.findByIdAndUpdate(player.userId, {
        $inc: {
          'stats.gamesPlayed': 1,
          'stats.totalScore': player.score,
          'stats.wins': isWinner ? 1 : 0,
        },
      });
    }
  } catch (err) {
    // ignore
  }
}

function pickWordChoices(room) {
  let choices = [];
  if (room.customWords && room.customWords.length > 0) {
    const pool = [...room.customWords];
    while (choices.length < Math.min(3, pool.length)) {
      const idx = Math.floor(Math.random() * pool.length);
      const w = pool.splice(idx, 1)[0];
      if (!choices.includes(w)) choices.push(w);
    }
  }
  while (choices.length < 3) {
    const w = wordList[Math.floor(Math.random() * wordList.length)];
    if (!choices.includes(w)) choices.push(w);
  }
  return choices;
}

function startTurn(roomId) {
  const room = rooms[roomId];
  if (!room) return;

  const newDrawer = room.players[room.currentDrawerIndex];
  if (!newDrawer) return;

  room.currentDrawer = newDrawer.id;
  room.players.forEach((p) => (p.hasGuessed = false));

  const wordChoices = pickWordChoices(room);

  io.to(newDrawer.id).emit('your-turn-to-draw', { wordChoices });
  io.to(roomId).emit('new-drawer', { username: newDrawer.username, avatar: newDrawer.avatar });
}

function startTimer(roomId) {
  const room = rooms[roomId];
  if (!room) return;

  room.displayWord = (room.currentWord || '').replace(/[a-zA-Z]/g, '_');
  io.to(roomId).emit('hint-update', room.displayWord);

  room.timerValue = room.roundDuration || DEFAULT_DRAW_TIME;
  room.turnEndTime = Date.now() + room.timerValue * 1000;
  io.to(roomId).emit('timer-update', room.timerValue);

  room.timerId = setInterval(() => {
    room.timerValue -= 1;
    io.to(roomId).emit('timer-update', room.timerValue);
    if (room.timerValue <= 0) {
      clearInterval(room.timerId);
      handleNextTurn(roomId, 'timeout');
    }
  }, 1000);

  const revealIntervalSeconds = 15;
  room.hintIntervalId = setInterval(() => {
    const indices = [];
    for (let i = 0; i < room.currentWord.length; i++) {
      if (room.displayWord[i] === '_') indices.push(i);
    }
    if (indices.length > 0) {
      const idx = indices[Math.floor(Math.random() * indices.length)];
      const arr = room.displayWord.split('');
      arr[idx] = room.currentWord[idx];
      room.displayWord = arr.join('');
      io.to(roomId).emit('hint-update', room.displayWord);
    }
    if (!room.displayWord.includes('_')) {
      clearInterval(room.hintIntervalId);
    }
  }, revealIntervalSeconds * 1000);
}

function handleNextTurn(roomId, reason = 'timeout') {
  const room = rooms[roomId];
  if (!room) return;

  if (room.timerId) clearInterval(room.timerId);
  if (room.hintIntervalId) clearInterval(room.hintIntervalId);

  io.to(roomId).emit('turn-end', { word: room.currentWord, reason });

  room.currentDrawerIndex += 1;
  if (room.currentDrawerIndex >= room.players.length) {
    room.currentDrawerIndex = 0;
    room.currentRound += 1;
  }

  if (room.currentRound > room.maxRounds) {
    room.gameState = 'end-game';
    const sortedPlayers = [...room.players].sort((a, b) => b.score - a.score);
    const winner = sortedPlayers[0] || null;
    io.to(roomId).emit('game-over', { players: sortedPlayers });
    updatePlayerStats(room.players, winner && winner.userId ? winner.userId : null);
    setTimeout(() => {
      if (rooms[roomId] && rooms[roomId].gameState === 'end-game') delete rooms[roomId];
    }, 30000);
    return;
  }

  setTimeout(() => startTurn(roomId), 4000);
}

io.on('connection', (socket) => {
  socket.on('create-room', ({ username, avatar, userId }) => {
    const roomId = Math.random().toString(36).substring(2, 6).toUpperCase();
    rooms[roomId] = {
      roomId,
      host: socket.id,
      hostUsername: username,
      players: [
        { id: socket.id, userId, username, avatar, score: 0, hasGuessed: false },
      ],
      gameState: 'lobby',
      gameStarted: false,
      customWords: [],
      currentWord: '',
      currentDrawer: null,
      currentDrawerIndex: 0,
      currentRound: 1,
      maxRounds: DEFAULT_MAX_ROUNDS,
      roundDuration: DEFAULT_DRAW_TIME,
      timerId: null,
      hintIntervalId: null,
      timerValue: 0,
      displayWord: '',
      turnEndTime: 0,
    };
    socket.join(roomId);
    socket.emit('room-created', rooms[roomId]);
  });

  socket.on('join-room', ({ roomId, username, avatar, userId }) => {
    const room = rooms[roomId];
    if (!room || room.gameState !== 'lobby') {
      socket.emit('error', 'Room not found or game already in progress.');
      return;
    }
    const newPlayer = { id: socket.id, userId, username, avatar, score: 0, hasGuessed: false };
    room.players.push(newPlayer);
    socket.join(roomId);
    socket.emit('room-joined', room);
    socket.to(roomId).emit('player-joined', newPlayer);
  });

  socket.on('add-custom-word', ({ roomId, word }) => {
    const room = rooms[roomId];
    if (!room) return socket.emit('error', 'Room not found.');
    if (room.gameStarted || room.gameState !== 'lobby') {
      return socket.emit('error', 'Cannot add words after game has started.');
    }
    if (socket.id !== room.host) return socket.emit('error', 'Only the host can add custom words.');
    const trimmedWord = (word || '').trim().toLowerCase();
    if (!trimmedWord) return socket.emit('error', 'Word cannot be empty.');
    if (trimmedWord.length < 3) return socket.emit('error', 'Word must be at least 3 characters long.');
    if (room.customWords.includes(trimmedWord)) return socket.emit('error', 'This word has already been added.');
    room.customWords.push(trimmedWord);
    io.to(roomId).emit('custom-word-added', { customWords: room.customWords });
  });

  socket.on('remove-custom-word', ({ roomId, word }) => {
    const room = rooms[roomId];
    if (!room || socket.id !== room.host || room.gameState !== 'lobby') {
      return socket.emit('error', 'Cannot remove words right now.');
    }
    const idx = room.customWords.indexOf((word || '').toLowerCase());
    if (idx > -1) room.customWords.splice(idx, 1);
    io.to(roomId).emit('custom-word-added', { customWords: room.customWords });
  });

  socket.on('start-game', (payload) => {
    if (!payload || typeof payload.roomId !== 'string') return;
    const { roomId, settings } = payload;
    const room = rooms[roomId];
    if (!room) return;

    if (room.host === socket.id && room.gameState === 'lobby') {
      if (settings) {
        room.maxRounds = settings.totalRounds || DEFAULT_MAX_ROUNDS;
        room.roundDuration = settings.roundDuration || DEFAULT_DRAW_TIME;
      }
      room.gameState = 'in-progress';
      room.gameStarted = true;
      room.currentRound = 1;
      room.currentDrawerIndex = 0;
      room.players.forEach((p) => {
        p.score = 0;
        p.hasGuessed = false;
      });
      io.to(roomId).emit('game-started', room.players);
      setTimeout(() => startTurn(roomId), 500);
    } else if (room.host === socket.id && room.gameState === 'end-game') {
      room.gameState = 'in-progress';
      room.currentRound = 1;
      room.currentDrawerIndex = 0;
      room.players.forEach((p) => {
        p.score = 0;
        p.hasGuessed = false;
      });
      io.to(roomId).emit('game-restarted', room.players);
      setTimeout(() => startTurn(roomId), 500);
    } else {
      socket.emit('error', 'Only the host can start the game.');
    }
  });

  socket.on('word-chosen', ({ roomId, word }) => {
    const room = rooms[roomId];
    if (!room) return;
    if (socket.id !== room.currentDrawer) return;
    room.currentWord = String(word || '').toLowerCase();
    startTimer(roomId);
  });

  socket.on('draw-data', ({ roomId, data }) => {
    const room = rooms[roomId];
    if (!room) return;
    if (room.players[room.currentDrawerIndex]?.id !== socket.id) return;
    socket.broadcast.to(roomId).emit('drawing', data);
  });

  socket.on('clear-canvas', ({ roomId }) => {
    const room = rooms[roomId];
    if (!room) return;
    if (room.players[room.currentDrawerIndex]?.id !== socket.id) return;
    io.to(roomId).emit('canvas-cleared');
  });

  socket.on('guess', async ({ roomId, username, message }) => {
    const room = rooms[roomId];
    if (!room) return;
    const player = room.players.find((p) => p.id === socket.id);
    if (!player) return;
    const isDrawer = room.players[room.currentDrawerIndex]?.id === socket.id;
    const guessText = String(message || '').toLowerCase();
    const isCorrectGuess = !isDrawer && room.gameState === 'in-progress' && guessText === room.currentWord.toLowerCase();

    if (!isDrawer && player.userId) {
      try {
        const inc = { 'stats.totalGuesses': 1 };
        if (isCorrectGuess) inc['stats.correctGuesses'] = 1;
        const updatedUser = await User.findByIdAndUpdate(player.userId, { $inc: inc }, { new: true });
        if (updatedUser) {
          socket.emit('stats-updated', {
            totalGuesses: updatedUser.stats.totalGuesses || 0,
            correctGuesses: updatedUser.stats.correctGuesses || 0,
          });
        }
      } catch (err) {
        // ignore
      }
    }

    if (isCorrectGuess && !player.hasGuessed) {
      player.hasGuessed = true;
      const scoreGained = Math.max(10, Math.floor((room.timerValue || 0) * 1.5));
      player.score += scoreGained;
      const drawer = room.players[room.currentDrawerIndex];
      if (drawer) drawer.score += 20;
      io.to(roomId).emit('player-guessed', { username: player.username });
      socket.emit('correct-guess', { message: `You guessed it! +${scoreGained} points!` });
      io.to(roomId).emit('update-scoreboard', room.players);
      const allGuessed = room.players.filter((p) => p.id !== room.currentDrawer).every((p) => p.hasGuessed);
      if (allGuessed) handleNextTurn(roomId, 'all-guessed');
    } else if (!isDrawer) {
      io.to(roomId).emit('new-message', { username: player.username, message: message });
    }
  });

  socket.on('private-message', ({ toSocketId, username, message }) => {
    io.to(toSocketId).emit('new-private-message', { from: socket.id, username, message });
    socket.emit('new-private-message', { to: toSocketId, username, message });
  });

  socket.on('get-my-stats', async () => {
    try {
      const player = Object.values(rooms)
        .flatMap((room) => room.players)
        .find((p) => p.id === socket.id);
      if (player && player.userId) {
        const user = await User.findById(player.userId);
        if (user) {
          socket.emit('stats-updated', {
            totalGuesses: user.stats.totalGuesses || 0,
            correctGuesses: user.stats.correctGuesses || 0,
            gamesPlayed: user.stats.gamesPlayed || 0,
            wins: user.stats.wins || 0,
            totalScore: user.stats.totalScore || 0,
          });
        }
      }
    } catch (err) {
      // ignore
    }
  });

  socket.on('leave-room', ({ roomId }) => {
    const room = rooms[roomId];
    if (!room) return;
    const idx = room.players.findIndex((p) => p.id === socket.id);
    if (idx === -1) return;
    room.players.splice(idx, 1);
    socket.leave(roomId);
    io.to(roomId).emit('player-left', { socketId: socket.id, players: room.players });
    if (socket.id === room.currentDrawer) {
      if (room.timerId) clearInterval(room.timerId);
      if (room.hintIntervalId) clearInterval(room.hintIntervalId);
      if (room.players.length > 0) handleNextTurn(roomId);
    }
    if (room.players.length === 0) {
      delete rooms[roomId];
    } else if (room.host === socket.id) {
      room.host = room.players[0].id;
      room.hostUsername = room.players[0].username;
      io.to(roomId).emit('room-update', room);
    }
  });

  socket.on('disconnect', () => {
    for (const roomId of Object.keys(rooms)) {
      const room = rooms[roomId];
      const idx = room.players.findIndex((p) => p.id === socket.id);
      if (idx !== -1) {
        room.players.splice(idx, 1);
        io.to(roomId).emit('player-left', { socketId: socket.id, players: room.players });
        if (socket.id === room.currentDrawer) {
          if (room.hintIntervalId) clearInterval(room.hintIntervalId);
          handleNextTurn(roomId);
        }
        if (room.players.length === 0) {
          delete rooms[roomId];
        } else if (room.host === socket.id) {
          room.host = room.players[0].id;
          room.hostUsername = room.players[0].username;
          io.to(roomId).emit('new-host', room.host);
        }
        break;
      }
    }
  });
});

server.listen(PORT, () => {});

