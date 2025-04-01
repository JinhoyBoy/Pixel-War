"use client"

import { useState, useRef, useEffect } from "react"
import { CirclePicker } from "react-color"
import { io } from "socket.io-client"

const API_URL = process.env.NEXT_PUBLIC_API_URL;
const WS_URL = process.env.NEXT_PUBLIC_WS_URL;

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

// function to get the data from the server
async function getData() {
  try {
    const response = await fetch(`${API_URL}/canvas`)

    if (!response.ok) {
      throw new Error(`HTTP-Fehler! Status: ${response.status}`)
    }

    const data = await response.json()

    return data
  } catch (error) {
    console.error("Fehler:", error)
    return {}
  }
}

// function, to get the cooldown from the server
async function getCooldown(username) {
  try {
    const resp = await fetch(`${API_URL}/cooldown/${username}`, {
      credentials: "include", // Damit Cookies gesendet werden
    })
    if (!resp.ok) {
      throw new Error(`Cooldown abrufen fehlgeschlagen: ${resp.status}`)
    }
    const data = await resp.json()
    // data könnte z.B. {0} oder {5} enthalten
    // Wir nehmen den ersten Wert aus dem zurückgegebenen Set
    const remainingTime = Array.isArray(data) && data.length > 0 ? data[0] : 0
    return remainingTime
  } catch (error) {
    console.error("Fehler beim Abrufen des Cooldowns:", error)
    return 0 // Fallback
  }
}

// function to post the data to the server
async function postData(x, y, color, username) {
  try {
    const colorCode = encodeURIComponent(color).toUpperCase()
    const response = await fetch(`${API_URL}/pixel/?x=${x}&y=${y}&color=${colorCode}&player=${username}`, {
      method: "POST",
      headers: {
        Accept: "application/json",
      },
      credentials: "include",
    })

    if (!response.ok) {
      throw new Error(`POST fehlgeschlagen! Status: ${response.status}`)
    }

    return await response.json()
  } catch (error) {
    console.error("Fehler beim Senden des Pixels:", error)
    setErrorMessage(error.message) // Fehlerzustand setzen
    return null
  }
}

export function CanvasClient({ username }) {
  const width = 50
  const height = 50
  const cooldown = 10 // Cooldown in seconds
  const [color, setColor] = useState("#000000")
  const [coordinates, setCoordinates] = useState({ x: "-", y: "-" })
  const [painter, setPainter] = useState({ name: "-" })
  const [timer, setTimer] = useState(0) // Timer starts at cooldown seconds
  const [connectionStatus, setConnectionStatus] = useState("connecting") // Add connection status
  const [errorMessage, setErrorMessage] = useState(null);
  const canvasRef = useRef(null)
  const wsRef = useRef(null)
  const [canvasData, setCanvasData] = useState({})

  // Bei erstem Rendern Cooldown vom Server holen
  useEffect(() => {
    const initCooldown = async () => {
      const serverCooldown = await getCooldown(username)
      setTimer(serverCooldown)
    }
    initCooldown()
  }, [username])

  // Lokales Intervall, um Timer runterzuzählen
  useEffect(() => {
    const interval = setInterval(() => {
      setTimer((prev) => (prev > 0 ? prev - 1 : 0))
    }, 1000)
    return () => clearInterval(interval)
  }, [])

  // Initialize canvas when component mounts or canvas data changes
  useEffect(() => {
    const canvas = canvasRef.current
    if (canvas) {
      const ctx = canvas.getContext("2d")
      ctx.fillStyle = "#FFFFFF"
      ctx.fillRect(0, 0, canvas.width, canvas.height)
      UpdateCanvas(canvas, canvasData, width, height)
    }
  }, [canvasData])

  // Initial data fetch
  useEffect(() => {
    const fetchInitialData = async () => {
      const data = await getData()
      setCanvasData(data || {})
    }

    fetchInitialData()
  }, [])

  // WebSocket connection with improved reconnection logic
  useEffect(() => {
    const socket = io(WS_URL)

    socket.on("connect", () => {
      console.log("Socket.IO connected")
      setConnectionStatus("connected")
    })

    socket.on("pixel_update", async (data) => {
      console.log("Received update:", data)

      const [xStr, yStr, colorVal, playerName] = data.split(":")
      const xPos = Number(xStr)
      const yPos = Number(yStr)

      // Canvas zeichnen
      const canvas = canvasRef.current
      if (!canvas) return

      const ctx = canvas.getContext("2d")
      ctx.fillStyle = colorVal
      ctx.fillRect(xPos * 10, yPos * 10, 10, 10)

      // Lokale State-Daten (canvasData) updaten,
      // damit z.B. bei MouseOver der korrekte painter sichtbar ist.
      setCanvasData((prevData) => {
        const updatedData = { ...prevData }
        updatedData[`${xPos}:${yPos}`] = {
          color: colorVal,
          player: playerName,
        }
        return updatedData
      })
    })

    socket.on("disconnect", () => {
      console.log("Socket.IO disconnected")
      setConnectionStatus("disconnected")
    })

    socket.on("connect_error", (error) => {
      console.error("Socket.IO error:", error)
      setConnectionStatus("error")
    })

    wsRef.current = socket

    return () => {
      socket.disconnect()
    }
  }, [])

  // Function to download the canvas as an image
  function downloadCanvasAsImage() {
    const canvas = canvasRef.current
    if (!canvas) return
  
    const url = canvas.toDataURL("image/png")
    const link = document.createElement("a")
    link.download = "pixel-canvas.png"
    link.href = url
    link.click()
  }

  // Function to draw on the canvas
  const drawPixel = (e) => {
    if (timer === 0) {
      const canvas = canvasRef.current
      if (!canvas) return

      const ctx = canvas.getContext("2d")
      if (!ctx) return

      const rect = canvas.getBoundingClientRect()
      const x = Math.floor((e.clientX - rect.left) / 10) // 10px per pixel
      const y = Math.floor((e.clientY - rect.top) / 10) // 10px per pixel

      // Update locally for immediate feedback
      //ctx.fillStyle = color
      //ctx.fillRect(x * 10, y * 10, 10, 10)

      // Send to server
      postData(x, y, color, username)

      // Reset timer
      setTimer(cooldown)
    } else {
      console.log(`Please wait ${timer} seconds before placing another pixel`)
    }
  }

  // Function to update mouse position and painter name
  const handleMouseMove = (e) => {
    const canvas = canvasRef.current
    if (!canvas) return

    const ctx = canvas.getContext("2d")
    if (!ctx) return

    const rect = canvas.getBoundingClientRect()
    const x = Math.floor((e.clientX - rect.left) / 10)
    const y = Math.floor((e.clientY - rect.top) / 10)

    setCoordinates({ x, y })
    const name = canvasData[`${x}:${y}`]?.player || "-"
    setPainter({ name })
  }

  // Connection status indicator
  const getConnectionStatusColor = () => {
    switch (connectionStatus) {
      case "connected":
        return "bg-green-500"
      case "connecting":
        return "bg-yellow-500"
      case "disconnected":
        return "bg-red-500"
      case "error":
        return "bg-red-500"
      case "failed":
        return "bg-gray-500"
      default:
        return "bg-gray-300"
    }
  }

  return (
    <div className="min-h-screen bg-gray-100">
      {/* Header */}
      <header className="p-6 flex items-center">
        <div className="flex items-center ml-6">
          <img src="/favicon.ico" alt="Logo" width={30} height={30} className="ml-2" />
          <h1 className="text-xl font-semibold ml-3">Pixel War</h1>
          <div
            className={`ml-4 w-3 h-3 rounded-full ${getConnectionStatusColor()}`}
            title={`Connection status: ${connectionStatus}`}
          ></div>
        </div>
        <div className="ml-auto text-sm text-gray-500 mr-6">Logged in as: {username}</div>
      </header>

      {/* Error Popup */}
      {errorMessage && (
        <div className="fixed top-4 left-1/2 transform -translate-x-1/2 bg-red-500 text-white px-4 py-2 rounded shadow-lg">
          <p>{errorMessage}</p>
          <button
            className="mt-2 text-sm underline"
            onClick={() => setErrorMessage(null)} // close Error Popup
          >
            Schließen
          </button>
        </div>
      )}

      {/* Main Content */}
      <main className="flex justify-center px-4 py-15">
        <div className="flex">
          {/* Timer Bar */}
          <div className="relative w-8 bg-gray-600 rounded-lg shadow-lg overflow-hidden mr-12">
            <div
              className="absolute bottom-0 w-full bg-gray-400"
              style={{ height: `${(timer / cooldown) * 100}%` }} // Dynamic height based on timer
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
                  "#6D001A", "#BE0039", "#FF4500", 
                  "#FFA800", "#FFD635", "#FFF8B8", 
                  "#00A368", "#00CC78", "#7EED56", 
                  "#00756F", "#009EAA", "#2450A4",
                  "#493AC1", "#6A5CFF", "#3690EA", 
                  "#51E9F4", "#FFFFFF", "#000000",
                ]}
                width="12vw"
                circleSize={35}
              />
            </div>
            {/* Coordinates Display */}
            <div className="col-span-3 mt-8 bg-white p-3 rounded-lg shadow text-sm w-48">
              <p>painter: {painter.name}</p>
              <p>
                x, y: ({coordinates.x}, {coordinates.y})
              </p>
              <p className="mt-2 text-xs">
                {timer > 0 ? `Wait ${timer}s to place a pixel` : "You can place a pixel now!"}
              </p>
            </div>
            {/* Download Button */}
            <button
              className="mt-4 bg-gray-800 text-white px-4 py-2 rounded-lg shadow text-sm hover:bg-gray-600"
              onClick={downloadCanvasAsImage}
            >
              Download Canvas
            </button>
          </div>
        </div>
      </main>
    </div>
  )
}

