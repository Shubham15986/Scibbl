
import React, { useEffect, useState } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import { useSocket } from '../context/SocketContext';
import Lobby from './Lobby';
import Game from './Game';
import Winner from './Winner';

const Room = () => {
  const { roomId } = useParams();
  const socket = useSocket();
  const navigate = useNavigate();
  const location = useLocation();

  const [roomInfo, setRoomInfo] = useState(location.state?.room || null);
  const [gameState, setGameState] = useState(location.state?.room?.gameState || 'lobby');

  useEffect(() => {
    const onError = (message) => {
      alert(`Error: ${message}`);
      navigate('/');
    };

    const onHostLeft = (message) => {
      alert(message);
      navigate('/');
    };
    
    const onNewHost = ({ username }) => {
      alert(`${username} is the new host.`);
    };

    const onPlayerJoined = (newPlayer) => {
      setRoomInfo((prev) => {
        if (!prev) return null; 
        return {
          ...prev,
          players: [...prev.players, newPlayer],
        };
      });
    };

    const onPlayerLeft = ({ username, players }) => {
      alert(`${username} left the game.`);
      setRoomInfo((prev) => ({
        ...prev,
        players: players,
      }));
    };

    const onGameStarted = () => {
                        setGameState('drawing');
    };
    
    const onGameOver = ({ players }) => {
      setRoomInfo((prev) => ({
        ...prev,
        players: players,
      }));
      setGameState('end-game');
    };

    socket.on('error', onError);
    socket.on('host-left', onHostLeft);
    socket.on('new-host', onNewHost);
    socket.on('player-joined', onPlayerJoined);
    socket.on('player-left', onPlayerLeft);
    socket.on('game-started', onGameStarted);
    socket.on('game-over', onGameOver);
    
    return () => {
      socket.off('error', onError);
      socket.off('host-left', onHostLeft);
      socket.off('new-host', onNewHost);
      socket.off('player-joined', onPlayerJoined);
      socket.off('player-left', onPlayerLeft);
      socket.off('game-started', onGameStarted);
      socket.off('game-over', onGameOver);
    };
  }, [socket, navigate]);

  if (!roomInfo) {
    return <div className="text-center p-10">Loading room data...</div>;
  }

  const renderGameState = () => {
    switch (gameState) {
      case 'lobby':
        return <Lobby roomInfo={roomInfo} />;
      case 'drawing':
        return <Game roomInfo={roomInfo} setRoomInfo={setRoomInfo} />;
      case 'end-game':
        return <Winner roomInfo={roomInfo} />;
      default:
        return <div className="text-center p-10">Loading...</div>;
    }
  };

  return (
    <div className="flex flex-col min-h-screen">
      <header className="bg-gray-800 bg-opacity-90 p-4 shadow-md">
        <div className="flex items-center justify-center gap-4">
          <img src="/logo.gif" alt="Skribbl.io" className="h-12" />
          <div className="text-center">
            <h1 className="text-2xl font-bold">
              Room: <span className="text-yellow-400">{roomId}</span>
            </h1>
            <p className="text-gray-400 text-sm">
              Share this ID with your friends!
            </p>
          </div>
        </div>
      </header>

      <main className="flex-grow p-4 md:p-8">
        {renderGameState()}
      </main>
    </div>
  );
};

export default Room;
