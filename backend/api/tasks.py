from celery import shared_task
from django.core.mail import send_mail
from django.template.loader import render_to_string
from django.conf import settings
from django.utils import timezone
from datetime import timedelta
import logging

logger = logging.getLogger(__name__)

@shared_task
def send_reservation_status_email(user_email, user_name, reservation_id, status, reservation_date, reservation_time):
    """
    Send email notification when reservation status changes to confirmed or cancelled
    """
    try:
        if status == 'confirmed':
            subject = 'Your Reservation is Confirmed!'
            template = 'reservation_confirmed.html'
        elif status == 'cancelled':
            subject = 'Your Reservation has been Cancelled'
            template = 'reservation_cancelled.html'
        else:
            # Only send emails for confirmed or cancelled status
            return
        
        # Render HTML email template
        html_message = render_to_string(template, {
            'user_name': user_name,
            'reservation_id': reservation_id,
            'reservation_date': reservation_date,
            'reservation_time': reservation_time,
            'status': status
        })
        
        # Send email
        send_mail(
            subject=subject,
            message='',  
            from_email=settings.DEFAULT_FROM_EMAIL,
            recipient_list=[user_email],
            html_message=html_message,
            fail_silently=False,
        )
        
        logger.info(f'Email sent successfully to {user_email} for reservation {reservation_id}')
        return f'Email sent to {user_email}'
        
    except Exception as e:
        logger.error(f'Failed to send email to {user_email}: {str(e)}')
        raise e

@shared_task
def send_new_reservation_admin_notification(customer_name, customer_email, reservation_id, reservation_date, reservation_time):
    """
    Send email notification to admin when a new reservation is created
    """
    try:
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
        
        # Send email to admin
        send_mail(
            subject=subject,
            message='',  
            from_email=settings.DEFAULT_FROM_EMAIL,
            recipient_list=[settings.ADMIN_EMAIL],
            html_message=html_message,
            fail_silently=False,
        )
        
        logger.info(f'Admin notification sent for new reservation {reservation_id}')
        return f'Admin notification sent for reservation {reservation_id}'
        
    except Exception as e:
        logger.error(f'Failed to send admin notification for reservation {reservation_id}: {str(e)}')
        raise e

@shared_task
def schedule_reservation_completion(reservation_id):
    """
    Schedule a task to automatically complete a reservation 35 minutes after start time
    """
    from api.models import Reservation
    
    try:
        reservation = Reservation.objects.get(id=reservation_id)
        
        # Calculate completion time (start_time + 35 minutes)
        completion_time = reservation.start_time + timedelta(minutes=35)
        
        # Schedule the completion task
        auto_complete_reservation.apply_async(
            args=[reservation_id],
            eta=completion_time
        )
        
        logger.info(f'Scheduled auto-completion for reservation {reservation_id} at {completion_time}')
        return f'Scheduled completion for reservation {reservation_id}'
        
    except Reservation.DoesNotExist:
        logger.error(f'Reservation {reservation_id} not found')
        return f'Reservation {reservation_id} not found'
    except Exception as e:
        logger.error(f'Failed to schedule completion for reservation {reservation_id}: {str(e)}')
        raise e

@shared_task
def auto_complete_reservation(reservation_id):
    """
    Automatically mark reservation as completed
    """
    from api.models import Reservation
    
    try:
        reservation = Reservation.objects.get(id=reservation_id)
        
        # Only complete if still confirmed (not cancelled)
        if reservation.status == 'confirmed':
            reservation.status = 'completed'
            reservation.save()
            
            logger.info(f'Auto-completed reservation {reservation_id}')
            return f'Reservation {reservation_id} auto-completed'
        else:
            logger.info(f'Reservation {reservation_id} not completed - status is {reservation.status}')
            return f'Reservation {reservation_id} not completed - status is {reservation.status}'
            
    except Reservation.DoesNotExist:
        logger.error(f'Reservation {reservation_id} not found for completion')
        return f'Reservation {reservation_id} not found'
    except Exception as e:
        logger.error(f'Failed to auto-complete reservation {reservation_id}: {str(e)}')
        raise e