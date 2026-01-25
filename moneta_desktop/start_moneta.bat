@echo off
cd /d "%~dp0"
set ELECTRON_USER_DATA=%~dp0data
if not exist "%~dp0data" mkdir "%~dp0data"
echo Starte Moneta Budget Planner...
npx electron .
pause
