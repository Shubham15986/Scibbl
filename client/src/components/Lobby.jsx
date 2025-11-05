
import React, { useState, useEffect } from 'react';
import { useSocket } from '../context/SocketContext';

const Lobby = ({ roomInfo }) => {
  const socket = useSocket();
  const [customWordInput, setCustomWordInput] = useState('');
  const [customWords, setCustomWords] = useState([]);
  const [errorMessage, setErrorMessage] = useState('');
  
  // --- NEW STATE for game settings ---
  const [roundDuration, setRoundDuration] = useState(90); // Default 90 seconds
  const [totalRounds, setTotalRounds] = useState(3);      // Default 3 rounds

  const isHost = socket.id === roomInfo.host;

  useEffect(() => {

    const handleCustomWordAdded = ({ customWords }) => {
      setCustomWords(customWords);
      setErrorMessage('');
    };

    const handleError = (message) => {
      setErrorMessage(message);
      setTimeout(() => setErrorMessage(''), 3000);
    };

    socket.on('custom-word-added', handleCustomWordAdded);
    socket.on('error', handleError);

    return () => {
      socket.off('custom-word-added', handleCustomWordAdded);
      socket.off('error', handleError);
    };
  }, [socket]);

  const handleAddWord = (e) => {
    e.preventDefault();
    const word = customWordInput.trim();
    
    if (!word) {
      setErrorMessage('Please enter a word');
      return;
    }

    if (word.length < 3) {
      setErrorMessage('Word must be at least 3 characters long');
      return;
    }

    socket.emit('add-custom-word', { roomId: roomInfo.roomId, word });
    setCustomWordInput('');
  };

  const handleRemoveWord = (word) => {
    socket.emit('remove-custom-word', { roomId: roomInfo.roomId, word });
  };

  const handleStartGame = () => {
    if (roomInfo.players.length < 2) {
      const confirmStart = window.confirm('You need at least 2 players to start the game. Start anyway for testing?');
      if (!confirmStart) return;
    }

    socket.emit('start-game', { 
      roomId: roomInfo.roomId,
      settings: {
        roundDuration: roundDuration,
        totalRounds: totalRounds
      }
    });
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 max-w-5xl mx-auto p-4">
      
      <div className="bg-gray-800 bg-opacity-90 p-6 rounded-lg shadow-lg">
        <h2 className="text-2xl font-semibold mb-4 border-b border-gray-700 pb-2">
          Players ({roomInfo.players.length})
        </h2>
        <ul className="space-y-3">
          {roomInfo.players.map((player) => (
            <li key={player.id} className="flex items-center bg-gray-700 bg-opacity-80 p-3 rounded">
              <span className="text-3xl mr-3">{player.avatar}</span>
              <span className="font-medium">{player.username}</span>
              {player.id === roomInfo.host && (
                <span className="ml-auto text-xs bg-yellow-500 text-black font-bold py-0.5 px-2 rounded">
                  HOST
                </span>
              )}
            </li>
          ))}
        </ul>
      </div>

      <div className="bg-gray-800 bg-opacity-90 p-6 rounded-lg shadow-lg flex flex-col">
        <h2 className="text-2xl font-semibold mb-4 text-center">Ready to Play?</h2>
        
        {/* Host Controls - Custom Words */}
        {isHost && (
          <div className="mb-6 flex-grow">
            <h3 className="text-lg font-semibold mb-3 text-blue-400">🎨 Add Custom Words</h3>
            
            {/* Error Message */}
            {errorMessage && (
              <div className="bg-red-500 bg-opacity-20 border border-red-500 text-red-300 px-3 py-2 rounded mb-3 text-sm">
                {errorMessage}
              </div>
            )}
            
            {/* Add Word Form */}
            <form onSubmit={handleAddWord} className="flex gap-2 mb-4">
              <input
                type="text"
                value={customWordInput}
                onChange={(e) => setCustomWordInput(e.target.value)}
                placeholder="Enter a word..."
                className="flex-grow px-3 py-2 bg-gray-700 border border-gray-600 rounded focus:outline-none focus:border-blue-500 text-white"
                maxLength={20}
              />
              <button
                type="submit"
                className="bg-blue-600 hover:bg-blue-700 text-white font-bold px-4 py-2 rounded transition duration-200"
              >
                Add
              </button>
            </form>

            {/* Custom Words List */}
            {customWords.length > 0 && (
              <div className="bg-gray-900 bg-opacity-50 p-3 rounded max-h-40 overflow-y-auto">
                <p className="text-xs text-gray-400 mb-2">Custom Words ({customWords.length}):</p>
                <div className="flex flex-wrap gap-2">
                  {customWords.map((word, index) => (
                    <div
                      key={index}
                      className="bg-blue-600 bg-opacity-30 border border-blue-500 px-3 py-1 rounded-full text-sm flex items-center gap-2"
                    >
                      <span>{word}</span>
                      <button
                        onClick={() => handleRemoveWord(word)}
                        className="text-red-400 hover:text-red-300 font-bold"
                        title="Remove word"
                      >
                        ×
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}
            
            {customWords.length === 0 && (
              <p className="text-gray-500 text-sm italic text-center py-2">
                No custom words added yet. Default words will be used.
              </p>
            )}
            
            {/* --- NEW: Game Settings --- */}
            <div className="mt-6 pt-4 border-t border-gray-700">
              <h3 className="text-lg font-semibold mb-3 text-green-400">⚙️ Game Settings</h3>
              
              <div className="space-y-3">
                {/* Round Duration */}
                <div>
                  <label htmlFor="round-duration" className="block text-sm font-medium text-gray-300 mb-1">
                    Round Time:
                  </label>
                  <select
                    id="round-duration"
                    value={roundDuration}
                    onChange={e => setRoundDuration(Number(e.target.value))}
                    className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded focus:outline-none focus:border-green-500 text-white"
                  >
                    <option value={30}>30 Seconds</option>
                    <option value={60}>60 Seconds</option>
                    <option value={90}>90 Seconds</option>
                    <option value={120}>2 Minutes</option>
                  </select>
                </div>

                {/* Total Rounds */}
                <div>
                  <label htmlFor="total-rounds" className="block text-sm font-medium text-gray-300 mb-1">
                    Total Rounds:
                  </label>
                  <select
                    id="total-rounds"
                    value={totalRounds}
                    onChange={e => setTotalRounds(Number(e.target.value))}
                    className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded focus:outline-none focus:border-green-500 text-white"
                  >
                    <option value={3}>3 Rounds</option>
                    <option value={5}>5 Rounds</option>
                    <option value={8}>8 Rounds</option>
                    <option value={10}>10 Rounds</option>
                  </select>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Non-host message */}
        {!isHost && (
          <p className="text-gray-400 text-center mb-6">
            Draw and guess words with your friends!
          </p>
        )}

        {/* Start Game Button */}
        {isHost ? (
          <button
            onClick={handleStartGame}
            className="w-full bg-green-600 hover:bg-green-700 text-white font-bold py-4 px-6 rounded-lg text-xl transition duration-200 shadow-lg"
          >
            Start Game
          </button>
        ) : (
          <p className="text-center text-gray-400 text-lg p-4 bg-gray-900 bg-opacity-70 rounded-lg">
            Waiting for the host to start the game...
          </p>
        )}
      </div>
    </div>
  );
};

export default Lobby;
