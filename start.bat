@echo off
echo ============================================
echo  FarmProfit - Starting Full Stack Platform
echo ============================================

echo.
echo [1/2] Starting FastAPI Backend on port 8080...
start "FarmProfit Backend" /D "%~dp0backend" cmd /c "python -m uvicorn main:app --host 127.0.0.1 --port 8080 --reload"

echo Waiting for backend to initialize...
timeout /t 3 /nobreak >nul

echo.
echo [2/2] Starting React Frontend on port 3000...
start "FarmProfit Frontend" /D "%~dp0frontend" cmd /c "npm run dev"

echo.
echo ============================================
echo  Both servers are starting!
echo  Backend:  http://127.0.0.1:8080
echo  Frontend: http://127.0.0.1:3000
echo ============================================
echo.
echo Press any key to exit this launcher...
pause >nul
