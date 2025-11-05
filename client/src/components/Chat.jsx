import React, { useState, useEffect, useRef } from 'react';
import { useSocket } from '../context/SocketContext';

const Chat = ({ roomId, messages, isMyTurn, chatTarget, setChatTarget, privateMessages, setPrivateMessages }) => {
  const socket = useSocket();
  const username = localStorage.getItem('username') || 'Player'; 
  const [guess, setGuess] = useState('');
  const messagesEndRef = useRef(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, privateMessages]); // Trigger on both message types

  const handleSubmit = (e) => {
    e.preventDefault();

    if (guess.trim() === '' || (isMyTurn && !chatTarget)) return;

    if (chatTarget) {
      // --- SENDING A PRIVATE MESSAGE ---

      const myMessage = {
        username: 'You',
        message: guess,
        fromMe: true
      };
      
      setPrivateMessages(prev => ({
        ...prev,
        [chatTarget.id]: [...(prev[chatTarget.id] || []), myMessage]
      }));

      socket.emit('private-message', {
        toSocketId: chatTarget.id,
        username: username,
        message: guess
      });
    } else {
      // --- SENDING A ROOM GUESS ---
      socket.emit('guess', {
        roomId,
        username,
        message: guess,
      });
    }
    setGuess('');
  };

  const renderMessage = (msg, index) => {

    if (!msg.type) {
      return (
        <div key={index} className="mb-2">
          <span className="font-semibold text-purple-300">{msg.username}: </span>
          <span className="text-gray-200">{msg.message}</span>
        </div>
      );
    }

    switch (msg.type) {
      case 'guess':
        return (
          <div key={index} className="mb-2">
            <span className="font-semibold text-blue-300">{msg.username}: </span>
            <span>{msg.message}</span>
          </div>
        );
      case 'notification':
        return (
          <div key={index} className="mb-2 text-green-400 italic">
            {msg.text}
          </div>
        );
      case 'self-notification':
        return (
          <div key={index} className="mb-2 text-yellow-400 font-bold">
            {msg.text}
          </div>
        );
      default:
        return null;
    }
  };

  const messagesToShow = chatTarget ? privateMessages : messages;

  return (
    <div className="h-full flex flex-col">
      {/* 4. DYNAMIC HEADER */}
      <h2 className="text-2xl font-semibold mb-4 border-b border-gray-700 pb-2">
        {chatTarget ? (
          <div className="flex justify-between items-center">
            <span className="truncate">Chat with {chatTarget.username}</span>
            <button 
              onClick={() => setChatTarget(null)} 
              className="text-xs bg-red-600 px-2 py-0.5 rounded hover:bg-red-700 ml-2"
            >
              X
            </button>
          </div>
        ) : (
          "Room Chat & Guess"
        )}
      </h2>
      
      {/* 5. RENDER THE CORRECT MESSAGE LIST */}
      <div className="flex-grow bg-gray-900 rounded p-3 overflow-y-auto h-48 md:h-64 lg:h-96">
        {messagesToShow.map(renderMessage)}
        <div ref={messagesEndRef} />
      </div>
      
      {/* 6. DYNAMIC FORM & PLACEHOLDER */}
      <form onSubmit={handleSubmit} className="mt-4">
        <input
          type="text"
          value={guess}
          onChange={(e) => setGuess(e.target.value)}

          disabled={isMyTurn && !chatTarget}
          className="w-full p-2 bg-gray-700 rounded border border-gray-600 focus:outline-none focus:border-blue-500"
          placeholder={
            chatTarget 
              ? `Private message to ${chatTarget.username}...`
              : (isMyTurn ? "You're drawing! (Room chat disabled)" : "Type your guess...")
          }
        />
      </form>
    </div>
  );
};

export default Chat;
