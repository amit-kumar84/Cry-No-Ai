@echo off
REM ================================================================
REM   CRY-NO-AI Voice Assistant - Setup and Run Script
REM   Windows Batch File for Easy Setup
REM ================================================================

setlocal enabledelayedexpansion

echo.
echo ================================================================
echo    CRY-NO-AI Voice Assistant Setup
echo    Discord Rich Presence Integration
echo ================================================================
echo.

REM Check if Python is installed
python --version >nul 2>&1
if errorlevel 1 (
    echo [ERROR] Python is not installed or not in PATH
    echo.
    echo Please install Python from: https://www.python.org/downloads/
    echo Make sure to check "Add Python to PATH" during installation
    echo.
    pause
    exit /b 1
)

echo [OK] Python found
python --version

REM Check/Create virtual environment
if not exist "venv" (
    echo.
    echo [INFO] Creating virtual environment...
    python -m venv venv
    if errorlevel 1 (
        echo [ERROR] Failed to create virtual environment
        pause
        exit /b 1
    )
    echo [OK] Virtual environment created
)

REM Activate virtual environment
echo.
echo [INFO] Activating virtual environment...
call venv\Scripts\activate.bat

REM Install/upgrade pip
echo.
echo [INFO] Upgrading pip...
python -m pip install --upgrade pip --quiet

REM Install required packages
echo.
echo [INFO] Installing required packages...
pip install pypresence pillow websockets aiohttp --quiet

if errorlevel 1 (
    echo [ERROR] Failed to install packages
    pause
    exit /b 1
)

echo [OK] All packages installed

REM Check for config.json
if not exist "config.json" (
    echo.
    echo [INFO] Creating default configuration...
    (
        echo {
        echo     "discord_client_id": "",
        echo     "app_name": "CRY-NO-AI Voice Assistant",
        echo     "version": "2.0",
        echo     "update_interval": 15,
        echo     "enable_party": true,
        echo     "web_dashboard_url": "",
        echo     "enable_web_sync": true,
        echo     "rich_presence": {
        echo         "large_images": ["logo", "working", "idle", "listening", "speaking"],
        echo         "small_images": ["python", "online", "away", "busy"],
        echo         "states": [
        echo             "Listening for commands",
        echo             "Processing voice input",
        echo             "Idle - Waiting",
        echo             "Learning new commands"
        echo         ],
        echo         "buttons": [
        echo             {"label": "Dashboard", "url": "https://example.com"},
        echo             {"label": "GitHub", "url": "https://github.com"}
        echo         ]
        echo     }
        echo }
    ) > config.json
    echo [OK] Default config.json created
)

REM Check for images
if not exist "images" (
    echo.
    echo [INFO] Creating default icons...
    python create_images.py
    if errorlevel 1 (
        echo [WARNING] Could not create default icons
    ) else (
        echo [OK] Default icons created in images/ folder
    )
)

REM Discord Setup Instructions
echo.
echo ================================================================
echo    Discord Application Setup
echo ================================================================
echo.
echo If you haven't already:
echo.
echo 1. Go to: https://discord.com/developers/applications
echo 2. Click "New Application" and name it
echo 3. Copy the "Application ID" from General Information
echo 4. Go to "Rich Presence" ^> "Art Assets"
echo 5. Upload images from the 'images' folder
echo 6. Edit config.json and add your Application ID
echo.
echo ================================================================

REM Check if Discord Client ID is configured
findstr /C:"\"discord_client_id\": \"\"" config.json >nul
if not errorlevel 1 (
    echo.
    echo [WARNING] Discord Client ID not configured!
    echo Please edit config.json and add your Application ID
    echo.
    set /p CONTINUE="Press Enter to continue anyway, or Ctrl+C to exit..."
)

REM Run the Voice Assistant
echo.
echo [INFO] Starting Voice Assistant...
echo.
python voice_assistant_rich.py

REM Deactivate virtual environment
call venv\Scripts\deactivate.bat

echo.
echo [INFO] Voice Assistant stopped
pause
