@echo off
echo ========================================================
echo Starting Hostel Management System (HMS) Django Backend...
echo ========================================================
cd backend
.\venv\Scripts\python.exe manage.py runserver 0.0.0.0:8000
pause
