#!/bin/bash

# Run database migrations
python manage.py migrate --noinput

# Create superuser if it doesn't exist
python manage.py create_superadmin

# Collect static files
python manage.py collectstatic --noinput

# Start gunicorn
gunicorn backend.wsgi:application
