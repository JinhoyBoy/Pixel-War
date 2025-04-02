# Basis-Image: Python 3.9
FROM python:3.9-slim

# Arbeitsverzeichnis im Container erstellen und setzen
WORKDIR /app

# Anforderungen kopieren und installieren
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Den gesamten Code ins Container-Arbeitsverzeichnis kopieren
COPY . .

# FastAPI-Anwendung mit Uvicorn starten
CMD ["uvicorn", "app:app", "--host", "0.0.0.0", "--port", "8001"]

# Healthcheck für den Container
HEALTHCHECK --interval=30s --timeout=10s --start-period=40s --retries=3 CMD curl -f http://localhost:8001/health || exit 1
