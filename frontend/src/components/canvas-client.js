"use client"

import { useState, useRef, useEffect } from "react"
import { CirclePicker } from "react-color"
import Image from "next/image"

// function to update the canvas from a json
export function UpdateCanvas(canvas, dict, width, height) {
  const ctx = canvas.getContext("2d")
  for (var key in dict) {
    var x = Number(key.split(":")[0])
    var y = Number(key.split(":")[1])
    if (x > width || y > height) {
      continue
    }
    var value = dict[key].color
    ctx.fillStyle = value
    ctx.fillRect(x * 10, y * 10, 10, 10)
  }
}

async function getData() {
  try {
    const response = await fetch("http://localhost:8000/canvas");
    
    if (!response.ok) { 
      throw new Error(`HTTP-Fehler! Status: ${response.status}`);
    }
    
    const data = await response.json();

    return data;  // Kann es einer Variable zuweisen
  } catch (error) {
    console.error("Fehler:", error);
  }
}

async function postData(x, y, color, username) {
  try {
    const colorCode = encodeURIComponent(color).toUpperCase()
    const response = await fetch(`http://localhost:8000/pixel/?x=${x}&y=${y}&color=${colorCode}&player=${username}`, {
      method: "POST",
      headers: {
        "Accept": "application/json",
      },
    });

    if (!response.ok) { 
      throw new Error(`POST fehlgeschlagen! Status: ${response.status}`);
    }

    return await response.json();
  } catch (error) {
    console.error("Fehler beim Senden des Pixels:", error);
    return null;
  }
}

var json = {}
json = await getData();

export function CanvasClient({ username }) {
  const width = 40
  const height = 40
  const [color, setColor] = useState()
  const [coordinates, setCoordinates] = useState({ x: "-", y: "-" })
  const [painter, setPainter] = useState({name: "-"})
  const canvasRef = useRef(null)
  
  // Initialize canvas when component mounts
  useEffect(() => {
    const canvas = canvasRef.current
    if (canvas) {
      const ctx = canvas.getContext("2d")
      ctx.fillStyle = "#FFFFFF"
      ctx.fillRect(0, 0, canvas.width, canvas.height)
    }
    UpdateCanvas(canvas, json, width, height)
  }, [])

  // Function to draw on the canvas
  const drawPixel = (e) => {
    const canvas = canvasRef.current
    if (!canvas) return

    const ctx = canvas.getContext("2d")
    if (!ctx) return

    const rect = canvas.getBoundingClientRect()
    const x = Math.floor((e.clientX - rect.left) / 10) // 10px per pixel
    const y = Math.floor((e.clientY - rect.top) / 10) // 10px per pixel

    ctx.fillStyle = color
    ctx.fillRect(x * 10, y * 10, 10, 10) // Draw a 10x10 pixel rectangle
    postData(x, y, color, username)
  }

  // Function to update mouse position
  const handleMouseMove = (e) => {
    const canvas = canvasRef.current
    if (!canvas) return

    const rect = canvas.getBoundingClientRect()
    const x = Math.floor((e.clientX - rect.left) / 10)
    const y = Math.floor((e.clientY - rect.top) / 10)

    setCoordinates({ x, y })
    var name = json[x + ":" + y]?.player || "-"
    setPainter({ name })
  }

  return (
    <div className="relative flex flex-col items-center justify-center min-h-screen bg-gray-100 p-4">
      {/* Logo & Title at the top center */}
      <div className="mb-8 flex flex-col items-center">
      <div className="w-10 h-10 mb-2 flex items-center justify-center">
          <Image 
            src="/logo.png" 
            alt="Logo" 
            width={30} 
            height={30} 
          />
        </div>
        <p className="text-xl font-bold text-gray-700">Pixel War</p>
        <p className="text-sm text-gray-500 mt-1">Logged in as: {username}</p>
      </div>

      {/* Canvas Container */}
      <div className="bg-white shadow-lg rounded-lg p-2 mb-6">
        <canvas
          ref={canvasRef}
          width={width*10} // 40x10px
          height={height*10} // 40x10px
          className="border border-gray-200 cursor-pointer"
          onMouseDown={drawPixel}
          onMouseMove={handleMouseMove}
        />
      </div>

      {/* Color Selection */}
      <div className="mt-4 mb-8">
        <CirclePicker
          color={color}
          onChangeComplete={(c) => setColor(c.hex)}
          colors={[
            "#6D001A",
            "#BE0039",
            "#FF4500",
            "#FFA800",
            "#FFD635",
            "#7EED56",
            "#00CC78",
            "#00A368",
            "#009EAA",
            "#2450A4",
            "#493AC1",
            "#3690EA",
          ]}
        />
      </div>

      {/* Mouse Coordinates Display */}
      <div className="bg-white p-2 rounded shadow-md text-gray-700 mb-4">
        <p>
          painted by: {painter.name}
        </p>
        <p>
          x, y: ({coordinates.x}, {coordinates.y})
        </p>
      </div>
    </div>
  )
}
