"use client"

import { useState, useRef, useEffect } from "react"
import { CirclePicker } from "react-color"
import { logout } from "@/lib/actions"
import { Button } from "@/components/ui/button"

export function CanvasClient({ username }) {
  const [color, setColor] = useState("#FFFFFF")
  const [coordinates, setCoordinates] = useState({ x: "-", y: "-" })
  const canvasRef = useRef(null)

  // Initialize canvas when component mounts
  useEffect(() => {
    const canvas = canvasRef.current
    if (canvas) {
      const ctx = canvas.getContext("2d")
      if (ctx) {
        ctx.fillStyle = "#FFFFFF"
        ctx.fillRect(0, 0, canvas.width, canvas.height)
      }
    }
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
  }

  // Function to update mouse position
  const handleMouseMove = (e) => {
    const canvas = canvasRef.current
    if (!canvas) return

    const rect = canvas.getBoundingClientRect()
    const x = Math.floor((e.clientX - rect.left) / 10)
    const y = Math.floor((e.clientY - rect.top) / 10)

    setCoordinates({ x, y })
  }

  return (
    <div className="relative flex flex-col items-center justify-center min-h-screen bg-gray-100 p-4">
      {/* Logo & Title at the top center */}
      <div className="mb-8 flex flex-col items-center">
        <div className="w-10 h-10 bg-primary rounded-full mb-2 flex items-center justify-center text-white font-bold">
          P
        </div>
        <p className="text-xl font-bold text-gray-700">Pixel War</p>
        <p className="text-sm text-gray-500 mt-1">Logged in as: {username}</p>
      </div>

      {/* Canvas Container */}
      <div className="bg-white shadow-lg rounded-lg p-2 mb-6">
        <canvas
          ref={canvasRef}
          width={400} // 40x10px
          height={400} // 40x10px
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
          x, y: ({coordinates.x}, {coordinates.y})
        </p>
      </div>

      {/* Logout Button */}
      <form action={logout}>
        <Button type="submit" variant="outline">
          Logout
        </Button>
      </form>
    </div>
  )
}

