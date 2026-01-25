# Desktop-Anwendung Build

## Voraussetzungen
- Node.js installiert
- Alle Abhängigkeiten installiert (`npm install`)

## Entwicklung (Desktop-Modus)
```bash
npm run electron-dev
```
Startet die Vite-Entwicklungsumgebung und Electron gleichzeitig.

## Produktion Build
```bash
npm run electron-build
```
Baut die Anwendung und erstellt den Installer.

## Nur Build (ohne Installer)
```bash
npm run pack
```
Erstellt die gepackte Anwendung ohne Installer.

## Installer erstellen
```bash
npm run dist
```
Erstellt den vollständigen Installer für Windows.

## Ausgabe
Die gebauten Dateien werden im `release/` Verzeichnis abgelegt:
- `Moneta Budget Planner Setup x.x.x.exe` - Windows Installer
- `moneta-budget-planner-x.x.x.exe` - Portable Version

## Datenbank-Speicherort
In der Desktop-Version wird die Datenbank gespeichert unter:
- Windows: `%APPDATA%\moneta\budget.db`
- macOS: `~/Library/Application Support/moneta/budget.db`
- Linux: `~/.config/moneta/budget.db`

## Besondere Funktionen der Desktop-Version
- **Automatische Backups**: Erzeugt automatisch Backups vor Datenbankänderungen
- **Menü-Funktionen**: Datenbank sichern/wiederherstellen über das Datei-Menü
- **Offline-Fähigkeit**: Vollständig funktionsfähig ohne Internetverbindung
- **Lokale Datenspeicherung**: Alle Daten verbleiben auf dem lokalen Computer
