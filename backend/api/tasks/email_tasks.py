from celery import shared_task
from django.core.mail import send_mail
from django.template.loader import render_to_string
from django.conf import settings
import logging

logger = logging.getLogger(__name__)

def send_email_direct(subject, template, context, recipient_list):
    """
    Send email directly (fallback when Celery fails)
    """
    try:
        html_message = render_to_string(template, context)
        result = send_mail(
            subject=subject,
            message='',
            from_email=settings.DEFAULT_FROM_EMAIL,
            recipient_list=recipient_list,
            html_message=html_message,
            fail_silently=False,
        )
        return result > 0
    except Exception as e:
        logger.error(f'Direct email failed: {str(e)}')
        return False

@shared_task
def send_reservation_status_email(user_email, user_name, reservation_id, status, reservation_date, reservation_time):
    """
    Send email notification when reservation status changes to confirmed or cancelled
    """
    try:
        logger.info(f'Starting email task for reservation {reservation_id} with status {status} to {user_email}')
        
        if status == 'confirmed':
            subject = 'Your Reservation is Confirmed!'
            template = 'reservation_confirmed.html'
        elif status == 'cancelled':
            subject = 'Your Reservation has been Cancelled'
            template = 'reservation_cancelled.html'
        else:
            logger.warning(f'Email not sent for reservation {reservation_id} - status {status} not supported')
            return f'Status {status} not supported for email notifications'
        
        # Check email configuration
        if not settings.EMAIL_HOST_USER:
            logger.error('EMAIL_HOST_USER not configured')
            raise Exception('Email configuration missing: EMAIL_HOST_USER')
        
        if not settings.EMAIL_HOST_PASSWORD:
            logger.error('EMAIL_HOST_PASSWORD not configured')
            raise Exception('Email configuration missing: EMAIL_HOST_PASSWORD')
        
        # Render HTML email template
        html_message = render_to_string(template, {
            'user_name': user_name,
            'reservation_id': reservation_id,
            'reservation_date': reservation_date,
            'reservation_time': reservation_time,
            'status': status
        })
        
        logger.info(f'Template rendered successfully for {template}')
        
        # Send email
        result = send_mail(
            subject=subject,
            message='',  
            from_email=settings.DEFAULT_FROM_EMAIL,
            recipient_list=[user_email],
            html_message=html_message,
            fail_silently=False,
        )
        
        if result:
            logger.info(f'Email sent successfully to {user_email} for reservation {reservation_id}')
            return f'Email sent to {user_email}'
        else:
            logger.error(f'Email sending failed to {user_email} for reservation {reservation_id}')
            raise Exception('Email sending returned False')
        
    except Exception as e:
        logger.error(f'Failed to send email to {user_email} for reservation {reservation_id}: {str(e)}')
        raise e

@shared_task
def send_new_reservation_admin_notification(customer_name, customer_email, reservation_id, reservation_date, reservation_time):
    """
    Send email notification to admin when a new reservation is created
    """
    try:
        logger.info(f'Starting admin notification for reservation {reservation_id}')
        
        # Check admin email configuration
        if not settings.ADMIN_EMAIL:
            logger.error('ADMIN_EMAIL not configured')
            raise Exception('Email configuration missing: ADMIN_EMAIL')
        
        subject = f'🔔 New Reservation #{reservation_id} - Action Required'
        template = 'new_reservation_admin.html'
        
        # Render HTML email template
        html_message = render_to_string(template, {
            'customer_name': customer_name,
            'customer_email': customer_email,
            'reservation_id': reservation_id,
            'reservation_date': reservation_date,
            'reservation_time': reservation_time,
        })
        
        logger.info(f'Admin template rendered successfully')
        
        # Send email to admin
        result = send_mail(
            subject=subject,
            message='',  
            from_email=settings.DEFAULT_FROM_EMAIL,
            recipient_list=[settings.ADMIN_EMAIL],
            html_message=html_message,
            fail_silently=False,
        )
        
        if result:
            logger.info(f'Admin notification sent successfully for reservation {reservation_id}')
            return f'Admin notification sent for reservation {reservation_id}'
        else:
            logger.error(f'Admin notification failed for reservation {reservation_id}')
            raise Exception('Admin email sending returned False')
        
    except Exception as e:
        logger.error(f'Failed to send admin notification for reservation {reservation_id}: {str(e)}')
        raise e

# Direct email functions (fallback when Celery fails)
def send_reservation_status_email_direct(user_email, user_name, reservation_id, status, reservation_date, reservation_time):
    """Direct email sending for reservation status changes"""
    if status == 'confirmed':
        subject = 'Your Reservation is Confirmed!'
        template = 'reservation_confirmed.html'
    elif status == 'cancelled':
        subject = 'Your Reservation has been Cancelled'
        template = 'reservation_cancelled.html'
    else:
        return False
    
    context = {
        'user_name': user_name,
        'reservation_id': reservation_id,
        'reservation_date': reservation_date,
        'reservation_time': reservation_time,
        'status': status
    }
    
    return send_email_direct(subject, template, context, [user_email])

def send_new_reservation_admin_notification_direct(customer_name, customer_email, reservation_id, reservation_date, reservation_time):
    """Direct email sending for admin notifications"""
    subject = f'🔔 New Reservation #{reservation_id} - Action Required'
    template = 'new_reservation_admin.html'
    
    context = {
        'customer_name': customer_name,
        'customer_email': customer_email,
        'reservation_id': reservation_id,
        'reservation_date': reservation_date,
        'reservation_time': reservation_time,
    }
    
    return send_email_direct(subject, template, context, [settings.ADMIN_EMAIL])

@shared_task
def test_email_configuration():
    """
    Test task to verify email configuration
    """
    try:
        logger.info('Testing email configuration...')
        
        # Check all required settings
        required_settings = {
            'EMAIL_HOST_USER': settings.EMAIL_HOST_USER,
            'EMAIL_HOST_PASSWORD': settings.EMAIL_HOST_PASSWORD,
            'DEFAULT_FROM_EMAIL': settings.DEFAULT_FROM_EMAIL,
            'ADMIN_EMAIL': settings.ADMIN_EMAIL,
        }
        
        for setting_name, setting_value in required_settings.items():
            if not setting_value:
                logger.error(f'{setting_name} is not configured')
                return f'Configuration error: {setting_name} is missing'
        
        # Send test email
        result = send_mail(
            subject='Test Email - Fade District System',
            message='This is a test email to verify the email system is working.',
            from_email=settings.DEFAULT_FROM_EMAIL,
            recipient_list=[settings.ADMIN_EMAIL],
            fail_silently=False,
        )
        
        if result:
            logger.info('Test email sent successfully')
            return 'Test email sent successfully'
        else:
            logger.error('Test email failed')
            return 'Test email failed'
            
    except Exception as e:
        logger.error(f'Email configuration test failed: {str(e)}')
        return f'Email test failed: {str(e)}'