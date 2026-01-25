@echo off
echo Erstelle portable Moneta Desktop App...

REM Erstelle Verzeichnis
if not exist "moneta_portable" mkdir moneta_portable
if not exist "moneta_portable\resources" mkdir moneta_portable\resources

REM Kopiere notwendige Dateien
echo Kopiere Dateien...
copy "public\electron.js" "moneta_portable\"
copy "public\preload.js" "moneta_portable\"
copy "package.json" "moneta_portable\"
xcopy "dist" "moneta_portable\dist\" /E /I /Y
xcopy "server" "moneta_portable\server\" /E /I /Y
xcopy "node_modules" "moneta_portable\node_modules\" /E /I /Y

REM Erstelle Start-Skript
echo @echo off > "moneta_portable\start_moneta.bat"
echo cd /d "%%~dp0" >> "moneta_portable\start_moneta.bat"
echo set ELECTRON_USER_DATA=%%~dp0data >> "moneta_portable\start_moneta.bat"
echo if not exist "%%~dp0data" mkdir "%%~dp0data" >> "moneta_portable\start_moneta.bat"
echo npx electron . >> "moneta_portable\start_moneta.bat"

echo Portable App erstellt in "moneta_portable" Verzeichnis!
echo Starte mit: start_moneta.bat
pause
