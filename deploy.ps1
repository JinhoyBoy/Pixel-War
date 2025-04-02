# Baue Docker-Images und deploye in Docker Swarm
Write-Host "Baue Docker-Images..."
docker build -t pixel_service_image ./backend/pixel_service
docker build -t event_service_image ./backend/event_service
docker build -t frontend_image ./frontend

# Falls Swarm nicht läuft, initialisieren
$swarmStatus = docker info | Select-String -Pattern "Swarm: active"
if (-not $swarmStatus) {
    Write-Host "Initialisiere Docker Swarm..."
    docker swarm init
}

# Stack in Swarm deployen
Write-Host "Deploye Stack in Swarm..."
docker stack deploy -c docker-compose.yml pixel_stack

Write-Host "Deployment abgeschlossen!"