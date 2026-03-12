from django.core.management.base import BaseCommand
from api.models import User
import os

class Command(BaseCommand):
    help = 'Create a super admin user from environment variables'

    def handle(self, *args, **options):
        email = os.environ.get('SUPERUSER_EMAIL')
        password = os.environ.get('SUPERUSER_PASSWORD')
        first_name = os.environ.get('SUPERUSER_FIRSTNAME', 'Admin')
        last_name = os.environ.get('SUPERUSER_LASTNAME', 'User')
        
        self.stdout.write(f'Email from env: {email}')
        self.stdout.write(f'First name from env: {first_name}')
        self.stdout.write(f'Last name from env: {last_name}')
        
        if not email or not password:
            self.stdout.write(
                self.style.ERROR('SUPERUSER_EMAIL and SUPERUSER_PASSWORD environment variables must be set')
            )
            return
        
        if User.objects.filter(email=email).exists():
            self.stdout.write(
                self.style.WARNING(f'User with email {email} already exists')
            )
            return
        
        try:
            user = User.objects.create_superuser(
                email=email,
                password=password,
                first_name=first_name,
                last_name=last_name,
                user_type='super_admin'
            )
            
            self.stdout.write(
                self.style.SUCCESS(f'Super admin created successfully: {user.email}')
            )
        except Exception as e:
            self.stdout.write(
                self.style.ERROR(f'Error creating superuser: {str(e)}')
            )