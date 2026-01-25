; Custom NSIS script for Moneta Budget Planner Installer

; Modern UI
!include "MUI2.nsh"

; Installer configuration
Name "Moneta Budget Planner"
OutFile "MonetaBudgetPlannerSetup.exe"
InstallDir "$PROGRAMFILES\Moneta Budget Planner"
InstallDirRegKey HKLM "Software\MonetaBudgetPlanner" "InstallPath"
RequestExecutionLevel admin

; Variables
Var StartMenuFolder

; Interface settings
!define MUI_ABORTWARNING
!define MUI_ICON "public\icon.ico"
!define MUI_UNICON "public\icon.ico"

; Pages
!insertmacro MUI_PAGE_WELCOME
!insertmacro MUI_PAGE_LICENSE "LICENSE.txt"
!insertmacro MUI_PAGE_COMPONENTS
!insertmacro MUI_PAGE_DIRECTORY
!insertmacro MUI_PAGE_STARTMENU Application $StartMenuFolder
!insertmacro MUI_PAGE_INSTFILES
!insertmacro MUI_PAGE_FINISH

!insertmacro MUI_UNPAGE_WELCOME
!insertmacro MUI_UNPAGE_CONFIRM
!insertmacro MUI_UNPAGE_INSTFILES
!insertmacro MUI_UNPAGE_FINISH

; Languages
!insertmacro MUI_LANGUAGE "German"

; Installer sections
Section "Moneta Budget Planner" SecMain

  SectionIn RO
  
  SetOutPath "$INSTDIR"
  File /r "dist\*"
  File /r "server\*"
  File "electron_with_database.cjs"
  File "package.json"
  
  ; Create data directory
  CreateDirectory "$INSTDIR\data"
  
  ; Write installation files
  WriteRegStr HKLM "Software\MonetaBudgetPlanner" "InstallPath" "$INSTDIR"
  WriteRegStr HKLM "Software\MonetaBudgetPlanner" "DisplayName" "Moneta Budget Planner"
  WriteRegStr HKLM "Software\MonetaBudgetPlanner" "UninstallString" "$INSTDIR\Uninstall.exe"
  
  ; Create uninstaller
  WriteUninstaller "$INSTDIR\Uninstall.exe"
  
  ; Create shortcuts
  !insertmacro MUI_STARTMENU_WRITE_BEGIN Application
    CreateDirectory "$SMPROGRAMS\$StartMenuFolder"
    CreateShortCut "$SMPROGRAMS\$StartMenuFolder\Moneta Budget Planner.lnk" "$INSTDIR\electron_with_database.cjs" "" "$INSTDIR\icon.ico"
    CreateShortCut "$SMPROGRAMS\$StartMenuFolder\Uninstall.lnk" "$INSTDIR\Uninstall.exe"
  !insertmacro MUI_STARTMENU_WRITE_END
  
  ; Create desktop shortcut
  CreateShortCut "$DESKTOP\Moneta Budget Planner.lnk" "$INSTDIR\electron_with_database.cjs" "" "$INSTDIR\icon.ico"
  
  ; Register file association for .db files
  WriteRegStr HKCR ".monetadb" "" "MonetaDatabase"
  WriteRegStr HKCR "MonetaDatabase" "" "Moneta Budget Database"
  WriteRegStr HKCR "MonetaDatabase\DefaultIcon" "" "$INSTDIR\icon.ico"
  WriteRegStr HKCR "MonetaDatabase\shell\open\command" "" '"$INSTDIR\electron_with_database.cjs" "%1"'

SectionEnd

; Uninstaller section
Section "Uninstall"

  ; Remove files and directories
  RMDir /r "$INSTDIR"
  
  ; Remove shortcuts
  !insertmacro MUI_STARTMENU_GETFOLDER Application $StartMenuFolder
  Delete "$SMPROGRAMS\$StartMenuFolder\Moneta Budget Planner.lnk"
  Delete "$SMPROGRAMS\$StartMenuFolder\Uninstall.lnk"
  RMDir "$SMPROGRAMS\$StartMenuFolder"
  Delete "$DESKTOP\Moneta Budget Planner.lnk"
  
  ; Remove registry keys
  DeleteRegKey HKLM "Software\MonetaBudgetPlanner"
  DeleteRegKey HKLM "Software\Microsoft\Windows\CurrentVersion\Uninstall\MonetaBudgetPlanner"
  DeleteRegKey HKCR ".monetadb"
  DeleteRegKey HKCR "MonetaDatabase"

SectionEnd

; Component descriptions
LangString DESC_SecMain ${LANG_GERMAN} "Moneta Budget Planner Hauptanwendung"

!insertmacro MUI_FUNCTION_DESCRIPTION_BEGIN
  !insertmacro MUI_DESCRIPTION_TEXT ${SecMain} $(DESC_SecMain)
!insertmacro MUI_FUNCTION_DESCRIPTION_END
