@echo off
echo Erstelle kompletten Installer mit allen DLLs...
echo.

REM Finde Electron.exe und DLLs
set ELECTRON_DIR=
for /f "delims=" %%i in ('dir /s /b "node_modules\electron\dist" 2^>nul') do (
    set ELECTRON_DIR=%%i
    goto :found
)
:found

if not defined ELECTRON_DIR (
    echo Electron Verzeichnis nicht gefunden!
    pause
    exit /b 1
)

echo Electron Verzeichnis: %ELECTRON_DIR%

REM Erstelle temporäres Verzeichnis
if exist "installer_complete" rmdir /s /q "installer_complete"
mkdir "installer_complete"

REM Kopiere Anwendungsdateien
xcopy "moneta_desktop\*" "installer_complete\Moneta Budget Planner\" /E /I /Y /Q >nul

REM Kopiere Electron.exe und alle DLLs
copy "%ELECTRON_DIR%\electron.exe" "installer_complete\Moneta Budget Planner\MonetaBudgetPlanner.exe"
copy "%ELECTRON_DIR%\*.dll" "installer_complete\Moneta Budget Planner\" >nul

REM Kopiere auch andere notwendige Dateien
copy "%ELECTRON_DIR%\*.pak" "installer_complete\Moneta Budget Planner\" >nul
xcopy "%ELECTRON_DIR%\locales" "installer_complete\Moneta Budget Planner\locales\" /E /I /Y /Q >nul

REM Erstelle package.json fuer Electron
(
echo {
echo   "name": "moneta-budget-planner",
echo   "version": "1.0.0",
echo   "main": "electron_with_database.cjs"
echo }
) > "installer_complete\Moneta Budget Planner\package.json"

echo Erstelle NSIS Skript...
(
echo !define APP_NAME "Moneta Budget Planner"
echo !define INSTALL_DIR "C:\Program Files\Moneta Budget Planner"
echo.
echo Name "${APP_NAME}"
echo OutFile "MonetaBudgetPlanner_Complete.exe"
echo InstallDir "${INSTALL_DIR}"
echo RequestExecutionLevel admin
echo.
echo Page directory
echo Page instfiles
echo.
echo Section "MainSection" SEC01
echo   SetOutPath "$INSTDIR"
echo   File /r "Moneta Budget Planner\*.*"
echo   CreateDirectory "$INSTDIR\data"
echo   ; Erstelle Shortcuts auf die echte Electron.exe
echo   CreateShortCut "$DESKTOP\${APP_NAME}.lnk" "$INSTDIR\MonetaBudgetPlanner.exe"
echo   CreateShortCut "$SMPROGRAMS\${APP_NAME}.lnk" "$INSTDIR\MonetaBudgetPlanner.exe"
echo SectionEnd
echo.
echo Section "Uninstall"
echo   Delete "$DESKTOP\${APP_NAME}.lnk"
echo   Delete "$SMPROGRAMS\${APP_NAME}.lnk"
echo   RMDir /r "$INSTDIR"
echo SectionEnd
) > "installer_complete\installer.nsi"

echo Erstelle kompletten Installer...
cd "installer_complete"
"C:\Program Files (x86)\NSIS\makensis.exe" "installer.nsi"
cd ..

move "installer_complete\MonetaBudgetPlanner_Complete.exe" "MonetaBudgetPlanner_Complete.exe"

echo.
echo ✅ Kompletter Installer erstellt: MonetaBudgetPlanner_Complete.exe
echo.
echo Enthaelt alle notwendigen DLLs (ffmpeg.dll, etc.)
echo Die Desktop-Shortcut zeigt auf eine echte Electron.exe!
echo.
pause
