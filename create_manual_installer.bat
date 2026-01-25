@echo off
echo Erstelle manuellen Windows Installer für Moneta Budget Planner
echo ========================================================
echo.

REM Setze Variablen
set APP_NAME=Moneta Budget Planner
set APP_VERSION=1.0.0
set INSTALL_DIR=%PROGRAMFILES%\%APP_NAME%
set TEMP_DIR=installer_temp

REM Erstelle temporäres Verzeichnis
if exist "%TEMP_DIR%" rmdir /s /q "%TEMP_DIR%"
mkdir "%TEMP_DIR%"

echo Kopiere Anwendungsdateien...
REM Kopiere alle notwendigen Dateien
xcopy "moneta_desktop\*" "%TEMP_DIR%\%APP_NAME%\" /E /I /Y /Q >nul

echo Erstelle Installer-Skript...
REM Erstelle NSIS Skript
(
echo ; Moneta Budget Planner Installer Script
echo !define APP_NAME "%APP_NAME%"
echo !define APP_VERSION "%APP_VERSION%"
echo !define INSTALL_DIR "%INSTALL_DIR%"
echo.
echo Name "${APP_NAME}"
echo OutFile "MonetaBudgetPlannerSetup.exe"
echo InstallDir "${INSTALL_DIR}"
echo RequestExecutionLevel admin
echo.
echo Page directory
echo Page instfiles
echo.
echo Section "MainSection" SEC01
echo   SetOutPath "$INSTDIR"
echo   File /r "${TEMP_DIR}\${APP_NAME}\*.*"
echo   CreateDirectory "$INSTDIR\data"
echo   CreateShortCut "$DESKTOP\${APP_NAME}.lnk" "$INSTDIR\electron_with_database.cjs"
echo   CreateShortCut "$SMPROGRAMS\${APP_NAME}.lnk" "$INSTDIR\electron_with_database.cjs"
echo SectionEnd
echo.
echo Section "Uninstall"
echo   Delete "$DESKTOP\${APP_NAME}.lnk"
echo   Delete "$SMPROGRAMS\${APP_NAME}.lnk"
echo   RMDir /r "$INSTDIR"
echo SectionEnd
) > "%TEMP_DIR%\installer_script.nsi"

echo.
echo ✅ Vorbereitung abgeschlossen!
echo.
echo Um den Installer zu erstellen, benötigst du NSIS:
echo 1. Lade NSIS herunter: https://nsis.sourceforge.io/Download
echo 2. Installiere NSIS
echo 3. Kompiliere das Skript: "%TEMP_DIR%\installer_script.nsi"
echo.
echo Oder verwende den portablen Ordner direkt:
echo - Kopiere den Ordner "moneta_desktop"
echo - Starte mit "start_moneta.bat"
echo.
echo Der portable Ordner enthält bereits alles für die Anwendung!
echo.
pause
