@echo off
echo ========================================================
echo Starting Spring Boot DSA Learning Platform Backend...
echo ========================================================

where mvn >nul 2>nul
if %ERRORLEVEL% EQU 0 (
    echo Maven detected. Running with Maven...
    mvn spring-boot:run
) else (
    echo [ERROR] Maven is not installed or not in your system PATH.
    echo Please install Java 17+ and Maven, or open this folder in VS Code
    echo with the 'Extension Pack for Java' and click 'Run'.
    pause
)
