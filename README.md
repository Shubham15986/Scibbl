# Scibbl 🎨

Scibbl is a real-time multiplayer drawing and guessing game inspired by Skribbl.io. Gather your friends, unleash your creativity, and compete to guess the drawings the fastest!

## 🚀 Features

*   **Real-time Multiplayer:** Instantaneous drawing updates and chat messages powered by WebSockets (Socket.IO).
*   **User Authentication:** Secure registration and login system using JWT (JSON Web Tokens) and bcrypt password hashing.
*   **Interactive Canvas:** Smooth drawing experience built into the browser.
*   **Live Chat & Guessing:** Real-time chat where correct guesses are automatically detected and rewarded.
*   **Responsive Design:** Beautiful, modern UI built with React and Tailwind CSS.

## 🛠️ Tech Stack

**Frontend (`/client`)**
*   **React:** UI library for building the interactive interfaces.
*   **Tailwind CSS:** Utility-first CSS framework for rapid and responsive styling.
*   **Socket.IO Client:** Handles real-time, bi-directional communication with the server.
*   **React Router:** For seamless navigation between login, registration, and game rooms.

**Backend (`/server`)**
*   **Node.js & Express:** Fast and minimalist web framework for the backend REST API.
*   **Socket.IO:** Manages WebSocket connections for real-time game state synchronization.
*   **MongoDB & Mongoose:** NoSQL database for securely storing user accounts and data.
*   **JWT (JSON Web Tokens):** For stateless and secure user sessions.

## 💻 Local Development Setup

To run this project locally, you will need **Node.js** and **MongoDB** installed on your machine.

### 1. Clone the repository
```bash
git clone https://github.com/Shubham15986/Scibbl.git
cd Scibbl
```

### 2. Backend Setup
1. Open a terminal and navigate to the server directory:
   ```bash
   cd server
   ```
2. Install backend dependencies:
   ```bash
   npm install
   ```
3. Create a `.env` file in the `server` directory and add your MongoDB connection string and a secret key:
   ```env
   PORT=3001
   MONGO_URI=your_mongodb_connection_string
   JWT_SECRET=your_super_secret_jwt_key
   CLIENT_URL=http://localhost:3000
   ```
4. Start the backend development server:
   ```bash
   npm run dev
   ```

### 3. Frontend Setup
1. Open a new terminal window and navigate to the client directory:
   ```bash
   cd client
   ```
2. Install frontend dependencies:
   ```bash
   npm install
   ```
3. Create a `.env` file in the `client` directory to point to your local backend:
   ```env
   REACT_APP_BACKEND_URL=http://localhost:3001
   ```
4. Start the React development server:
   ```bash
   npm start
   ```

### 4. Play!
Open your browser and navigate to `http://localhost:3000`. You can open multiple incognito tabs to simulate different players joining the same game.

## 🌐 Deployment Environment Variables

If you are deploying this project to production (e.g., Vercel, Render), make sure to configure the following environment variables on your hosting providers:

**Backend (e.g., Render/Railway):**
*   `MONGO_URI`: Your production MongoDB connection string.
*   `JWT_SECRET`: A strong, random string for JWT signing.
*   `CLIENT_URL`: The deployed URL of your frontend (e.g., `https://your-frontend.vercel.app`). *Make sure there is no trailing slash!*

**Frontend (e.g., Vercel/Netlify):**
*   `REACT_APP_BACKEND_URL`: The deployed URL of your backend.

---
*Created by Shubham15986*
