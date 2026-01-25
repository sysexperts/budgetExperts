@echo off
echo Moneta Budget Planner - Installer Erstellung
echo ==========================================
echo.

REM Prüfe ob Node.js installiert ist
node --version >nul 2>&1
if errorlevel 1 (
    echo Fehler: Node.js ist nicht installiert!
    echo Bitte installiere Node.js von https://nodejs.org/
    pause
    exit /b 1
)

echo Node.js gefunden: 
node --version

REM Frontend bauen
echo.
echo Baue Frontend...
call npm run build
if errorlevel 1 (
    echo Fehler beim Frontend-Build!
    pause
    exit /b 1
)

echo Frontend erfolgreich gebaut!

REM Installer erstellen
echo.
echo Erstelle Windows Installer...
call npm run dist
if errorlevel 1 (
    echo Fehler beim Installer-Erstellung!
    pause
    exit /b 1
)

echo.
echo ✅ Installer erfolgreich erstellt!
echo.
echo Installer befindet sich im Ordner: release\
echo.
echo Mögliche Installer-Dateien:
dir /b release\*.exe 2>nul
if errorlevel 1 (
    echo Keine .exe Dateien gefunden. Überprüfe das release\ Verzeichnis.
) else (
    echo.
    echo Die Installer-Datei kann jetzt verteilt werden!
)

echo.
pause
