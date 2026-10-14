@echo off
rem Starts the Spring Boot backend on http://localhost:8080.
rem Needs Java 17+ and PostgreSQL running. Maven is downloaded by mvnw.cmd.
cd /d "%~dp0"

echo ========================================================
echo Starting the DSA Universe backend (Spring Boot)...
echo ========================================================

where java >nul 2>nul
if %ERRORLEVEL% NEQ 0 if not defined JAVA_HOME (
    echo [ERROR] Java was not found. Install JDK 17, for example:
    echo     winget install EclipseAdoptium.Temurin.17.JDK
    echo Then open a new terminal and run this again.
    pause
    exit /b 1
)

if not exist ".env.local" (
    echo [ERROR] .env.local is missing. Copy .env.example to .env.local
    echo and put your PostgreSQL password in it. See README.md.
    pause
    exit /b 1
)

call mvnw.cmd spring-boot:run
