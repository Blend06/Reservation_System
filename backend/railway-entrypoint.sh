#!/bin/bash
set -e

echo "=== Starting deployment ==="

# Run database migrations
echo "Running migrations..."
python manage.py migrate --noinput

# Create superuser from environment variables
echo "Attempting to create superuser..."
python manage.py create_superadmin || echo "Superuser creation skipped or failed"

# Collect static files
echo "Collecting static files..."
python manage.py collectstatic --noinput

# Start gunicorn
echo "Starting gunicorn on port ${PORT:-8000}..."
exec gunicorn backend.wsgi:application --bind 0.0.0.0:${PORT:-8000}
