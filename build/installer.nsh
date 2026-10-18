!define MUI_BGCOLOR "0B0C0F"
!define MUI_TEXTCOLOR "F2F3F5"
!define MUI_INSTFILESPAGE_COLORS "F2F3F5 0B0C0F"
!define MUI_FINISHPAGE_LINK_COLOR "ED1C24"
!define MUI_WELCOMEPAGE_TITLE_3LINES
!define MUI_FINISHPAGE_TITLE_3LINES

!macro customHeader
  BrandingText "BARLAS BIT TECHNOLOGY"
!macroend

!macro customFinishPage
  Function BarlasStartApp
    ${if} ${isUpdated}
      StrCpy $1 "--updated"
    ${else}
      StrCpy $1 ""
    ${endif}
    ${StdUtils.ExecShellAsUser} $0 "$launchLink" "open" "$1"
  FunctionEnd

  Function BarlasCreateDesktopShortcut
    CreateShortCut "$DESKTOP\${SHORTCUT_NAME}.lnk" "$INSTDIR\${APP_EXECUTABLE_FILENAME}" "" "$INSTDIR\${APP_EXECUTABLE_FILENAME}" 0 "" "" "${APP_DESCRIPTION}"
    WinShell::SetLnkAUMI "$DESKTOP\${SHORTCUT_NAME}.lnk" "${APP_ID}"
    System::Call 'Shell32::SHChangeNotify(i 0x8000000, i 0, i 0, i 0)'
  FunctionEnd

  !define MUI_FINISHPAGE_RUN
  !define MUI_FINISHPAGE_RUN_TEXT "Запустить BARLAS Browser"
  !define MUI_FINISHPAGE_RUN_FUNCTION "BarlasStartApp"
  !define MUI_FINISHPAGE_SHOWREADME
  !define MUI_FINISHPAGE_SHOWREADME_NOTCHECKED
  !define MUI_FINISHPAGE_SHOWREADME_TEXT "Добавить ярлык на рабочий стол"
  !define MUI_FINISHPAGE_SHOWREADME_FUNCTION "BarlasCreateDesktopShortcut"
  !insertmacro MUI_PAGE_FINISH
!macroend
