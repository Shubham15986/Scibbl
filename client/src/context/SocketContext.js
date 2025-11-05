
import React, { createContext, useContext, useEffect, useState } from 'react';
import { io } from 'socket.io-client';


const socket = io(process.env.REACT_APP_BACKEND_URL || 'http://localhost:3001', {
  transports: ['websocket', 'polling'],
  reconnection: true,
  reconnectionDelay: 1000,
  reconnectionAttempts: 5
});


const SocketContext = createContext(socket);


export const useSocket = () => {
  return useContext(SocketContext);
};


export const SocketProvider = ({ children }) => {
  const [isConnected, setIsConnected] = useState(socket.connected);

  useEffect(() => {
    socket.on('connect', () => {

      setIsConnected(true);
    });

    socket.on('disconnect', () => {

      setIsConnected(false);
    });

    socket.on('connect_error', (error) => {

    });

    return () => {
      socket.off('connect');
      socket.off('disconnect');
      socket.off('connect_error');
    };
  }, []);

  return (
    <SocketContext.Provider value={socket}>
      {children}
    </SocketContext.Provider>
  );
};
