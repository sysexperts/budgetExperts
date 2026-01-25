# 🚨 WICHTIG: Daten-Sicherung bei Updates

## Problem: Datenverlust bei Docker Updates

Bisher wurden deine Daten im falschen Verzeichnis gespeichert, daher gingen sie bei Updates verloren.

## ✅ Lösung: Korrekte Daten-Speicherung

Die Datenbank wird jetzt im Docker Volume `/app/data` gespeichert, das bei Updates erhalten bleibt.

## 🔄 Sicheres Update durchführen

### Methode 1: Automatisches Backup (empfohlen)
```bash
# Container stoppen
docker-compose down

# Backup erstellen (automatisch bei jedem Start)
docker-compose up -d --build
```

### Methode 2: Manuelles Backup vor Update
```bash
# 1. Aktuelle Datenbank exportieren
docker cp budget-planner:/app/data/budget.db ./backup_before_update.db

# 2. Update durchführen
docker-compose down
docker-compose up -d --build

# 3. Bei Bedarf wiederherstellen
docker cp ./backup_before_update.db budget-planner:/app/data/budget.db
docker-compose restart
```

## 📁 Wo werden die Daten gespeichert?

- **Docker Volume**: `budget-data` → `/app/data` im Container
- **Datenbank**: `/app/data/budget.db`
- **Backups**: `/app/data/budget_backup_*.db`

## 🔍 Daten prüfen

```bash
# Volume Inhalt anzeigen
docker run --rm -v budget-data:/data alpine ls -la /data

# Datenbank aus Container kopieren
docker cp budget-planner:/app/data/budget.db ./current_backup.db
```

## ⚠️ Wichtige Hinweise

1. **Immer Backups machen** vor großen Updates
2. **Docker Volume** `budget-data` niemals manuell löschen
3. Bei **Problemen**: Container stoppen, Daten sichern, neu starten

## 🚀 Zukunftssicherheit

Nach diesem Fix bleiben deine Daten bei allen zukünftigen Updates erhalten!
