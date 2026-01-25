@echo off
echo Erstelle echte .exe Wrapper...
echo.

REM Erstelle temporäres Verzeichnis
if exist "installer_exe" rmdir /s /q "installer_exe"
mkdir "installer_exe"

REM Kopiere Anwendungsdateien
xcopy "moneta_desktop\*" "installer_exe\Moneta Budget Planner\" /E /I /Y /Q >nul

REM Erstelle eine echte .exe Datei mit Windows Resource Kit Methode
echo Erstelle .exe Wrapper...

REM Verwende PowerShell um eine echte .exe zu erstellen
powershell -Command "
Add-Type -AssemblyName System.Windows.Forms
Add-Type -AssemblyName System.Drawing

# Erstelle eine einfache Windows Forms Anwendung
$source = @"
using System;
using System.Diagnostics;
using System.IO;
using System.Windows.Forms;
using System.Drawing;

class Program
{
    [STAThread]
    static void Main()
    {
        try
        {
            string appPath = Path.Combine(Application.StartupPath, \"electron_with_database.cjs\");
            if (File.Exists(appPath))
            {
                ProcessStartInfo psi = new ProcessStartInfo
                {
                    FileName = \"node\",
                    Arguments = $\"\"{appPath}\"\",
                    UseShellExecute = false,
                    WorkingDirectory = Application.StartupPath
                };
                Process.Start(psi);
            }
            else
            {
                MessageBox.Show(\"Anwendung nicht gefunden: \" + appPath, \"Fehler\", MessageBoxButtons.OK, MessageBoxIcon.Error);
            }
        }
        catch (Exception ex)
        {
            MessageBox.Show(\"Fehler beim Starten: \" + ex.Message, \"Fehler\", MessageBoxButtons.OK, MessageBoxIcon.Error);
        }
    }
}
"@

# Kompiliere die .exe
Add-Type -TypeDefinition $source -OutputAssembly "installer_exe\Moneta Budget Planner\MonetaBudgetPlanner.exe" -ReferencedAssemblies "System.Windows.Forms", "System.Drawing"
"

echo Erstelle NSIS Skript...
(
echo !define APP_NAME "Moneta Budget Planner"
echo !define INSTALL_DIR "C:\Program Files\Moneta Budget Planner"
echo.
echo Name "${APP_NAME}"
echo OutFile "MonetaBudgetPlanner_Real.exe"
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
echo   ; Erstelle Shortcuts auf die echte .exe
echo   CreateShortCut "$DESKTOP\${APP_NAME}.lnk" "$INSTDIR\MonetaBudgetPlanner.exe"
echo   CreateShortCut "$SMPROGRAMS\${APP_NAME}.lnk" "$INSTDIR\MonetaBudgetPlanner.exe"
echo SectionEnd
echo.
echo Section "Uninstall"
echo   Delete "$DESKTOP\${APP_NAME}.lnk"
echo   Delete "$SMPROGRAMS\${APP_NAME}.lnk"
echo   RMDir /r "$INSTDIR"
echo SectionEnd
) > "installer_exe\installer.nsi"

echo Erstelle Installer mit echter .exe...
cd "installer_exe"
"C:\Program Files (x86)\NSIS\makensis.exe" "installer.nsi"
cd ..

move "installer_exe\MonetaBudgetPlanner_Real.exe" "MonetaBudgetPlanner_Real.exe"

echo.
echo ✅ Echter Installer mit echter .exe erstellt: MonetaBudgetPlanner_Real.exe
echo.
echo Die Desktop-Shortcut zeigt jetzt auf eine echte .exe Datei!
echo.
pause
