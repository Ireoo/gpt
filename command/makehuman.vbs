set WshShell = WScript.CreateObject("WScript.Shell")
strDesktop = WshShell.SpecialFolders("Desktop")
' strPrograms = WshShell.SpecialFolders("MyDocuments")
strPrograms = WScript.Arguments.Item(0)

set oShellLink = WshShell.CreateShortcut(strDesktop & "\iHuman.lnk")
' path = chr(34) & strPrograms & "\makehuman-community\Python\pythonw.exe" & chr(34) & " " & chr(34) & strPrograms & "\makehuman-community\mhstartwrapper.py" & chr(34)
' path = strPrograms & "\makehuman-community\start.bat"
path = strPrograms & "\Python\pythonw.exe"

' WScript.Echo path

oShellLink.TargetPath = chr(34) & path & chr(34)
oShellLink.Arguments = chr(34) & strPrograms & "\mhstartwrapper.py" & chr(34)
oShellLink.WindowStyle = 1
oShellLink.IconLocation = strPrograms & "\makehuman.ico"
oShellLink.WorkingDirectory = chr(34) & strPrograms & "\makehuman" & chr(34)
oShellLink.Save
