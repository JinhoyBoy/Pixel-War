# Basis-Image: Python 3.8
FROM python:3.8-slim

# Arbeitsverzeichnis im Container erstellen und setzen
WORKDIR /app

# Die Anforderungen (requirements.txt) ins Arbeitsverzeichnis kopieren
COPY requirements.txt /app/

# Abhängigkeiten installieren
RUN pip install --no-cache-dir -r requirements.txt

# Den gesamten Code ins Container-Arbeitsverzeichnis kopieren
COPY . /app/

# Wenn der Service eine Web-Anwendung ist, setze den Startbefehl
CMD ["python", "app.py"]