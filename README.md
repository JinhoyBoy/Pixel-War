# Pixel-War

## Zum lokalen starten des Projektes

#### Für Mac/ Linux

	./deploy.sh


#### Für Windows

	./deploy.ps1

  
#### Anschließend ist das Frontend erreichbar unter:

- http://localhost:3000

  
#### FAST-API-Docs ist erreichbar unter:

- http://localhost:8000/docs

  

## Zum Stoppen des Projektes:

	docker stack rm pixelstack

## Projektstruktur
	backend/
	├── event_service/        # Service zur Verwaltung der Pixel
	│   ├── Dockerfile           
	│   ├── app.py               # Hauptdatei
	│   └── redis_client.py      # Redis-Verbindung
	├── pixel_service/        # Service für Echtzeit-Updates
	│   ├── Dockerfile           
	│   ├── app.py               # Hauptdatei
	│   ├── db.py                # Postgres-Verbindung
	│   └── redis_client.py      # Redis verbindung
	└── redis.conf
	frontend/
	├── Dockerfile
	└── src/
	    ├── app/
	    │   ├── page.js          # Hauptseite (Login-Page)
	    │   ├── welcome          # Welcome-Page
	    │   └── canvas           # Canvas-page zum zeichnen von Pixeln
	    └── lib/
	        ├── actions.js       # User-Management
	        └── session.js       # JWT-Verwaltung
	docker-compose.yml        # Docker-Compose Konfiguration
	haproxy.cfg               # Konfiguration für Load-Balancing

## Technologien

- **Frontend**: NEXT.js
- **Backend**: FastAPI, SocketIO
- **Session-Management**: Jose, cookies (next/headers)
- **Datenbanken**: Redis, PostgreSQL
- **Containerisierung**: Docker, Docker Swarm
- **Load Balancer**: HAProxy