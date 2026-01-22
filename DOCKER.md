# Docker Setup für Budget Planner

## 🐳 Docker Installation

Diese Anwendung läuft vollständig in Docker. Alle Daten werden persistent in einem Docker Volume gespeichert.

## 🚀 Schnellstart

### 1. Docker Container starten

```bash
docker-compose up -d
```

Die Anwendung ist dann verfügbar unter: **http://localhost:3001**

### 2. Logs anzeigen

```bash
docker-compose logs -f
```

### 3. Container stoppen

```bash
docker-compose down
```

**Wichtig:** Deine Daten bleiben erhalten, auch wenn du den Container stoppst!

### 4. Container neu bauen (nach Code-Änderungen)

```bash
docker-compose up -d --build
```

## 📊 Datenbank-Verwaltung

### Datenbank-Backup erstellen

Die Datenbank wird automatisch bei jeder Migration gesichert. Backups werden im Docker Volume gespeichert.

Um manuell auf die Datenbank zuzugreifen:

```bash
# In den Container einsteigen
docker exec -it budget-planner sh

# Datenbank-Dateien anzeigen
ls -la /app/data/
```

### Datenbank exportieren

```bash
# Datenbank aus dem Container kopieren
docker cp budget-planner:/app/data/budget.db ./budget_export.db
```

### Datenbank importieren

```bash
# Datenbank in den Container kopieren
docker cp ./budget_import.db budget-planner:/app/data/budget.db

# Container neu starten
docker-compose restart
```

## 🔧 Entwicklung

### Lokale Entwicklung (ohne Docker)

```bash
# Backend starten
npm start

# Frontend starten (in neuem Terminal)
npm run dev
```

Frontend: http://localhost:3000
Backend: http://localhost:3001

### Production Build testen

```bash
docker-compose up --build
```

## 📦 Docker Volume

Die Datenbank wird in einem Docker Volume gespeichert: `budget-data`

### Volume-Informationen anzeigen

```bash
docker volume inspect budget-data
```

### Volume löschen (ACHTUNG: Löscht alle Daten!)

```bash
docker-compose down -v
```

## 🔍 Troubleshooting

### Container läuft nicht

```bash
# Status prüfen
docker-compose ps

# Logs anzeigen
docker-compose logs

# Container neu starten
docker-compose restart
```

### Port bereits belegt

Wenn Port 3001 bereits belegt ist, ändere in `docker-compose.yml`:

```yaml
ports:
  - "3002:3001"  # Nutze Port 3002 statt 3001
```

### Daten zurücksetzen

```bash
# Container und Volume löschen
docker-compose down -v

# Neu starten
docker-compose up -d
```

## 🎯 Healthcheck

Der Container hat einen integrierten Healthcheck. Status prüfen:

```bash
docker inspect budget-planner | grep -A 10 Health
```

## 📝 Umgebungsvariablen

In `docker-compose.yml` können folgende Variablen angepasst werden:

- `NODE_ENV`: production (für Docker)
- `PORT`: 3001 (interner Port)

## 🔐 Sicherheit

- Datenbank-Dateien sind nur im Docker Volume zugänglich
- Automatische Backups bei Migrationen
- Container läuft als non-root User (Node.js Alpine)
