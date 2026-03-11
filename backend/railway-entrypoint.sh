#!/bin/bash
set -e

echo "=== Starting deployment ==="

# Run database migrations
echo "Running migrations..."
python manage.py migrate --noinput

# Create superuser
echo "Creating superuser..."
python manage.py shell << EOF
from api.models import User
import os

email = os.getenv('SUPERUSER_EMAIL')
password = os.getenv('SUPERUSER_PASSWORD')
first_name = os.getenv('SUPERUSER_FIRSTNAME')
last_name = os.getenv('SUPERUSER_LASTNAME')

print(f"Email from env: '{email}'")
print(f"Password set: {bool(password)}")
print(f"First name: '{first_name}'")
print(f"Last name: '{last_name}'")

if email and password:
    if not User.objects.filter(email=email).exists():
        User.objects.create_superuser(
            email=email,
            password=password,
            first_name=first_name or 'Admin',
            last_name=last_name or 'User',
            user_type='super_admin'
        )
        print(f'✅ Superuser created: {email}')
    else:
        print(f'ℹ️  Superuser already exists: {email}')
else:
    print('❌ ERROR: SUPERUSER_EMAIL or SUPERUSER_PASSWORD not set')
    print(f'   SUPERUSER_EMAIL={email}')
    print(f'   SUPERUSER_PASSWORD={"SET" if password else "NOT SET"}')
EOF

# Collect static files
echo "Collecting static files..."
python manage.py collectstatic --noinput

# Start gunicorn
echo "Starting gunicorn..."
exec gunicorn backend.wsgi:application
