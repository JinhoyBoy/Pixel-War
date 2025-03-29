from fastapi import FastAPI, HTTPException, Depends
from fastapi.middleware.cors import CORSMiddleware
from redis_client import redis_client 
from sqlalchemy.orm import Session
from db import SessionLocal, init_db, Pixel
import json

app = FastAPI()
init_db()

# Datenbank-Sitzung
def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

# CORS aktivieren
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],  # Erlaubte Frontend-URL
    allow_credentials=True,
    allow_methods=["*"],  # Erlaubt GET, POST, PUT, DELETE
    allow_headers=["*"],  # Erlaubt alle Header
)

COOLDOWN_SECONDS = 60  # Cooldown-Zeit pro Spieler

# Erlaubte Farben (RGB-Hex-Werte von r/place 2022)
ALLOWED_COLORS = {
    "#6D001A", "#BE0039", "#FF4500", "#FFA800",
    "#FFD635", "#FFF8B8", "#00A368", "#00CC78",
    "#7EED56", "#00756F", "#009EAA", "#2450A4",
    "#3690EA", "#51E9F4", "#493AC1", "#6A5CFF", 
    "#FFFFFF", "#000000"
}

@app.post("/pixel/")
def set_pixel(x: int, y: int, color: str, player: str, db: Session = Depends(get_db)):
    # Prüfen, ob die Farbe erlaubt ist
    if color not in ALLOWED_COLORS:
        raise HTTPException(status_code=400, detail="Ungültige Farbe. Bitte wähle eine erlaubte Farbe.")
    
    # Prüfen, ob der Spieler noch im Cooldown ist
    if redis_client.exists(f"cooldown:{player}"):
        remaining_time = redis_client.ttl(f"cooldown:{player}")
        raise HTTPException(status_code=429, detail=f"Bitte warte {remaining_time} Sekunden.")
    
    # Pixel in Redis speichern (Echtzeit-Update)
    pixel_data = json.dumps({"color": color, "player": player})
    redis_client.hset("canvas", f"{x}:{y}", pixel_data)
    redis_client.publish("pixel_updates", f"{x}:{y}:{color}:{player}") # Pub/Sub für Echtzeit-Benachrichtigungen
    redis_client.lpush(f"history:{x}:{y}", json.dumps({"color": color, "player": player})) # Pixel-Historie speichern (neuste Änderungen zuerst)
    
    # Pixel in PostgreSQL speichern (persistente Speicherung)
    db_pixel = Pixel(x=x, y=y, color=color, player=player)
    db.add(db_pixel)
    db.commit()

    # Cooldown setzen (TTL: COOLDOWN_SECONDS)
    redis_client.setex(f"cooldown:{player}", COOLDOWN_SECONDS, 1)

    return {"message": "Pixel gesetzt", "x": x, "y": y, "color": color, "player": player}


# Gibt das gesamte Canvas als JSON zurück
@app.get("/canvas")
def get_canvas(db: Session = Depends(get_db)):
    canvas = redis_client.hgetall("canvas")
    result = {key: json.loads(value) for key, value in canvas.items()}

    # Fehlende Pixel aus PostgreSQL laden
    all_pixels = db.query(Pixel).all()
    for pixel in all_pixels:
        key = f"{pixel.x}:{pixel.y}"
        if key not in result:
            result[key] = {"color": pixel.color, "player": pixel.player}
    
    return result

"""
@app.get("/pixel/{x}/{y}")
def get_pixel(x: int, y: int):
    data = redis_client.hget("canvas", f"{x}:{y}")
    if not data:
        raise HTTPException(status_code=404, detail="Pixel nicht gefunden")
    return json.loads(data)

# Gibt die letzten `limit` Änderungen für ein Pixel zurück. Standardmäßig werden die letzten 10 Änderungen ausgegeben.
@app.get("/pixel/{x}/{y}/history")
def get_pixel_history(x: int, y: int, limit: int = 10):
    history = redis_client.lrange(f"history:{x}:{y}", 0, limit - 1)
    return [json.loads(entry) for entry in history]'
"""