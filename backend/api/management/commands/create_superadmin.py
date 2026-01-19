from django.core.management.base import BaseCommand
from api.models import User

class Command(BaseCommand):
    help = 'Create a super admin user'

    def add_arguments(self, parser):
        parser.add_argument('--email', type=str, required=True, help='Email address')
        parser.add_argument('--password', type=str, required=True, help='Password')
        parser.add_argument('--first-name', type=str, required=True, help='First name')
        parser.add_argument('--last-name', type=str, required=True, help='Last name')

    def handle(self, *args, **options):
        email = options['email']
        password = options['password']
        first_name = options['first_name']
        last_name = options['last_name']
        
        if User.objects.filter(email=email).exists():
            self.stdout.write(
                self.style.ERROR(f'User with email {email} already exists')
            )
            return
        
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