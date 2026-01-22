# Budget Planner

Ein leichtgewichtiger, webbasierter Budget-Planner für Einzelpersonen und Familien.

## Features

- **Haushalt & Familienmitglieder**: Verwalten Sie mehrere Familienmitglieder in einem Haushalt
- **Fixkosten**: Wiederkehrende Kosten mit monatlichem oder jährlichem Intervall
- **Abonnements**: Separate Verwaltung von Abos mit Zahlungsdatum
- **Monatsübersicht**: Zentrale Ansicht aller Ausgaben des aktuellen Monats
- **Statistik**: Grafische Auswertungen mit Charts (Kategorien, Fixkosten vs. Variable, pro Familienmitglied)
- **Export**: CSV und JSON Export für gesamten Haushalt oder einzelne Monate

## Technologie

- **Frontend**: React 18 + TypeScript + TailwindCSS
- **Charts**: Recharts
- **Icons**: Lucide React
- **Backend**: Express.js
- **Datenbank**: SQLite (lokal)
- **Build**: Vite
- **Container**: Docker

## Schnellstart mit Docker

```bash
docker compose up -d
```

Die Anwendung ist dann unter `http://localhost:3001` erreichbar.

## Lokale Entwicklung

### Voraussetzungen

- Node.js 18+
- npm

### Installation

```bash
npm install
```

### Entwicklungsserver starten

```bash
npm run dev
```

Frontend läuft auf `http://localhost:3000`

### Backend starten

```bash
npm start
```

Backend läuft auf `http://localhost:3001`

### Production Build

```bash
npm run build
```

## Projektstruktur

```
budget-planner/
├── src/                    # React Frontend
│   ├── components/         # React Komponenten
│   ├── types.ts           # TypeScript Typen
│   ├── App.tsx            # Haupt-App Komponente
│   └── main.tsx           # Entry Point
├── server/                # Express Backend
│   └── index.js           # API Server
├── docker-compose.yml     # Docker Compose Konfiguration
├── Dockerfile             # Docker Image Definition
└── package.json           # Dependencies
```

## API Endpoints

- `GET /api/family-members` - Alle Familienmitglieder
- `POST /api/family-members` - Neues Familienmitglied
- `DELETE /api/family-members/:id` - Familienmitglied löschen
- `GET /api/fixed-costs` - Alle Fixkosten
- `POST /api/fixed-costs` - Neue Fixkosten
- `DELETE /api/fixed-costs/:id` - Fixkosten löschen
- `GET /api/subscriptions` - Alle Abonnements
- `POST /api/subscriptions` - Neues Abonnement
- `DELETE /api/subscriptions/:id` - Abonnement löschen
- `GET /api/month-summary` - Monatsübersicht
- `GET /api/export?format=csv|json` - Daten exportieren

## Datenbank

Die SQLite Datenbank wird automatisch beim ersten Start erstellt. Die Datei `budget.db` wird im Projektverzeichnis gespeichert.

## Lizenz

MIT
