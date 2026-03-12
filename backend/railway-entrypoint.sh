#!/bin/bash
set -e

echo "=== Starting deployment ==="

# Run database migrations
echo "Running migrations..."
python manage.py migrate --noinput

# Create superuser if environment variables are set
if [ -n "$SUPERUSER_EMAIL" ] && [ -n "$SUPERUSER_PASSWORD" ]; then
    echo "Creating superuser..."
    python manage.py shell << EOF
from api.models import User
if not User.objects.filter(email='$SUPERUSER_EMAIL').exists():
    User.objects.create_superuser(
        email='$SUPERUSER_EMAIL',
        password='$SUPERUSER_PASSWORD',
        first_name='$SUPERUSER_FIRSTNAME',
        last_name='$SUPERUSER_LASTNAME',
        user_type='super_admin'
    )
    print('Superuser created successfully!')
else:
    print('Superuser already exists.')
EOF
fi

# Collect static files
echo "Collecting static files..."
python manage.py collectstatic --noinput

# Start gunicorn
echo "Starting gunicorn..."
exec gunicorn backend.wsgi:application
