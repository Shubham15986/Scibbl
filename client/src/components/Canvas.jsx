
import React, { useRef, useEffect } from 'react';
import { useSocket } from '../context/SocketContext';

const Canvas = ({ roomId, isMyTurn }) => {
  const socket = useSocket();
  const canvasRef = useRef(null);
  const contextRef = useRef(null);
  const isDrawing = useRef(false);
  const lastPosRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    const dpr = window.devicePixelRatio || 1;
    canvas.width = canvas.offsetWidth * dpr;
    canvas.height = canvas.offsetHeight * dpr;
    
    const context = canvas.getContext('2d');
    context.scale(dpr, dpr);
    context.lineCap = 'round';
    context.strokeStyle = 'white';
    context.lineWidth = 3;
    contextRef.current = context;
  }, []);

  useEffect(() => {
    const onDrawing = ({ x0, y0, x1, y1, color, size }) => {
      const context = contextRef.current;
      context.beginPath();
      context.moveTo(x0, y0);
      context.lineTo(x1, y1);
      context.strokeStyle = color;
      context.lineWidth = size;
      context.stroke();
      context.closePath();
    };

    const onCanvasCleared = () => {
      const canvas = canvasRef.current;
      const context = contextRef.current;
      context.clearRect(0, 0, canvas.width, canvas.height);
    };

    socket.on('drawing', onDrawing);
    socket.on('canvas-cleared', onCanvasCleared);

    return () => {
      socket.off('drawing', onDrawing);
      socket.off('canvas-cleared', onCanvasCleared);
    };
  }, [socket]);

  const getMousePos = (e) => {
    const rect = canvasRef.current.getBoundingClientRect();
    const dpr = window.devicePixelRatio || 1;
    const scaleX = canvasRef.current.width / (rect.width * dpr);
    const scaleY = canvasRef.current.height / (rect.height * dpr);

    const clientX = e.touches ? e.touches[0].clientX : e.clientX;
    const clientY = e.touches ? e.touches[0].clientY : e.clientY;

    return {
      x: (clientX - rect.left) * scaleX,
      y: (clientY - rect.top) * scaleY,
    };
  };

  const startDrawing = (e) => {
    if (!isMyTurn) return;
    e.preventDefault(); 
    isDrawing.current = true;
    lastPosRef.current = getMousePos(e);
  };

  const draw = (e) => {
    if (!isDrawing.current || !isMyTurn || !lastPosRef.current) return;
    e.preventDefault();
    
    const currentPos = getMousePos(e);
    const { x: x0, y: y0 } = lastPosRef.current;
    const { x: x1, y: y1 } = currentPos;
    const color = contextRef.current.strokeStyle;
    const size = contextRef.current.lineWidth;

    const context = contextRef.current;
    context.beginPath();
    context.moveTo(x0, y0);
    context.lineTo(x1, y1);
    context.stroke();
    context.closePath();

    socket.emit('draw-data', {
      roomId,
      data: { x0, y0, x1, y1, color, size },
    });

    lastPosRef.current = currentPos;
  };

  const stopDrawing = () => {
    isDrawing.current = false;
    lastPosRef.current = null;
  };

  const handleClear = () => {
    if (!isMyTurn) return;
    const canvas = canvasRef.current;
    contextRef.current.clearRect(0, 0, canvas.width, canvas.height);
    socket.emit('clear-canvas', { roomId });
  };
  
  const handleColorChange = (color) => {
    contextRef.current.strokeStyle = color;
  };

  const handleSizeChange = (size) => {
    contextRef.current.lineWidth = size;
  };

  return (
    <div className="bg-gray-700">
      <canvas
        ref={canvasRef}
        onMouseDown={startDrawing}
        onMouseMove={draw}
        onMouseUp={stopDrawing}
        onMouseOut={stopDrawing}
        onMouseLeave={stopDrawing}
        onTouchStart={startDrawing}
        onTouchMove={draw}
        onTouchEnd={stopDrawing}
        onTouchCancel={stopDrawing}
        className="w-full h-[250px] sm:h-[350px] md:h-[450px] bg-white rounded-b-lg cursor-crosshair"
        style={{ 
          touchAction: 'none',
          WebkitUserSelect: 'none',
          MozUserSelect: 'none',
          msUserSelect: 'none',
          userSelect: 'none'
        }}
      />
      
      {isMyTurn && (
        <div className="bg-gray-800 bg-opacity-90 p-2 flex space-x-2 justify-center items-center flex-wrap">
          <button onClick={() => handleColorChange('white')} className="w-6 h-6 rounded-full bg-white border-2 border-gray-400"></button>
          <button onClick={() => handleColorChange('black')} className="w-6 h-6 rounded-full bg-black border-2 border-gray-400"></button>
          <button onClick={() => handleColorChange('red')} className="w-6 h-6 rounded-full bg-red-500 border-2 border-gray-400"></button>
          <button onClick={() => handleColorChange('green')} className="w-6 h-6 rounded-full bg-green-500 border-2 border-gray-400"></button>
          <button onClick={() => handleColorChange('blue')} className="w-6 h-6 rounded-full bg-blue-500 border-2 border-gray-400"></button>
          <button onClick={() => handleColorChange('yellow')} className="w-6 h-6 rounded-full bg-yellow-400 border-2 border-gray-400"></button>
          
          <div className="w-px h-6 bg-gray-600 mx-2"></div>
          
          <button onClick={() => handleSizeChange(3)} className="w-4 h-4 rounded-full bg-white"></button>
          <button onClick={() => handleSizeChange(8)} className="w-6 h-6 rounded-full bg-white"></button>
          <button onClick={() => handleSizeChange(14)} className="w-8 h-8 rounded-full bg-white"></button>
          
          <div className="w-px h-6 bg-gray-600 mx-2"></div>

          <button onClick={handleClear} className="bg-red-600 text-white px-3 py-1 rounded text-sm font-medium">
            Clear
          </button>
        </div>
      )}
    </div>
  );
};

export default Canvas;
