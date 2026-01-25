@echo off
echo Erstelle finalen Installer mit direktem Shortcut...
echo.

REM Erstelle temporäres Verzeichnis
if exist "installer_final" rmdir /s /q "installer_final"
mkdir "installer_final"

REM Kopiere Anwendungsdateien
xcopy "moneta_desktop\*" "installer_final\Moneta Budget Planner\" /E /I /Y /Q >nul

REM Erstelle einfache Start-Datei
echo @echo off > "installer_final\Moneta Budget Planner\start.bat"
echo cd /d "%%~dp0" >> "installer_final\Moneta Budget Planner\start.bat"
echo electron_with_database.cjs >> "installer_final\Moneta Budget Planner\start.bat"

REM Erstelle NSIS Skript
(
echo !define APP_NAME "Moneta Budget Planner"
echo !define INSTALL_DIR "C:\Program Files\Moneta Budget Planner"
echo.
echo Name "${APP_NAME}"
echo OutFile "MonetaBudgetPlanner_Final.exe"
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
echo   ; Erstelle Shortcuts direkt auf die ausfuehrbare Datei
echo   CreateShortCut "$DESKTOP\${APP_NAME}.lnk" "$INSTDIR\start.bat" "" "" "" "" "" "Moneta Budget Planner"
echo   CreateShortCut "$SMPROGRAMS\${APP_NAME}.lnk" "$INSTDIR\start.bat" "" "" "" "" "" "Moneta Budget Planner"
echo SectionEnd
echo.
echo Section "Uninstall"
echo   Delete "$DESKTOP\${APP_NAME}.lnk"
echo   Delete "$SMPROGRAMS\${APP_NAME}.lnk"
echo   RMDir /r "$INSTDIR"
echo SectionEnd
) > "installer_final\installer.nsi"

echo Erstelle finalen Installer...
cd "installer_final"
"C:\Program Files (x86)\NSIS\makensis.exe" "installer.nsi"
cd ..

move "installer_final\MonetaBudgetPlanner_Final.exe" "MonetaBudgetPlanner_Final.exe"

echo.
echo ✅ Finaler Installer erstellt: MonetaBudgetPlanner_Final.exe
echo.
echo Nach der Installation findest du die Anwendung unter:
echo - Desktop: Moneta Budget Planner
echo - Startmenü: Moneta Budget Planner
echo.
echo Die Anwendung startet dann automatisch!
echo.
pause
