$ErrorActionPreference = 'Stop'
$source = Join-Path $PSScriptRoot 'SomDaTurma.WindowsAgent.exe'
if (-not (Test-Path $source)) {
  Write-Host 'ERRO: coloque SomDaTurma.WindowsAgent.exe na mesma pasta deste instalador.' -ForegroundColor Red
  exit 1
}

$destDir = Join-Path $env:LOCALAPPDATA 'SomDaTurmaLED'
$destExe = Join-Path $destDir 'SomDaTurma.WindowsAgent.exe'

# Encerra uma versão anterior para permitir atualização do executável.
Get-Process 'SomDaTurma.WindowsAgent' -ErrorAction SilentlyContinue | Stop-Process -Force -ErrorAction SilentlyContinue
Start-Sleep -Milliseconds 500

New-Item -ItemType Directory -Force -Path $destDir | Out-Null
Copy-Item $source $destExe -Force

$startup = [Environment]::GetFolderPath('Startup')
$shortcutPath = Join-Path $startup 'Som da Turma LED.lnk'
$ws = New-Object -ComObject WScript.Shell
$shortcut = $ws.CreateShortcut($shortcutPath)
$shortcut.TargetPath = $destExe
$shortcut.WorkingDirectory = $destDir
$shortcut.Description = 'Agente de atenção do Som da Turma - LED'
$shortcut.Save()

Start-Process $destExe
Write-Host 'Som da Turma instalado/atualizado e iniciado.' -ForegroundColor Green
Write-Host 'Ele também iniciará automaticamente com o Windows.'
