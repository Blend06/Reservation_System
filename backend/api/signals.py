from django.db.models.signals import post_save, pre_save
from django.dispatch import receiver
from api.models import Reservation
from api.tasks import send_reservation_status_email, send_new_reservation_admin_notification
from api.tasks.email_tasks import (
    send_reservation_status_email_direct, 
    send_new_reservation_admin_notification_direct
)
import logging

logger = logging.getLogger(__name__)

# Store the old status before saving
_reservation_old_status = {}

@receiver(pre_save, sender=Reservation)
def store_old_status(sender, instance, **kwargs):
    """Store the old status before saving to detect changes"""
    if instance.pk:  # Only for existing reservations
        try:
            old_instance = Reservation.objects.get(pk=instance.pk)
            _reservation_old_status[instance.pk] = old_instance.status
        except Reservation.DoesNotExist:
            _reservation_old_status[instance.pk] = None
    else:
        _reservation_old_status[instance.pk] = None

@receiver(post_save, sender=Reservation)
def handle_reservation_changes(sender, instance, created, **kwargs):
    """
    Send email notifications:
    - To admin when new reservation is created
    - To customer when status changes to confirmed/cancelled
    """
    try:
        # Get user information
        user = instance.customer
        user_email = user.email
        user_name = f"{user.first_name} {user.last_name}".strip() or user.username
        
        # Format date and time (convert to local timezone for display)
        from django.utils import timezone
        import pytz
        
        # Convert UTC time to Central European Time for display
        # You can change this to your preferred timezone
        local_tz = pytz.timezone('Europe/Berlin')  # CET/CEST
        local_time = instance.start_time.astimezone(local_tz)
            
        reservation_date = local_time.strftime('%B %d, %Y')
        reservation_time = local_time.strftime('%I:%M %p')
        
        if created:  # New reservation created
            logger.info(f'New reservation {instance.id} created, sending admin notification')
            
            # Try Celery first, fallback to direct email
            try:
                send_new_reservation_admin_notification.delay(
                    customer_name=user_name,
                    customer_email=user_email,
                    reservation_id=instance.id,
                    reservation_date=reservation_date,
                    reservation_time=reservation_time
                )
                logger.info(f'Admin notification queued via Celery for reservation {instance.id}')
            except Exception as celery_error:
                logger.warning(f'Celery failed for admin notification, using direct email: {celery_error}')
                # Fallback to direct email
                success = send_new_reservation_admin_notification_direct(
                    customer_name=user_name,
                    customer_email=user_email,
                    reservation_id=instance.id,
                    reservation_date=reservation_date,
                    reservation_time=reservation_time
                )
                if success:
                    logger.info(f'Admin notification sent directly for reservation {instance.id}')
                else:
                    logger.error(f'Direct admin notification failed for reservation {instance.id}')
            
        else:  # Existing reservation updated
            # Get the old status
            old_status = _reservation_old_status.get(instance.pk)
            current_status = instance.status
            
            # Check if status actually changed
            if old_status != current_status:
                logger.info(f'Reservation {instance.id} status changed from {old_status} to {current_status}')
                
                # Send email for confirmed or cancelled status
                if current_status in ['confirmed', 'cancelled']:
                    logger.info(f'Sending customer email for reservation {instance.id} with status {current_status}')
                    
                    # Try Celery first, fallback to direct email
                    try:
                        send_reservation_status_email.delay(
                            user_email=user_email,
                            user_name=user_name,
                            reservation_id=instance.id,
                            status=current_status,
                            reservation_date=reservation_date,
                            reservation_time=reservation_time
                        )
                        logger.info(f'Customer email queued via Celery for reservation {instance.id}')
                    except Exception as celery_error:
                        logger.warning(f'Celery failed for customer email, using direct email: {celery_error}')
                        # Fallback to direct email
                        success = send_reservation_status_email_direct(
                            user_email=user_email,
                            user_name=user_name,
                            reservation_id=instance.id,
                            status=current_status,
                            reservation_date=reservation_date,
                            reservation_time=reservation_time
                        )
                        if success:
                            logger.info(f'Customer email sent directly for reservation {instance.id}')
                        else:
                            logger.error(f'Direct customer email failed for reservation {instance.id}')
            
            # Clean up the stored status
            if instance.pk in _reservation_old_status:
                del _reservation_old_status[instance.pk]
                
    except Exception as e:
        logger.error(f'Failed to process reservation {instance.id}: {str(e)}')
        # Clean up on error
        if instance.pk in _reservation_old_status:
            del _reservation_old_status[instance.pk]