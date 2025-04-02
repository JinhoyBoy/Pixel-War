# Baue Docker-Images und deploye in Docker Swarm
echo "Baue Docker-Images..."
docker build -t pixel_service_image ./backend/pixel_service
docker build -t event_service_image ./backend/event_service
docker build -t frontend_image ./frontend

# Falls Swarm nicht läuft, initialisieren
if ! docker info | grep -q "Swarm: active"; then
    echo "Initialisiere Docker Swarm..."
    docker swarm init
fi

# Stack in Swarm deployen
echo "Deploye Stack in Swarm..."
docker stack deploy -c docker-compose.yml pixel_stack

echo "Deployment abgeschlossen!"