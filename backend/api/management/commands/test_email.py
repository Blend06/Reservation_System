from django.core.management.base import BaseCommand
from django.core.mail import send_mail
from django.conf import settings
from api.tasks.email_tasks import test_email_configuration
import logging

logger = logging.getLogger(__name__)

class Command(BaseCommand):
    help = 'Test email configuration and send test emails'

    def add_arguments(self, parser):
        parser.add_argument(
            '--celery',
            action='store_true',
            help='Test email via Celery task',
        )
        parser.add_argument(
            '--direct',
            action='store_true',
            help='Test email directly (bypass Celery)',
        )
        parser.add_argument(
            '--to',
            type=str,
            help='Email address to send test email to',
        )

    def handle(self, *args, **options):
        self.stdout.write('🧪 Testing Email Configuration...\n')
        
        # Check configuration
        self.check_email_config()
        
        if options['celery']:
            self.test_celery_email()
        elif options['direct']:
            recipient = options.get('to') or settings.ADMIN_EMAIL
            self.test_direct_email(recipient)
        else:
            # Run both tests
            self.test_direct_email(settings.ADMIN_EMAIL)
            self.test_celery_email()

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

    def test_direct_email(self, recipient):
        """Test email sending directly (bypass Celery)"""
        self.stdout.write(f'📤 Testing Direct Email to {recipient}...')
        
        try:
            result = send_mail(
                subject='🧪 Test Email - Direct Send',
                message='This is a test email sent directly from Django (bypassing Celery).',
                from_email=settings.DEFAULT_FROM_EMAIL,
                recipient_list=[recipient],
                fail_silently=False,
            )
            
            if result:
                self.stdout.write(self.style.SUCCESS(f'✅ Direct email sent successfully to {recipient}'))
            else:
                self.stdout.write(self.style.ERROR(f'❌ Direct email failed to {recipient}'))
                
        except Exception as e:
            self.stdout.write(self.style.ERROR(f'❌ Direct email error: {str(e)}'))

    def test_celery_email(self):
        """Test email via Celery task"""
        self.stdout.write('🔄 Testing Email via Celery Task...')
        
        try:
            # Queue the task
            task = test_email_configuration.delay()
            self.stdout.write(f'📋 Task queued with ID: {task.id}')
            
            # Wait for result (with timeout)
            try:
                result = task.get(timeout=30)
                self.stdout.write(self.style.SUCCESS(f'✅ Celery email task result: {result}'))
            except Exception as e:
                self.stdout.write(self.style.ERROR(f'❌ Celery task failed or timed out: {str(e)}'))
                
        except Exception as e:
            self.stdout.write(self.style.ERROR(f'❌ Celery email task error: {str(e)}'))

    def test_reservation_emails(self):
        """Test reservation-specific email templates"""
        self.stdout.write('📧 Testing Reservation Email Templates...')
        
        # This would test the actual email templates
        # You can expand this to test specific scenarios