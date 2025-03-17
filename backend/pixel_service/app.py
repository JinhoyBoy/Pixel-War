from fastapi import FastAPI, HTTPException
import json
from redis_client import redis_client  # Importiere die Verbindung

app = FastAPI()

@app.get("/pixel/{x}/{y}")
def get_pixel(x: int, y: int):
    data = redis_client.hget("canvas", f"{x}:{y}")
    if not data:
        raise HTTPException(status_code=404, detail="Pixel nicht gefunden")
    return json.loads(data)

@app.post("/pixel/")
def set_pixel(x: int, y: int, color: str, player: str):
    pixel_data = json.dumps({"color": color, "player": player})
    redis_client.hset("canvas", f"{x}:{y}", pixel_data)
    redis_client.publish("pixel_updates", f"{x}:{y}:{color}:{player}")
    return {"message": "Pixel gesetzt", "x": x, "y": y, "color": color, "player": player}
