// client/src/context/AuthContext.js
import React, { createContext, useContext, useState, useEffect } from 'react';

// The URL of our backend auth routes
const API_URL = `${process.env.REACT_APP_BACKEND_URL || 'http://localhost:3001'}/api/auth`;

const AuthContext = createContext(null);

export const useAuth = () => {
  return useContext(AuthContext);
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(localStorage.getItem('token') || null);
  const [loading, setLoading] = useState(true); // Check if we're already logged in

  useEffect(() => {
    // Check if token is valid on initial load
    if (token) {
      try {
        // In a real app, you'd verify this token with the backend
        // For simplicity, we'll just decode it.
        const decodedToken = JSON.parse(atob(token.split('.')[1]));
        if (decodedToken.exp * 1000 > Date.now()) {
          setUser({ id: decodedToken.id, username: decodedToken.username });
        } else {
          // Token expired
          localStorage.removeItem('token');
          setToken(null);
        }
      } catch (e) {
        console.error("Invalid token:", e);
        localStorage.removeItem('token');
        setToken(null);
      }
    }
    setLoading(false);
  }, [token]);

  const register = async (username, email, password) => {
    const res = await fetch(`${API_URL}/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username, email, password }),
    });
    const data = await res.json();
    if (!res.ok) {
      throw new Error(data.msg || "Registration failed");
    }
    return data;
  };

  const login = async (email, password) => {
    const res = await fetch(`${API_URL}/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password }),
    });
    const data = await res.json();
    if (!res.ok) {
      throw new Error(data.msg || "Login failed");
    }

    localStorage.setItem('token', data.token);
    setToken(data.token);
    setUser(data.user);
    return data;
  };

  const logout = () => {
    localStorage.removeItem('token');
    setToken(null);
    setUser(null);
  };

  const value = {
    user,
    token,
    loading,
    register,
    login,
    logout,
  };

  // Don't render children until we've checked for a token
  if (loading) {
    return <div className="min-h-screen bg-gray-900 flex items-center justify-center text-white">Loading...</div>;
  }
  
  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};
