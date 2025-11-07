
import React, { useState, useEffect } from 'react';
import { useSocket } from '../context/SocketContext';
import Scoreboard from './Scoreboard';
import Canvas from './Canvas';
import Chat from './Chat';

const DRAW_TIME_SECONDS = 90; 

const Game = ({ roomInfo, setRoomInfo }) => {
  const socket = useSocket();
  const [messages, setMessages] = useState([]); // This is for ROOM chat
  const [currentDrawer, setCurrentDrawer] = useState(null);
  const [isMyTurn, setIsMyTurn] = useState(false);
  const [wordChoices, setWordChoices] = useState([]);
  const [wordToGuess, setWordToGuess] = useState('');
  const [timer, setTimer] = useState(DRAW_TIME_SECONDS);
  const [turnEndInfo, setTurnEndInfo] = useState(null);
  const [hint, setHint] = useState('');
  
  // --- 1. NEW STATE FOR ADVANCED CHAT ---

  const [chatTarget, setChatTarget] = useState(null);

  const [privateMessages, setPrivateMessages] = useState({});

  const [unreadMessages, setUnreadMessages] = useState([]); // Stores an array of socket IDs

  useEffect(() => {
    const onNewMessage = (message) => {
      setMessages((prev) => [...prev, { type: 'guess', ...message }]);
    };
    const onPlayerGuessed = ({ username }) => {
      setMessages((prev) => [
        ...prev,
        { type: 'notification', text: `${username} guessed the word!` },
      ]);
    };
    const onCorrectGuess = ({ message }) => {
      setMessages((prev) => [
        ...prev,
        { type: 'self-notification', text: message },
      ]);
    };

    // --- 2. NEW LISTENER FOR HINTS ---
    const onHintUpdate = (displayWord) => {
      setHint(displayWord);
    };

    // --- MODIFIED onNewDrawer ---
    const onNewDrawer = ({ username, avatar }) => {
            setWordToGuess(''); // Clear previous word

      if (username === roomInfo.players.find(p => p.id === socket.id)?.username) {

        setIsMyTurn(true);
      } else {

        setIsMyTurn(false);
        setWordChoices([]); // Clear choices *only* if we are a guesser
      }

      setCurrentDrawer({ username, avatar });
      setMessages((prev) => [
        ...prev,
        { type: 'notification', text: `${username} is now drawing.` },
      ]);
      setTurnEndInfo(null);
      setHint(''); // Clear old hint
    };
    
    // --- MODIFIED onYourTurn ---
    const onYourTurn = ({ wordChoices }) => {
            setIsMyTurn(true);
      setWordChoices(wordChoices); // This will now correctly show the modal
      setMessages([]);
      setHint(''); // Clear hint for drawer
    };

    const onUpdateScoreboard = (players) => {
      setRoomInfo((prev) => ({ ...prev, players }));
    };

    const onTimerUpdate = (value) => {
      setTimer(value);
    };

    const onTurnEnd = ({ word, reason }) => {
      setTurnEndInfo({ word, reason });
      setTimeout(() => {
        setTurnEndInfo(null);
      }, 4000);
    };

    // --- 2. MODIFIED: LISTENER FOR PRIVATE MESSAGES ---
    const onNewPrivateMessage = ({ from, to, username, message }) => {

      const partnerId = from === socket.id ? to : from;
      const msg = { username, message, timestamp: Date.now() };

      if (from === partnerId && chatTarget?.id !== partnerId) {

        setUnreadMessages(prev => [...new Set([...prev, partnerId])]); // Use Set to avoid duplicates
      } else {

        setUnreadMessages(prev => prev.filter(id => id !== partnerId));
      }

      setPrivateMessages(prev => ({
        ...prev,
        [partnerId]: [...(prev[partnerId] || []), msg]
      }));
    };

    socket.on('new-message', onNewMessage);
    socket.on('player-guessed', onPlayerGuessed);
    socket.on('correct-guess', onCorrectGuess);
    socket.on('new-drawer', onNewDrawer);
    socket.on('your-turn-to-draw', onYourTurn); // Changed to 'your-turn-to-draw'
    socket.on('update-scoreboard', onUpdateScoreboard);
    socket.on('timer-update', onTimerUpdate);
    socket.on('turn-end', onTurnEnd);
    // --- 3. REGISTER NEW LISTENER ---
    socket.on('hint-update', onHintUpdate);
    socket.on('new-private-message', onNewPrivateMessage);

    // --- 4. CLEANUP ---
    return () => {
      socket.off('new-message', onNewMessage);
      socket.off('player-guessed', onPlayerGuessed);
      socket.off('correct-guess', onCorrectGuess);
      socket.off('new-drawer', onNewDrawer);
      socket.off('your-turn-to-draw', onYourTurn); // Changed to 'your-turn-to-draw'
      socket.off('update-scoreboard', onUpdateScoreboard);
      socket.off('timer-update', onTimerUpdate);
      socket.off('turn-end', onTurnEnd);

      socket.off('hint-update', onHintUpdate);
      socket.off('new-private-message', onNewPrivateMessage);

    };
  }, [socket, setRoomInfo, chatTarget]);

  // --- 3. NEW useEffect TO CLEAR DOTS ON CLICK ---
  useEffect(() => {
    if (chatTarget) {

      setUnreadMessages(prev => prev.filter(id => id !== chatTarget.id));
    }
  }, [chatTarget]); // Runs whenever chatTarget changes

  const handleWordChosen = (word) => {
    socket.emit('word-chosen', { roomId: roomInfo.roomId, word });
    setWordToGuess(word);
    setWordChoices([]);
  };

  const handleExitGame = () => {
    if (window.confirm('Are you sure you want to exit the game?')) {
      socket.emit('leave-room', { roomId: roomInfo.roomId });

      window.location.href = '/';
    }
  };

  return (
    <>
      {/* Exit Button - Fixed Position */}
      <div className="absolute top-4 right-4 z-40">
        <button
          onClick={handleExitGame}
          className="bg-red-600 hover:bg-red-700 text-white font-bold py-2 px-4 rounded-lg shadow-lg transition-colors flex items-center gap-2"
        >
          <span>🚪</span>
          <span>Exit Game</span>
        </button>
      </div>

      {/* ... (Word Choice Modal) ... */}
      {wordChoices.length > 0 && (
        <div className="absolute inset-0 bg-black bg-opacity-75 flex flex-col items-center justify-center z-50">
          <h2 className="text-3xl font-bold mb-6">Choose a word to draw:</h2>
          <div className="flex space-x-4">
            {wordChoices.map((word) => (
              <button
                key={word}
                onClick={() => handleWordChosen(word)}
                className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-6 rounded text-xl"
              >
                {word}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* ... (Turn End Info Modal) ... */}
      {turnEndInfo && (
        <div className="absolute inset-0 bg-black bg-opacity-75 flex flex-col items-center justify-center z-50">
          <h2 className="text-3xl font-bold mb-4">
            {turnEndInfo.reason === 'all-guessed' ? '🎉 Everyone Guessed!' : "⏰ Time's Up!"}
          </h2>
          <p className="text-2xl">The word was: 
            <span className="font-bold text-yellow-400 ml-2">{turnEndInfo.word}</span>
          </p>
        </div>
      )}

      {/* --- Main Game Layout --- */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-4 max-w-7xl mx-auto p-2 sm:p-4">
        
        {/* Host Info Banner - Full Width */}
        {roomInfo.hostUsername && (
          <div className="lg:col-span-4 bg-gradient-to-r from-purple-900 to-blue-900 p-3 rounded-lg shadow-lg order-1">
            <div className="flex items-center justify-center text-center">
              <span className="text-2xl mr-2">👑</span>
              <span className="font-bold text-base sm:text-lg">Host: {roomInfo.hostUsername}</span>
              <span className="text-xs sm:text-sm ml-3 text-gray-300 hidden sm:block">Room: {roomInfo.roomId}</span>
            </div>
          </div>
        )}
        
        {/* --- Scoreboard (Left Column) --- */}
        <div className="lg:col-span-1 bg-gray-800 p-4 rounded-lg shadow-lg order-3 lg:order-1">
          <Scoreboard
            players={roomInfo.players}
            currentDrawerId={currentDrawer ? currentDrawer.id : null}
            setChatTarget={setChatTarget}
            chatTarget={chatTarget}
            unreadMessages={unreadMessages}
          />
        </div>

        {/* --- Center Column: Canvas & Info --- */}
        <div className="lg:col-span-2 order-1 lg:order-2">
          {/* Info Bar */}
          <div className="bg-gray-800 p-2 text-center rounded-t-lg flex flex-col sm:flex-row justify-between items-center gap-2">
            <div className="w-full sm:w-1/3 text-center sm:text-left">
              <span className="text-base sm:text-lg">Round {roomInfo.currentRound}/{roomInfo.maxRounds}</span>
            </div>
            
            <h2 className="text-xl font-bold w-full sm:w-1/3 order-first sm:order-none">
              {isMyTurn ? (
                <span className="text-yellow-400 tracking-widest">{wordToGuess}</span>
              ) : (
                <div className="word-hint-container">
                  {hint.split('').map((char, index) => (
                    <span key={index} className="letter-box">
                      {char}
                    </span>
                  ))}
                </div>
              )}
            </h2>
            
            <div className="w-full sm:w-1/3 text-center sm:text-right">
              <span className="text-2xl font-bold text-yellow-400">{timer}</span>
            </div>
          </div>
          <Canvas 
            roomId={roomInfo.roomId} 
            isMyTurn={isMyTurn} 
          />
        </div>

        {/* --- Chat (Right Column) --- */}
        <div className="lg:col-span-1 bg-gray-800 p-4 rounded-lg shadow-lg order-2 lg:order-3">
          <Chat
            roomId={roomInfo.roomId}
            messages={messages}
            isMyTurn={isMyTurn}
            chatTarget={chatTarget}
            setChatTarget={setChatTarget}
            privateMessages={privateMessages[chatTarget?.id] || []}
            setPrivateMessages={setPrivateMessages}
          />
        </div>

      </div>
    </>
  );
};

export default Game;
