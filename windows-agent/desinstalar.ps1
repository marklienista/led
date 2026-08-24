$ErrorActionPreference = 'SilentlyContinue'
Get-Process 'SomDaTurma.WindowsAgent' | Stop-Process -Force
$startup = [Environment]::GetFolderPath('Startup')
Remove-Item (Join-Path $startup 'Som da Turma LED.lnk') -Force
Remove-Item (Join-Path $env:LOCALAPPDATA 'SomDaTurmaLED') -Recurse -Force
Write-Host 'Som da Turma removido deste computador.' -ForegroundColor Green
