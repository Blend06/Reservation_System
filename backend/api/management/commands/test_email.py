from django.core.management.base import BaseCommand
from django.core.mail import send_mail
from django.conf import settings
from api.utils.email_utils import test_email_configuration
import logging

logger = logging.getLogger(__name__)

class Command(BaseCommand):
    help = 'Test email configuration and send test emails (synchronous)'

    def add_arguments(self, parser):
        parser.add_argument(
            '--to',
            type=str,
            help='Email address to send test email to',
        )

    def handle(self, *args, **options):
        self.stdout.write('🧪 Testing Email Configuration...\n')
        
        # Check configuration
        self.check_email_config()
        
        # Test email sending
        recipient = options.get('to') or settings.ADMIN_EMAIL
        self.test_email(recipient)

    def check_email_config(self):
        """Check email configuration settings"""
        self.stdout.write('📧 Checking Email Configuration:')
        
        config_items = [
            ('EMAIL_HOST_USER', settings.EMAIL_HOST_USER),
            ('EMAIL_HOST_PASSWORD', '***' if settings.EMAIL_HOST_PASSWORD else None),
            ('DEFAULT_FROM_EMAIL', settings.DEFAULT_FROM_EMAIL),
            ('ADMIN_EMAIL', settings.ADMIN_EMAIL),
            ('EMAIL_HOST', settings.EMAIL_HOST),
            ('EMAIL_PORT', settings.EMAIL_PORT),
            ('EMAIL_USE_TLS', settings.EMAIL_USE_TLS),
        ]
        
        all_good = True
        for name, value in config_items:
            if value:
                self.stdout.write(f'  ✅ {name}: {value}')
            else:
                self.stdout.write(f'  ❌ {name}: NOT SET')
                all_good = False
        
        if all_good:
            self.stdout.write(self.style.SUCCESS('✅ Email configuration looks good!\n'))
        else:
            self.stdout.write(self.style.ERROR('❌ Email configuration has issues!\n'))
        
        return all_good

    def test_email(self, recipient):
        """Test email sending (synchronous)"""
        self.stdout.write(f'📤 Testing Email to {recipient}...')
        
        # Use the utility function
        result = test_email_configuration()
        
        if result['success']:
            self.stdout.write(self.style.SUCCESS(f'✅ {result["message"]}'))
        else:
            self.stdout.write(self.style.ERROR(f'❌ {result["message"]}'))
