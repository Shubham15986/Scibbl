
import React from 'react';

import { useSocket } from '../context/SocketContext'; // Import useSocket

const Scoreboard = ({ players, currentDrawerId, setChatTarget, chatTarget, unreadMessages }) => {
  const socket = useSocket(); // Get our own socket info
  const sortedPlayers = [...players].sort((a, b) => b.score - a.score);

  return (
    <div>
      <h2 className="text-2xl font-semibold mb-4 border-b border-gray-700 pb-2">
        Players
      </h2>
      <ul className="space-y-3">
        
        {/* 1. ADD A "ROOM CHAT" BUTTON */}
        <li
          className={`flex items-center p-3 rounded cursor-pointer transition-all
            ${!chatTarget ? 'bg-blue-600' : 'bg-gray-600 hover:bg-gray-500'}
          `}
          onClick={() => setChatTarget(null)} // Set target to null
        >
          <span className="text-3xl mr-3">💬</span>
          <span className="font-bold">Room Chat</span>
        </li>
        
        <hr className="border-gray-600 my-3" />

        {/* 2. MAKE PLAYERS CLICKABLE */}
        {sortedPlayers.map((player) => {
          const isMe = player.id === socket.id;
          const isTarget = player.id === chatTarget?.id;

          const hasUnread = unreadMessages?.includes(player.id);

          return (
            <li
              key={player.id}
              className={`flex items-center bg-gray-700 p-3 rounded transition-all
                ${isMe ? 'opacity-60 cursor-default' : 'cursor-pointer hover:bg-gray-600'}
                ${isTarget ? 'ring-2 ring-blue-500' : ''}
              `}

              onClick={() => !isMe && setChatTarget({ id: player.id, username: player.username })}
            >
              <span className="text-3xl mr-3">{player.avatar}</span>
              <div className="flex-grow">
                <span className="font-medium">{player.username} {isMe && "(You)"}</span>
                {player.id === currentDrawerId && (
                  <span className="ml-2 text-xs text-blue-300">(Drawing...)</span>
                )}
              </div>
              <span className="text-xl font-bold mr-3">{player.score}</span>
              
              {/* 3. RENDER THE NOTIFICATION DOT */}
              {hasUnread && (
                <span className="w-3 h-3 bg-red-500 rounded-full animate-pulse"></span>
              )}
            </li>
          );
        })}
      </ul>
    </div>
  );
};

export default Scoreboard;

