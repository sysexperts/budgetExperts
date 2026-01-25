@echo off
echo Erstelle einfache .exe Loesung...
echo.

REM Finde Electron.exe
set ELECTRON_EXE=
for /f "delims=" %%i in ('dir /s /b "node_modules\electron\dist\electron.exe" 2^>nul') do (
    set ELECTRON_EXE=%%i
    goto :found
)
:found

if not defined ELECTRON_EXE (
    echo Electron.exe nicht gefunden!
    pause
    exit /b 1
)

echo Electron.exe gefunden: %ELECTRON_EXE%

REM Erstelle temporäres Verzeichnis
if exist "installer_simple" rmdir /s /q "installer_simple"
mkdir "installer_simple"

REM Kopiere Anwendungsdateien
xcopy "moneta_desktop\*" "installer_simple\Moneta Budget Planner\" /E /I /Y /Q >nul

REM Kopiere Electron.exe als MonetaBudgetPlanner.exe
copy "%ELECTRON_EXE%" "installer_simple\Moneta Budget Planner\MonetaBudgetPlanner.exe"

REM Erstelle package.json fuer Electron
(
echo {
echo   "name": "moneta-budget-planner",
echo   "version": "1.0.0",
echo   "main": "electron_with_database.cjs"
echo }
) > "installer_simple\Moneta Budget Planner\package.json"

echo Erstelle NSIS Skript...
(
echo !define APP_NAME "Moneta Budget Planner"
echo !define INSTALL_DIR "C:\Program Files\Moneta Budget Planner"
echo.
echo Name "${APP_NAME}"
echo OutFile "MonetaBudgetPlanner_Simple.exe"
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
) > "installer_simple\installer.nsi"

echo Erstelle Installer...
cd "installer_simple"
"C:\Program Files (x86)\NSIS\makensis.exe" "installer.nsi"
cd ..

move "installer_simple\MonetaBudgetPlanner_Simple.exe" "MonetaBudgetPlanner_Simple.exe"

echo.
echo ✅ Einfacher Installer erstellt: MonetaBudgetPlanner_Simple.exe
echo.
echo Die Desktop-Shortcut zeigt jetzt auf eine echte Electron.exe!
echo.
pause
