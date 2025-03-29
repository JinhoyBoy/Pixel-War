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
    const response = await fetch("http://localhost:8000/canvas")

    if (!response.ok) {
      throw new Error(`HTTP-Fehler! Status: ${response.status}`)
    }

    const data = await response.json()

    return data
  } catch (error) {
    console.error("Fehler:", error)
  }
}

async function postData(x, y, color, username) {
  try {
    const colorCode = encodeURIComponent(color).toUpperCase()
    const response = await fetch(`http://localhost:8000/pixel/?x=${x}&y=${y}&color=${colorCode}&player=${username}`, {
      method: "POST",
      headers: {
        Accept: "application/json",
      },
    })

    if (!response.ok) {
      throw new Error(`POST fehlgeschlagen! Status: ${response.status}`)
    }

    return await response.json()
  } catch (error) {
    console.error("Fehler beim Senden des Pixels:", error)
    return null
  }
}


export function CanvasClient({ username }) {
  const width = 50
  const height = 50
  const [color, setColor] = useState("#000000")
  const [coordinates, setCoordinates] = useState({ x: "-", y: "-" })
  const [painter, setPainter] = useState({ name: "-" })
  const [timer, setTimer] = useState(60) // Timer starts at 60 seconds
  const canvasRef = useRef(null)
  var json = {}

  // Timer logic
  useEffect(() => {
    const interval = setInterval(() => {
      setTimer((prev) => (prev > 0 ? prev - 1 : 0)) // Decrease timer every second
    }, 1000)

    return () => clearInterval(interval) // Cleanup interval on unmount
  }, [])

  // Initialize canvas when component mounts
  useEffect(() => {
    const initializeCanvas = async () => {
      const canvas = canvasRef.current
      if (canvas) {
        const ctx = canvas.getContext("2d")
        ctx.fillStyle = "#FFFFFF"
        ctx.fillRect(0, 0, canvas.width, canvas.height)
      }
      json = await getData()
      UpdateCanvas(canvas, json, width, height)
    }

    initializeCanvas()
  }, [])

  useEffect(() => {
    let ws // WebSocket-Instanz
    let reconnectTimeout // Timeout für die Wiederverbindung

    const connectWebSocket = () => {
      ws = new WebSocket("ws://localhost:8001/ws")

      ws.onopen = () => {
        console.log("WebSocket-Verbindung hergestellt!");
        // Sende regelmäßig Pings, um die Verbindung aktiv zu halten
        const pingInterval = setInterval(() => {
          if (ws.readyState === WebSocket.OPEN) {
            ws.send(JSON.stringify({ type: "ping" }));
          }
        }, 30000); // Alle 30 Sekunden
      }

      ws.onmessage = async (event) => {
        console.log("Pixel-Update erhalten:", event.data)

        // Canvas neu laden
        const canvas = canvasRef.current
        if (canvas) {
          const ctx = canvas.getContext("2d")
          json = await getData() // Neue Daten abrufen
          UpdateCanvas(canvas, json, width, height) // Canvas aktualisieren
        }
      }

      ws.onerror = (error) => {
        console.error("WebSocket-Fehler:", error)
      }

      ws.onclose = () => {
        console.log("WebSocket-Verbindung geschlossen. Versuche erneut zu verbinden...")
        clearInterval(pingInterval) // Stoppe den Ping-Intervall
        reconnectTimeout = setTimeout(connectWebSocket, 1000) // Nach 1 Sekunden erneut verbinden
      }
    }

    // WebSocket-Verbindung herstellen
    connectWebSocket()

    // Cleanup bei Komponentendemontage
    return () => {
      if (ws) {
        ws.onclose = null; // Entferne den Event-Handler, um doppelte Aufrufe zu vermeiden
        ws.close();
      }
      if (reconnectTimeout) clearTimeout(reconnectTimeout);
    };
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

    //ctx.fillStyle = color
    //ctx.fillRect(x * 10, y * 10, 10, 10) // Draw a 10x10 pixel rectangle
    postData(x, y, color, username)
  }

  // Function to update mouse position
  const handleMouseMove = (e) => {
    const canvas = canvasRef.current
    if (!canvas) return
  
    const ctx = canvas.getContext("2d")
    if (!ctx) return
  
    const rect = canvas.getBoundingClientRect()
    const x = Math.floor((e.clientX - rect.left) / 10)
    const y = Math.floor((e.clientY - rect.top) / 10)
  
    setCoordinates({ x, y })
    var name = json[x + ":" + y]?.player || "-"
    setPainter({ name })
  }

  return (
    <div className="min-h-screen bg-gray-100">
      {/* Header */}
      <header className="p-6 flex items-center">
        <div className="flex items-center ml-6">
          <Image src="/logo.png" alt="Logo" width={30} height={30}/>
          <h1 className="text-xl font-semibold ml-3">Pixel War</h1>
        </div>
        <div className="ml-auto text-sm text-gray-500 mr-6">Logged in as: {username}</div>
      </header>

      {/* Main Content */}
      <main className="flex justify-center px-4 py-15">
        <div className="flex">
          {/* Timer Bar */}
          <div className="relative w-8 bg-gray-600 rounded-lg shadow-lg overflow-hidden mr-12">
            <div
              className="absolute bottom-0 w-full bg-gray-400"
              style={{ height: `${(timer / 60) * 100}%` }} // Dynamic height based on timer
            ></div>
          </div>

          {/* Canvas Container */}
          <div className="bg-white rounded-lg shadow-lg p-2 border border-gray-200">
            <canvas
              ref={canvasRef}
              width={width * 10}
              height={height * 10}
              className="cursor-pointer"
              onMouseDown={drawPixel}
              onMouseMove={handleMouseMove}
            />
          </div>

          {/* Color Palette */}
          <div className="flex flex-col align-center ml-12">
            <div className="col-span-3">
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

                  "#AA00BB",
                  "#EE3AEE",
                  "#AA00FF",

                  "#666666",
                  "#000000",
                  "#FFFFFF",
                ]}
                width="12vw"
                circleSize={35}
              />
            </div>
            {/* Coordinates Display */}
            <div className="col-span-3 mt-8 bg-white p-3 rounded-lg shadow text-sm">
              <p>painter: {painter.name}</p>
              <p>
                x, y: ({coordinates.x}, {coordinates.y})
              </p>
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}

