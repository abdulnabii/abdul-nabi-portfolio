@echo off
echo Starting setup for Abdul Nabu Portfolio...

:: Copy .env.example to .env.local if .env.local doesn't exist
if not exist .env.local (
    echo Copying .env.example to .env.local...
    copy .env.example .env.local
) else (
    echo .env.local already exists. Skipping copy.
)

:: Run npm install
echo Installing dependencies from package.json...
call npm install

if %ERRORLEVEL% neq 0 (
    echo.
    echo ERROR: Failed to install dependencies. Make sure Node.js and npm are installed.
    pause
    exit /b %ERRORLEVEL%
)

echo.
echo Setup completed successfully!
echo To run the project in development mode:
echo   npm run dev
echo.
pause
