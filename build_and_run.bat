@echo off
title CloudPack - Cloud Resource Scheduler & FinOps Optimizer
cd /d "%~dp0"
echo ====================================================================
echo  CLOUDPACK: CLOUD RESOURCE SCHEDULER & FINOPS CLUSTER OPTIMIZER
echo  DSA Laboratory Capstone Suite (Java + Web Dashboard)
echo ====================================================================
echo.

if not exist "bin" mkdir bin

echo [1/2] Compiling Java source files...
dir /s /b src\*.java > sources.txt
javac -d bin @sources.txt
if %errorlevel% neq 0 (
    echo [ERROR] Compilation failed.
    del sources.txt
    pause
    exit /b %errorlevel%
)
del sources.txt
echo [2/2] Compilation successful!
echo.
echo Starting Embedded HTTP Server on http://localhost:8080 ...
echo Press Ctrl+C in this window to stop the server.
echo.
start http://localhost:8080
java -cp bin server.HttpServerApp 8080
pause
