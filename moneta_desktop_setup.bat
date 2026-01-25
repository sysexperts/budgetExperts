@echo off
echo Moneta Budget Planner - Desktop Setup
echo =====================================
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

REM Erstelle portable App
echo.
echo Erstelle portable Anwendung...
if not exist "moneta_desktop" mkdir moneta_desktop

REM Kopiere notwendige Dateien
echo Kopiere Anwendungsdateien...
copy "public\electron.cjs" "moneta_desktop\electron.cjs"
copy "public\preload.js" "moneta_desktop\preload.js"
copy "package.json" "moneta_desktop\package.json"
xcopy "dist" "moneta_desktop\dist\" /E /I /Y /Q >nul
xcopy "server" "moneta_desktop\server\" /E /I /Y /Q >nul

REM Kopiere nur notwendige node_modules
echo Kopiere Abhängigkeiten...
if not exist "moneta_desktop\node_modules" mkdir moneta_desktop\node_modules
xcopy "node_modules\electron" "moneta_desktop\node_modules\electron\" /E /I /Y /Q >nul
xcopy "node_modules\electron-is-dev" "moneta_desktop\node_modules\electron-is-dev\" /E /I /Y /Q >nul
xcopy "node_modules\express" "moneta_desktop\node_modules\express\" /E /I /Y /Q >nul
xcopy "node_modules\sql.js" "moneta_desktop\node_modules\sql.js\" /E /I /Y /Q >nul
xcopy "node_modules\fs" "moneta_desktop\node_modules\fs\" /E /I /Y /Q >nul 2>nul
xcopy "node_modules\path" "moneta_desktop\node_modules\path\" /E /I /Y /Q >nul 2>nul
xcopy "node_modules\crypto" "moneta_desktop\node_modules\crypto\" /E /I /Y /Q >nul 2>nul
xcopy "node_modules\os" "moneta_desktop\node_modules\os\" /E /I /Y /Q >nul 2>nul

REM Erstelle Start-Skript
echo Erstelle Start-Skript...
(
echo @echo off
echo cd /d "%%~dp0"
echo set ELECTRON_USER_DATA=%%~dp0data
echo if not exist "%%~dp0data" mkdir "%%~dp0data"
echo echo Starte Moneta Budget Planner...
echo npx electron .
echo pause
) > "moneta_desktop\start_moneta.bat"

REM Korrigiere package.json main entry
echo Korrigiere package.json...
powershell -Command "(Get-Content 'moneta_desktop\package.json') -replace '\"main\": \"public/electron.cjs\"', '\"main\": \"electron.cjs\"' | Set-Content 'moneta_desktop\package.json'"

REM Erstelle README
(
echo Moneta Budget Planner - Desktop Version
echo =====================================
echo.
echo Start: start_moneta.bat
echo.
echo Daten werden gespeichert in: data\budget.db
echo.
echo Benötigt: Node.js (bereits installiert)
) > "moneta_desktop\README.txt"

echo.
echo Fertig! Portable Anwendung erstellt in "moneta_desktop" Ordner.
echo.
echo Starte mit: moneta_desktop\start_moneta.bat
echo.
pause
