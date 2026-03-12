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
echo "Starting gunicorn..."
exec gunicorn backend.wsgi:application
