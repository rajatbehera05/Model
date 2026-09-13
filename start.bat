@echo off
echo ============================================================
echo Starting IoT Smart Parking System (Backend + Frontend)
echo ============================================================

echo Starting Backend Server on http://localhost:5000...
start "Smart Parking - Backend" cmd /k "cd backend && npm start"

echo Starting Frontend Dev Server on http://localhost:3000...
cd frontend && npm run dev
