from fastapi import FastAPI, WebSocket, WebSocketDisconnect
import asyncio
from redis_client import redis_client  # Importieren

app = FastAPI()

pubsub = redis_client.pubsub()
pubsub.subscribe("pixel_updates")

active_connections = []

@app.websocket("/ws")
async def websocket_endpoint(websocket: WebSocket):
    await websocket.accept()
    active_connections.append(websocket)
    try:
        while True:
            message = await asyncio.to_thread(pubsub.get_message)
            if message and message["type"] == "message":
                for connection in active_connections:
                    await connection.send_text(message["data"])
            await asyncio.sleep(0.1)
    except WebSocketDisconnect:
        active_connections.remove(websocket)
