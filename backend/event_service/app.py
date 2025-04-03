import socketio
import asyncio
from redis_client import redis_client
from fastapi import FastAPI

# Erstelle einen Socket.IO-Server
sio = socketio.AsyncServer(
    async_mode="asgi",
    cors_allowed_origins="*", # Erlaube nur das Frontend
)
app = FastAPI()
app.mount("/", socketio.ASGIApp(sio))

# Redis Pub/Sub abonnieren
pubsub = redis_client.pubsub()
pubsub.subscribe("pixel_updates")

async def redis_listener():
    """Hört auf Redis-Nachrichten und sendet sie an verbundene Clients."""
    while True:
        message = await asyncio.get_event_loop().run_in_executor(None, pubsub.get_message)
        if message and message["type"] == "message":
            await sio.emit("pixel_update", message["data"])
        await asyncio.sleep(0.1)

@sio.event
async def connect(sid, environ):
    print(f"Client {sid} verbunden")

@sio.event
async def disconnect(sid):
    print(f"Client {sid} getrennt")

@sio.event
async def pixel_update(sid, data):
    print(f"Pixel-Update von {sid}: {data}")

@sio.on("*")
async def catch_all_event(event, sid, data):
    print(f"Unbekanntes Event: {event}, Daten: {data}")
# Starte den Redis-Listener im Hintergrund
asyncio.create_task(redis_listener())
