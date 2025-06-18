
import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom'; // 1. IMPORT LINK
import { useSocket } from '../context/SocketContext';
import { useAuth } from '../context/AuthContext';

const Home = () => {
  const [roomId, setRoomId] = useState('');
  const [avatar, setAvatar] = useState('😀');
  const socket = useSocket();
  const navigate = useNavigate();
  const { user, logout } = useAuth(); // user object contains { id, username }

  useEffect(() => {
    if (!socket) return;

    const onRoomCreated = (room) => {
      navigate(`/room/${room.roomId}`, { state: { room } });
    };

    const onRoomJoined = (room) => {
      navigate(`/room/${room.roomId}`, { state: { room } });
    };

    const onError = (message) => {
      alert(`Error: ${message}`);
    };

    socket.on('room-created', onRoomCreated);
    socket.on('room-joined', onRoomJoined);
    socket.on('error', onError);

    return () => {
      socket.off('room-created', onRoomCreated);
      socket.off('room-joined', onRoomJoined);
      socket.off('error', onError);
    };
  }, [socket, navigate]);

  const handleCreateRoom = () => {

    socket.emit('create-room', { 
      username: user.username, 
      avatar, 
      userId: user.id 
    });
  };

  const handleJoinRoom = () => {
    if (roomId.trim() === '') {
      alert('Please enter a Room ID');
      return;
    }

    socket.emit('join-room', { 
      roomId: roomId.toUpperCase(), 
      username: user.username, 
      avatar,
      userId: user.id
    });
  };

  return (
    <div className="flex items-center justify-center min-h-screen">
      <div className="bg-gray-800 p-8 rounded-lg shadow-xl w-full max-w-md">
        
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-bold">Welcome, {user.username}!</h1>
          <button
            onClick={logout}
            className="bg-red-600 hover:bg-red-700 text-white font-bold py-1 px-3 rounded text-sm"
          >
            Logout
          </button>
        </div>

        {/* 3. ADD DASHBOARD LINK */}
        <div className="text-center mb-4">
          <Link 
            to="/dashboard" 
            className="text-blue-400 hover:underline"
          >
            View My Dashboard
          </Link>
        </div>

        <div className="mb-6">
          <label className="block text-sm font-medium mb-1">Your Avatar</label>
          <input
            type="text"
            value={avatar}
            onChange={(e) => setAvatar(e.target.value)}
            className="w-full p-2 bg-gray-700 rounded border border-gray-600 focus:outline-none focus:border-blue-500"
            placeholder="Enter an emoji (e.g., 😀)"
            maxLength={2}
          />
        </div>

        <div className="mb-6">
          <button
            onClick={handleCreateRoom}
            className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded transition duration-200"
          >
            Create Room
          </button>
        </div>

        <div className="relative flex py-3 items-center">
          <div className="flex-grow border-t border-gray-600"></div>
          <span className="flex-shrink mx-4 text-gray-400">OR</span>
          <div className="flex-grow border-t border-gray-600"></div>
        </div>

        <div className="flex space-x-2">
          <input
            type="text"
            value={roomId}
            onChange={(e) => setRoomId(e.target.value.toUpperCase())}
            className="w-3/4 p-2 bg-gray-700 rounded border border-gray-600 focus:outline-none focus:border-green-500"
            placeholder="Enter Room ID"
          />
          <button
            onClick={handleJoinRoom}
            className="w-1/4 bg-green-600 hover:bg-green-700 text-white font-bold py-2 px-4 rounded transition duration-200"
          >
            Join
          </button>
        </div>
      </div>
    </div>
  );
};

export default Home;
