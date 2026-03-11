#!/bin/bash

# Run database migrations
python manage.py migrate --noinput

# Create superuser if it doesn't exist (using env variables)
python manage.py create_superadmin \
  --email "${SUPERUSER_EMAIL}" \
  --password "${SUPERUSER_PASSWORD}" \
  --first-name "${SUPERUSER_FIRSTNAME}" \
  --last-name "${SUPERUSER_LASTNAME}" || echo "Superuser already exists or creation failed"

# Collect static files
python manage.py collectstatic --noinput

# Start gunicorn
gunicorn backend.wsgi:application
