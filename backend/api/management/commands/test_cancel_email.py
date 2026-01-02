from django.core.management.base import BaseCommand
from api.tasks.email_tasks import send_reservation_status_email_direct
from django.conf import settings
import logging

logger = logging.getLogger(__name__)

class Command(BaseCommand):
    help = 'Test cancellation email functionality'

    def add_arguments(self, parser):
        parser.add_argument(
            '--email',
            type=str,
            help='Email address to send test cancellation email to',
            default=settings.ADMIN_EMAIL
        )

    def handle(self, *args, **options):
        self.stdout.write('🧪 Testing Cancellation Email...\n')
        
        email = options['email']
        
        # Test data
        test_data = {
            'user_email': email,
            'user_name': 'Test User',
            'reservation_id': 999,
            'status': 'canceled',
            'reservation_date': 'January 02, 2026',
            'reservation_time': '02:30 PM'
        }
        
        self.stdout.write(f'📧 Sending test cancellation email to: {email}')
        self.stdout.write(f'📋 Test data: {test_data}')
        
        try:
            # Test the direct email function
            success = send_reservation_status_email_direct(
                user_email=test_data['user_email'],
                user_name=test_data['user_name'],
                reservation_id=test_data['reservation_id'],
                status=test_data['status'],
                reservation_date=test_data['reservation_date'],
                reservation_time=test_data['reservation_time']
            )
            
            if success:
                self.stdout.write(self.style.SUCCESS('✅ Cancellation email sent successfully!'))
                self.stdout.write('📬 Check your email inbox for the cancellation notification.')
            else:
                self.stdout.write(self.style.ERROR('❌ Failed to send cancellation email'))
                
        except Exception as e:
            self.stdout.write(self.style.ERROR(f'❌ Error sending cancellation email: {str(e)}'))
            
        self.stdout.write('\n🔍 If the email was sent successfully, the cancellation email system is working.')
        self.stdout.write('💡 If not, check the Django logs for more details.')