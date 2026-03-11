#!/bin/bash

# Run database migrations
python manage.py migrate --noinput

# Debug: Print environment variables (without showing actual values)
echo "Checking environment variables..."
echo "SUPERUSER_EMAIL is set: ${SUPERUSER_EMAIL:+YES}"
echo "SUPERUSER_PASSWORD is set: ${SUPERUSER_PASSWORD:+YES}"
echo "SUPERUSER_FIRSTNAME is set: ${SUPERUSER_FIRSTNAME:+YES}"
echo "SUPERUSER_LASTNAME is set: ${SUPERUSER_LASTNAME:+YES}"

# Create superuser if it doesn't exist (using environment variables)
if [ -n "${SUPERUSER_EMAIL}" ] && [ -n "${SUPERUSER_PASSWORD}" ]; then
  python manage.py create_superadmin \
    --email "${SUPERUSER_EMAIL}" \
    --password "${SUPERUSER_PASSWORD}" \
    --first-name "${SUPERUSER_FIRSTNAME}" \
    --last-name "${SUPERUSER_LASTNAME}" || echo "Superuser already exists or creation failed"
else
  echo "ERROR: SUPERUSER_EMAIL or SUPERUSER_PASSWORD not set. Skipping superuser creation."
fi

# Collect static files
python manage.py collectstatic --noinput

# Start gunicorn
gunicorn backend.wsgi:application
