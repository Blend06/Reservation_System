#!/bin/bash

# Run database migrations
python manage.py migrate --noinput

# Create superuser using Python to read environment variables
python -c "
import os
import django
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'backend.settings')
django.setup()

from api.models import User

email = os.environ.get('SUPERUSER_EMAIL', '')
password = os.environ.get('SUPERUSER_PASSWORD', '')
first_name = os.environ.get('SUPERUSER_FIRSTNAME', '')
last_name = os.environ.get('SUPERUSER_LASTNAME', '')

print(f'Email: {email}')
print(f'First name: {first_name}')
print(f'Last name: {last_name}')

if email and password:
    if not User.objects.filter(email=email).exists():
        User.objects.create_superuser(
            email=email,
            password=password,
            first_name=first_name,
            last_name=last_name,
            user_type='super_admin'
        )
        print(f'Superuser created: {email}')
    else:
        print(f'Superuser already exists: {email}')
else:
    print('ERROR: SUPERUSER_EMAIL or SUPERUSER_PASSWORD not set')
"

# Collect static files
python manage.py collectstatic --noinput

# Start gunicorn
gunicorn backend.wsgi:application
