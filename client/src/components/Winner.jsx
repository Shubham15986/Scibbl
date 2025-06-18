
import React from 'react';
import { useNavigate } from 'react-router-dom';

const Winner = ({ roomInfo }) => {
  const navigate = useNavigate();
  
  const finalScores = [...roomInfo.players].sort((a, b) => b.score - a.score);

  return (
    <div className="max-w-2xl mx-auto text-center p-8 bg-gray-800 bg-opacity-90 rounded-lg shadow-xl">
      <h1 className="text-4xl font-bold text-yellow-400 mb-6">Game Over!</h1>
      
      <div className="space-y-4">
        {finalScores.map((player, index) => (
          <div
            key={player.id}
            className={`flex items-center p-4 rounded-lg
              ${index === 0 ? 'bg-yellow-500 text-black' : ''}
              ${index === 1 ? 'bg-gray-400 text-black' : ''}
              ${index === 2 ? 'bg-yellow-700 text-white' : ''}
              ${index > 2 ? 'bg-gray-700' : ''}`}
          >
            <span className="text-4xl font-bold w-12">
              {index === 0 ? '🏆' : index === 1 ? '🥈' : index === 2 ? '🥉' : `${index + 1}.`}
            </span>
            <span className="text-3xl mr-4">{player.avatar}</span>
            <span className="text-2xl font-semibold flex-grow text-left">{player.username}</span>
            <span className="text-2xl font-bold">{player.score} pts</span>
          </div>
        ))}
      </div>

      <button
        onClick={() => navigate('/')}
        className="mt-10 bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-6 rounded text-lg transition duration-200"
      >
        Back to Home
      </button>
    </div>
  );
};

export default Winner;
