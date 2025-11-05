# 🎨 Scribble.io Clone - Multiplayer Drawing & Guessing Game

A real-time multiplayer drawing and guessing game built with React, Node.js, Socket.IO, and MongoDB.

## ✨ Features

- 🎮 **Real-time Multiplayer Gameplay** - Play with friends in custom rooms
- 🖌️ **Drawing Canvas** - Smooth drawing with multiple colors and brush sizes
- 💬 **Chat System** - Room chat for guessing and private messaging
- 👑 **Host Controls** - Customizable game settings (rounds, timer, custom words)
- 📊 **Player Statistics** - Track games played, wins, guesses, and accuracy
- 🔐 **User Authentication** - Secure login and registration with JWT
- 📱 **Responsive Design** - Works on desktop and mobile devices
- 🦊 **Cross-Browser Support** - Compatible with Chrome, Firefox, Safari, and Edge

## 🛠️ Tech Stack

### Frontend
- **React** - UI framework
- **Socket.IO Client** - Real-time communication
- **React Router** - Navigation
- **Tailwind CSS** - Styling

### Backend
- **Node.js & Express** - Server framework
- **Socket.IO** - WebSocket communication
- **MongoDB & Mongoose** - Database
- **JWT** - Authentication
- **bcryptjs** - Password hashing

## 🚀 Getting Started

### Prerequisites
- Node.js (v14 or higher)
- MongoDB Atlas account or local MongoDB installation
- npm or yarn

### Installation

1. **Clone the repository**
```bash
git clone https://github.com/Shubham15986/Scibbl.git
cd Scibbl
```

2. **Install server dependencies**
```bash
cd server
npm install
```

3. **Install client dependencies**
```bash
cd ../client
npm install
```

4. **Configure environment variables**

Create a `.env` file in the `server` directory:
```env
MONGO_URI=your_mongodb_connection_string
JWT_SECRET=your_secret_key_here
CLIENT_URL=https://your-frontend-service.onrender.com
PORT=10000
```

Create a `.env` file in the `client` directory:
```env
REACT_APP_BACKEND_URL=https://your-backend-service.onrender.com
```

5. **Start the development servers**

**Terminal 1 - Backend:**
```bash
cd server
npm run dev
```

**Terminal 2 - Frontend:**
```bash
cd client
npm start
```

6. **Open your browser**
Navigate to `http://localhost:3000`

### Deploying to Render

1. **Connect your GitHub repository to Render**
   - Go to [Render Dashboard](https://dashboard.render.com)
   - Click "New" and select "Blueprint"
   - Connect your GitHub repository: `https://github.com/Shubham15986/Scibbl`
   - Use the `render.yaml` file for configuration

2. **Set environment variables in Render**
   - For the backend service:
     - `MONGO_URI`: Your MongoDB connection string
     - `JWT_SECRET`: A secure random string
     - `CLIENT_URL`: Your frontend URL (e.g., `https://scribble-frontend.onrender.com`)
   - For the frontend service:
     - `REACT_APP_BACKEND_URL`: Your backend URL (e.g., `https://scribble-backend.onrender.com`)

3. **Deploy**
   - Render will automatically build and deploy both services
   - The frontend will be available at the generated URL
   - The backend will be available at its generated URL

## 🎮 How to Play

1. **Register/Login** - Create an account or sign in
2. **Create Room** - Host creates a new game room with custom settings
3. **Join Room** - Players join using the room code
4. **Game Settings** (Host only):
   - Set round duration (30s - 2 minutes)
   - Set total rounds (3, 5, 8, or 10 rounds)
   - Add custom words for players to draw
5. **Start Game** - Host starts when ready
6. **Draw & Guess**:
   - Drawer selects a word and draws it
   - Other players guess in the chat
   - Points awarded for correct guesses
7. **View Stats** - Check your performance on the dashboard

## 📁 Project Structure

```
game/
├── client/                # React frontend
│   ├── public/           # Static assets
│   ├── src/
│   │   ├── components/   # React components
│   │   ├── context/      # Context providers
│   │   └── index.js      # Entry point
│   └── package.json
│
└── server/               # Node.js backend
    ├── config/          # Configuration files
    ├── game/            # Game logic
    ├── models/          # Mongoose models
    ├── routes/          # API routes
    ├── socket/          # Socket.IO handlers
    ├── index.js         # Server entry point
    └── package.json
```

## 🎯 Game Features

### Host Controls
- Customize round duration
- Set number of rounds
- Add custom words
- Start/stop game

### Drawing Tools
- Multiple colors
- Brush size options
- Clear canvas
- Real-time synchronization

### Chat System
- Room chat for guessing
- Private messaging between players
- Notification dots for unread messages
- Chat disabled for drawer

### Scoring System
- Points based on guess speed
- Drawer earns points for correct guesses
- Round and game leaderboards

### Statistics Dashboard
- Total games played
- Win rate
- Total/correct guesses
- Guess accuracy percentage

## 🔒 Security Features

- JWT-based authentication
- Password hashing with bcrypt
- Protected API routes
- Input validation
- CORS configuration

## 🌐 API Endpoints

### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login user

### User
- `GET /api/user/stats` - Get user statistics (protected)

### Socket Events
- `create-room` - Create game room
- `join-room` - Join game room
- `start-game` - Start game (host only)
- `add-custom-word` - Add custom word (host only)
- `draw-data` - Send drawing data
- `guess` - Submit guess
- `private-message` - Send private message

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## 📝 License

This project is open source and available under the [MIT License](LICENSE).

## 👤 Author

**Shubham**
- GitHub: [@Shubham15986](https://github.com/Shubham15986)

## 🙏 Acknowledgments

- Inspired by Skribbl.io
- Built with React and Socket.IO
- MongoDB Atlas for database hosting

## 📧 Contact

For questions or feedback, please open an issue on GitHub.

---

Made with ❤️ by Shubham
