from django.core.management.base import BaseCommand
from django.utils import timezone
from datetime import datetime, timedelta
from api.models import Reservation, User
import logging

logger = logging.getLogger(__name__)

class Command(BaseCommand):
    help = 'Test reservation creation and email notifications'

    def add_arguments(self, parser):
        parser.add_argument(
            '--email',
            type=str,
            help='Email address for test customer',
            default='test@example.com'
        )
        parser.add_argument(
            '--time',
            type=str,
            help='Reservation time (HH:MM format, 24-hour)',
            default='14:20'  # 2:20 PM
        )

    def handle(self, *args, **options):
        self.stdout.write('🧪 Testing Reservation System...\n')
        
        # Get or create test user
        email = options['email']
        user, created = User.objects.get_or_create(
            email=email,
            defaults={
                'username': email.split('@')[0],
                'first_name': 'Test',
                'last_name': 'User'
            }
        )
        
        if created:
            self.stdout.write(f'✅ Created test user: {user.email}')
        else:
            self.stdout.write(f'📋 Using existing user: {user.email}')
        
        # Parse time
        time_str = options['time']
        try:
            hour, minute = map(int, time_str.split(':'))
            
            # Create reservation for today at specified time
            start_time = timezone.now().replace(
                hour=hour, 
                minute=minute, 
                second=0, 
                microsecond=0
            )
            end_time = start_time + timedelta(hours=1)
            
            # Create reservation
            reservation = Reservation.objects.create(
                customer=user,
                start_time=start_time,
                end_time=end_time
            )
            
            self.stdout.write(f'✅ Created reservation #{reservation.id}')
            self.stdout.write(f'📅 Date: {start_time.strftime("%B %d, %Y")}')
            self.stdout.write(f'⏰ Time: {start_time.strftime("%I:%M %p")}')
            self.stdout.write(f'📊 Status: {reservation.status}')
            
            # Check if status is correct
            if reservation.status == 'pending':
                self.stdout.write(self.style.SUCCESS('✅ Status is correctly set to PENDING'))
            else:
                self.stdout.write(self.style.ERROR(f'❌ Status is incorrectly set to {reservation.status.upper()}'))
            
            # Check time formatting
            formatted_time = start_time.strftime('%I:%M %p')
            expected_time = f'{hour % 12 or 12}:{minute:02d} {"PM" if hour >= 12 else "AM"}'
            
            if formatted_time == expected_time:
                self.stdout.write(self.style.SUCCESS(f'✅ Time formatting is correct: {formatted_time}'))
            else:
                self.stdout.write(self.style.ERROR(f'❌ Time formatting issue: got {formatted_time}, expected {expected_time}'))
            
            self.stdout.write('\n📧 Email notification should be sent to admin...')
            
        except ValueError:
            self.stdout.write(self.style.ERROR('❌ Invalid time format. Use HH:MM (24-hour format)'))
        except Exception as e:
            self.stdout.write(self.style.ERROR(f'❌ Error creating reservation: {str(e)}'))