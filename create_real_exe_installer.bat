@echo off
echo Erstelle echte Windows .exe Anwendung...
echo.

REM Erstelle temporäres Verzeichnis
if exist "installer_real" rmdir /s /q "installer_real"
mkdir "installer_real"

REM Kopiere Anwendungsdateien
xcopy "moneta_desktop\*" "installer_real\Moneta Budget Planner\" /E /I /Y /Q >nul

REM Erstelle echtes Windows-Programm mit PowerShell
powershell -Command "
$source = '@echo off
cd /d \"%%~dp0\"
electron_with_database.cjs
pause'
$bytes = [System.Text.Encoding]::UTF8.GetBytes($source)
[System.IO.File]::WriteAllBytes('installer_real\Moneta Budget Planner\MonetaBudgetPlanner.exe', $bytes)
"

REM Erstelle NSIS Skript mit x64 Architektur
(
echo !define APP_NAME "Moneta Budget Planner"
echo !define INSTALL_DIR "C:\Program Files\Moneta Budget Planner"
echo.
echo Name "${APP_NAME}"
echo OutFile "MonetaBudgetPlannerSetup_x64.exe"
echo InstallDir "${INSTALL_DIR}"
echo RequestExecutionLevel admin
echo.
echo ; Setze x64 Architektur
echo !include "x64.nsh"
echo.
echo Page directory
echo Page instfiles
echo.
echo Section "MainSection" SEC01
echo   SetOutPath "$INSTDIR"
echo   File /r "Moneta Budget Planner\*.*"
echo   CreateDirectory "$INSTDIR\data"
echo   CreateShortCut "$DESKTOP\${APP_NAME}.lnk" "$INSTDIR\electron_with_database.cjs" "" "" "" "" "" "Moneta Budget Planner"
echo   CreateShortCut "$SMPROGRAMS\${APP_NAME}.lnk" "$INSTDIR\electron_with_database.cjs" "" "" "" "" "" "Moneta Budget Planner"
echo SectionEnd
echo.
echo Section "Uninstall"
echo   Delete "$DESKTOP\${APP_NAME}.lnk"
echo   Delete "$SMPROGRAMS\${APP_NAME}.lnk"
echo   RMDir /r "$INSTDIR"
echo SectionEnd
) > "installer_real\installer_x64.nsi"

echo Erstelle x64 Installer...
cd "installer_real"
"C:\Program Files (x86)\NSIS\makensis.exe" "installer_x64.nsi"
cd ..

move "installer_real\MonetaBudgetPlannerSetup_x64.exe" "MonetaBudgetPlannerSetup_x64.exe"

echo.
echo ✅ x64 Installer erstellt: MonetaBudgetPlannerSetup_x64.exe
echo.
echo Die Anwendung startet direkt mit electron_with_database.cjs
echo.
pause
