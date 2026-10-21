# CloudPack: Cloud Resource Scheduler & FinOps Optimizer
# PowerShell Build and Execution Script

$ErrorActionPreference = "Stop"

Write-Host "====================================================================" -ForegroundColor Cyan
Write-Host "  CLOUDPACK: CLOUD RESOURCE SCHEDULER & FINOPS CLUSTER OPTIMIZER   " -ForegroundColor Cyan
Write-Host "  DSA Capstone Suite (Java Native + Pure Web Interface)             " -ForegroundColor Cyan
Write-Host "====================================================================" -ForegroundColor Cyan
Write-Host ""

$scriptDir = Split-Path -Parent $MyInvocation.MyCommand.Definition
Set-Location $scriptDir

$binDir = Join-Path $scriptDir "bin"
if (-not (Test-Path $binDir)) {
    New-Item -ItemType Directory -Path $binDir | Out-Null
}

Write-Host "[1/2] Compiling Java source files..." -ForegroundColor Yellow
$javaFiles = Get-ChildItem -Path (Join-Path $scriptDir "src") -Filter "*.java" -Recurse | Select-Object -ExpandProperty FullName
javac -d $binDir $javaFiles

if ($LASTEXITCODE -ne 0) {
    Write-Host "[ERROR] Java compilation failed." -ForegroundColor Red
    exit 1
}

Write-Host "[2/2] Compilation successful!" -ForegroundColor Green
Write-Host ""
Write-Host "Starting Embedded HTTP Server on http://localhost:8090 ..." -ForegroundColor Cyan
Write-Host "Press Ctrl+C in this console to stop the server." -ForegroundColor Gray
Write-Host ""

Start-Process "http://localhost:8090"
java -cp $binDir server.HttpServerApp 8090
