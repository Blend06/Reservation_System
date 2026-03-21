"""
Email utilities for sending synchronous emails
No Celery required - emails send immediately
"""
from django.core.mail import send_mail
from django.template.loader import render_to_string
from django.conf import settings
import logging

logger = logging.getLogger(__name__)


def send_new_reservation_email(reservation):
    """
    Send email to business owner when new reservation is created
    
    Args:
        reservation: Reservation object
        
    Returns:
        bool: True if email sent successfully, False otherwise
    """
    try:
        business = reservation.business
        recipient_email = business.email
        
        subject = f'🔔 New Reservation #{reservation.id} - {business.name}'
        
        # Render HTML email template
        html_message = render_to_string('new_reservation_admin.html', {
            'customer_name': reservation.customer_name,
            'customer_email': getattr(reservation, 'customer_email', ''),
            'customer_phone': reservation.customer_phone,
            'reservation_id': reservation.id,
            'reservation_date': reservation.start_time.date() if reservation.start_time else '',
            'reservation_time': reservation.start_time.strftime('%H:%M') if reservation.start_time else '',
            'business_name': business.name,
        })
        
        # Send email
        result = send_mail(
            subject=subject,
            message='',  # Plain text version (empty, we use HTML)
            from_email=settings.DEFAULT_FROM_EMAIL,
            recipient_list=[recipient_email],
            html_message=html_message,
            fail_silently=False,
        )
        
        if result:
            logger.info(f'✅ Email sent to {recipient_email} for reservation {reservation.id}')
            return True
        else:
            logger.error(f'❌ Email failed for reservation {reservation.id}')
            return False
        
    except Exception as e:
        logger.error(f'❌ Failed to send email for reservation {reservation.id}: {str(e)}')
        return False


def test_email_configuration():
    """
    Test email configuration by sending a test email
    
    Returns:
        dict: Result with success status and message
    """
    try:
        # Check required settings
        if not settings.EMAIL_HOST_USER:
            return {
                'success': False,
                'message': 'EMAIL_HOST_USER not configured in settings'
            }
        
        if not settings.EMAIL_HOST_PASSWORD:
            return {
                'success': False,
                'message': 'EMAIL_HOST_PASSWORD not configured in settings'
            }
        
        # Send test email
        result = send_mail(
            subject='✅ Test Email - Reservation System',
            message='This is a test email to verify the email system is working correctly.',
            from_email=settings.DEFAULT_FROM_EMAIL,
            recipient_list=[settings.ADMIN_EMAIL or settings.EMAIL_HOST_USER],
            fail_silently=False,
        )
        
        if result:
            logger.info('✅ Test email sent successfully')
            return {
                'success': True,
                'message': 'Test email sent successfully'
            }
        else:
            logger.error('❌ Test email failed')
            return {
                'success': False,
                'message': 'Test email failed to send'
            }
            
    except Exception as e:
        logger.error(f'❌ Email configuration test failed: {str(e)}')
        return {
            'success': False,
            'message': f'Email test failed: {str(e)}'
        }
