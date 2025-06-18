// client/src/App.jsx
import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import Home from './components/Home';
import Room from './components/Room';
import Login from './components/Login';     // 1. IMPORT
import Register from './components/Register'; // 1. IMPORT
import Dashboard from './components/Dashboard'; // 1. IMPORT
import { useAuth } from './context/AuthContext'; // 1. IMPORT

// 2. CREATE A PROTECTED ROUTE COMPONENT
const ProtectedRoute = ({ children }) => {
  const { user } = useAuth();
  if (!user) {
    // Redirect to login if not authenticated
    return <Navigate to="/login" replace />;
  }
  return children;
};

// 3. CREATE A GUEST ROUTE COMPONENT (prevents logged-in users from seeing login)
const GuestRoute = ({ children }) => {
  const { user } = useAuth();
  if (user) {
    return <Navigate to="/" replace />;
  }
  return children;
};


function App() {
  return (
    <div className="bg-gray-900 text-white min-h-screen">
      <Routes>
        {/* 4. UPDATE ROUTES */}
        <Route 
          path="/" 
          element={
            <ProtectedRoute>
              <Home />
            </ProtectedRoute>
          } 
        />
        <Route 
          path="/room/:roomId" 
          element={
            <ProtectedRoute>
              <Room />
            </ProtectedRoute>
          } 
        />
        {/* 2. ADD DASHBOARD ROUTE */}
        <Route 
          path="/dashboard" 
          element={
            <ProtectedRoute>
              <Dashboard />
            </ProtectedRoute>
          } 
        />
        <Route 
          path="/login" 
          element={
            <GuestRoute>
              <Login />
            </GuestRoute>
          } 
        />
        <Route 
          path="/register" 
          element={
            <GuestRoute>
              <Register />
            </GuestRoute>
          } 
        />
      </Routes>
    </div>
  );
}

export default App;
