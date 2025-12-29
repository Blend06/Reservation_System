@echo off
echo Stopping any existing containers...
docker-compose down

echo Starting Fade District application...
echo.
echo Services starting:
echo - Redis (port 6379)
echo - Django Backend (port 8000) 
echo - React Frontend (port 3000)
echo - Celery Worker (background)
echo - Celery Beat (scheduler)
echo.
echo Frontend will be ready first at http://localhost:3000
echo Backend will be ready at http://localhost:8000 (takes ~30 seconds)
echo.
echo Press Ctrl+C to stop all services
echo.

docker-compose up