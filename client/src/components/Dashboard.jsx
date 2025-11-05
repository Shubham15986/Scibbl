
import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useSocket } from '../context/SocketContext';
import { Link } from 'react-router-dom';

const Dashboard = () => {
  const [stats, setStats] = useState(null);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(true);
  const { token, user } = useAuth(); // Get token for auth header
  const socket = useSocket(); // Get socket for real-time updates

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const res = await fetch(`${process.env.REACT_APP_BACKEND_URL || 'http://localhost:3001'}/api/user/stats`, {
          headers: {
            'x-auth-token': token, // Send the token
          },
        });

        if (!res.ok) {
          throw new Error('Failed to fetch stats');
        }
        
        const data = await res.json();
        setStats(data);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, [token]);

  useEffect(() => {
    if (!socket) return;

    const handleStatsUpdate = (data) => {
      setStats(prevStats => ({
        ...prevStats,
        totalGuesses: data.totalGuesses || prevStats?.totalGuesses || 0,
        correctGuesses: data.correctGuesses || prevStats?.correctGuesses || 0,
        gamesPlayed: data.gamesPlayed || prevStats?.gamesPlayed || 0,
        wins: data.wins || prevStats?.wins || 0,
        totalScore: data.totalScore || prevStats?.totalScore || 0,
      }));
    };

    socket.on('stats-updated', handleStatsUpdate);

    socket.emit('get-my-stats');

    return () => {
      socket.off('stats-updated', handleStatsUpdate);
    };
  }, [socket]);

  const calculateAccuracy = () => {
    if (!stats || stats.totalGuesses === 0) {
      return '0.0%';
    }
    const accuracy = (stats.correctGuesses / stats.totalGuesses) * 100;
    return `${accuracy.toFixed(1)}%`;
  };

  if (loading) {
    return <div className="text-center p-10">Loading stats...</div>;
  }
  
  if (error) {
    return <div className="text-center p-10 text-red-500">Error: {error}</div>;
  }

  return (
    <div className="flex items-center justify-center min-h-screen">
      <div className="bg-gray-800 p-8 rounded-lg shadow-xl w-full max-w-4xl">
        <h1 className="text-3xl font-bold text-center mb-8">
          {user.username}'s Dashboard
        </h1>
        
        {stats ? (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-center">
            <div className="bg-gray-700 p-6 rounded-lg">
              <h2 className="text-lg font-medium text-gray-400">Games Played</h2>
              <p className="text-5xl font-bold text-blue-400">{stats.gamesPlayed || 0}</p>
            </div>
            <div className="bg-gray-700 p-6 rounded-lg">
              <h2 className="text-lg font-medium text-gray-400">Total Wins</h2>
              <p className="text-5xl font-bold text-green-400">{stats.wins || 0}</p>
            </div>
            <div className="bg-gray-700 p-6 rounded-lg">
              <h2 className="text-lg font-medium text-gray-400">Total Score</h2>
              <p className="text-5xl font-bold text-yellow-400">{stats.totalScore || 0}</p>
            </div>
            
            {/* NEW: Guess Statistics */}
            <div className="bg-gray-700 p-6 rounded-lg">
              <h2 className="text-lg font-medium text-gray-400">Total Guesses</h2>
              <p className="text-5xl font-bold text-purple-400">{stats.totalGuesses || 0}</p>
            </div>
            <div className="bg-gray-700 p-6 rounded-lg">
              <h2 className="text-lg font-medium text-gray-400">Correct Guesses</h2>
              <p className="text-5xl font-bold text-teal-400">{stats.correctGuesses || 0}</p>
            </div>
            <div className="bg-gray-700 p-6 rounded-lg">
              <h2 className="text-lg font-medium text-gray-400">Guess Accuracy</h2>
              <p className="text-5xl font-bold text-pink-400">{calculateAccuracy()}</p>
            </div>
          </div>
        ) : (
          <p>No stats found.</p>
        )}

        <div className="text-center mt-10">
          <Link
            to="/"
            className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-6 rounded text-lg transition duration-200"
          >
            Back to Home
          </Link>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
