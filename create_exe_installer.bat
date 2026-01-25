@echo off
echo Erstelle Installer mit echter .exe Datei...
echo.

REM Erstelle temporäres Verzeichnis
if exist "installer_temp2" rmdir /s /q "installer_temp2"
mkdir "installer_temp2"

REM Kopiere Anwendungsdateien
xcopy "moneta_desktop\*" "installer_temp2\Moneta Budget Planner\" /E /I /Y /Q >nul

REM Erstelle echte .exe Datei
copy "MonetaBudgetPlanner.bat" "installer_temp2\Moneta Budget Planner\MonetaBudgetPlanner.exe"

REM Erstelle NSIS Skript
(
echo !define APP_NAME "Moneta Budget Planner"
echo !define INSTALL_DIR "C:\Program Files\Moneta Budget Planner"
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
echo   File /r "Moneta Budget Planner\*.*"
echo   CreateDirectory "$INSTDIR\data"
echo   CreateShortCut "$DESKTOP\${APP_NAME}.lnk" "$INSTDIR\MonetaBudgetPlanner.exe"
echo   CreateShortCut "$SMPROGRAMS\${APP_NAME}.lnk" "$INSTDIR\MonetaBudgetPlanner.exe"
echo SectionEnd
echo.
echo Section "Uninstall"
echo   Delete "$DESKTOP\${APP_NAME}.lnk"
echo   Delete "$SMPROGRAMS\${APP_NAME}.lnk"
echo   RMDir /r "$INSTDIR"
echo SectionEnd
) > "installer_temp2\installer.nsi"

echo Erstelle Installer...
cd "installer_temp2"
"C:\Program Files (x86)\NSIS\makensis.exe" "installer.nsi"
cd ..

move "installer_temp2\MonetaBudgetPlannerSetup.exe" "MonetaBudgetPlannerSetup_v2.exe"

echo.
echo ✅ Installer mit echter .exe erstellt: MonetaBudgetPlannerSetup_v2.exe
echo.
pause
