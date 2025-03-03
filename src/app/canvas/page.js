"use client";

import { useState, useRef } from "react";
import { CirclePicker } from "react-color";

export default function ColorPickerPage() {
  const [color, setColor] = useState("#FFFFFF");
  const [coordinates, setCoordinates] = useState({ x: "-", y: "-" }); // Startwert für die Koordinaten
  const canvasRef = useRef(null);

  // Funktion zum Zeichnen auf dem Canvas
  const drawPixel = (e) => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");

    const rect = canvas.getBoundingClientRect();
    const x = Math.floor((e.clientX - rect.left) / 10); // 10px pro Pixel
    const y = Math.floor((e.clientY - rect.top) / 10); // 10px pro Pixel

    ctx.fillStyle = color;
    ctx.fillRect(x * 10, y * 10, 10, 10); // Zeichne ein 10x10 Pixel großes Rechteck
  };

  // Funktion zum Aktualisieren der Mausposition
  const handleMouseMove = (e) => {
    const canvas = canvasRef.current;
    const rect = canvas.getBoundingClientRect();
    const x = Math.floor((e.clientX - rect.left) / 10);
    const y = Math.floor((e.clientY - rect.top) / 10);

    setCoordinates({ x, y });
  };

  return (
    <div className="relative flex flex-col items-center justify-center h-screen bg-gray-100">
      {/* Logo & Titel oben mittig */}
      <div className="absolute top-10 left-1/2 -translate-x-1/2 flex flex-col items-center">
        <img src="/logo.png" className="w-5 h-5 mb-2" alt="Logo" />
        <p className="text-gray-700">Pixel War</p>
      </div>

      {/* Canvas-Container */}
      <div className="bg-white shadow-lg rounded-lg mb-6">
        <canvas
          ref={canvasRef}
          width={400} // 32x10px
          height={400} // 32x10px
          className="border-3 border-gray-200 cursor-pointer"
          onMouseDown={drawPixel}
          onMouseMove={handleMouseMove}
        />
      </div>
      
      {/* Farbauswahl */}
      <div className="mt-4">  
        <CirclePicker 
          color={color} 
          onChangeComplete={(c) => setColor(c.hex)} 
          colors={["#9C27B0","#F44E3B","#FF9800","#FCCB00","#8BC34A","#008B02","#004DCF","#2196F3","#8B572A","#000000","#90A4AE","#FFFFFF"]} 
        /> 
      </div>

      {/* Anzeige der Mauskoordinaten */}
      <div className="absolute bottom-4 right-4 bg-white p-2 rounded shadow-md text-gray-700">
        <p>x, y: ({coordinates.x}, {coordinates.y})</p>
      </div>
    </div>
  );
}
