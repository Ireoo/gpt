set WshShell = WScript.CreateObject("WScript.Shell")
strDesktop = WshShell.SpecialFolders("Desktop")
' strPrograms = WshShell.SpecialFolders("MyDocuments")
strPrograms = WScript.Arguments.Item(0)

set oShellLink = WshShell.CreateShortcut(strDesktop & "\visionKitServer.lnk")
' path = chr(34) & strPrograms & "\server.exe" & chr(34)
' path = strPrograms & "\makehuman-community\start.bat"
path = strPrograms & "\node\node.exe"

' WScript.Echo path

oShellLink.TargetPath = chr(34) & path & chr(34)
oShellLink.Arguments = chr(34) & strPrograms & "\server.js" & chr(34)
oShellLink.WindowStyle = 1
oShellLink.IconLocation = strPrograms & "\visionKitServer.ico"
' oShellLink.WorkingDirectory = chr(34) & strPrograms & "\" & chr(34)
oShellLink.WorkingDirectory = strPrograms
oShellLink.Save
