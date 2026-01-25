# Moneta Budget Planner - Lokale Desktop-Version

Eine lokale Desktop-Anwendung für Budget-Planung ohne Login-System.

## Änderungen zur Original-Version

- **Login entfernt**: Keine Benutzerauthentifizierung mehr nötig
- **Lokale Datenbank**: Datenbank wird im Projektordner gespeichert (nicht in AppData)
- **Einrichtungsmodus entfernt**: Direkter Start zur Anwendung
- **Offline-fähig**: Vollständige lokale Funktionalität

## Installation

### Voraussetzungen
- Node.js 18 oder höher
- npm oder yarn

### Entwicklung
```bash
# Repository klonen
git clone https://github.com/sysexperts/budgetExperts.git
cd budgetExperts

# Abhängigkeiten installieren
npm install

# Anwendung starten (Entwicklungsmodus)
npm run electron-dev
```

### Produktions-Build
```bash
# Anwendung bauen
npm run build

# Electron-App erstellen
npm run electron-build
```

## Datenbank

Die SQLite-Datenbank wird automatisch im Projektverzeichnis erstellt:
- `budget.db` - Hauptdatenbank
- `budget_backup_*.db` - Automatische Backups

## Funktionen

- **Haushaltsverwaltung**: Mehrere Haushalte und Familienmitglieder verwalten
- **Kostenverfolgung**: Fixkosten, Abonnements und Ratenpläne
- **Sparziele**: Ziele setzen und verfolgen
- **Analytik**: Visualisierungen und Auswertungen
- **Export**: CSV- und JSON-Export

## Technologie-Stack

- **Frontend**: React 18, TypeScript, TailwindCSS
- **Backend**: Express.js, SQLite (sql.js)
- **Desktop**: Electron
- **Build**: Vite, electron-builder

## Lizenz

MIT
