from django.db.models.signals import post_save
from django.dispatch import receiver
from api.models import Reservation
from api.tasks import send_reservation_status_email, schedule_reservation_completion, send_new_reservation_admin_notification
import logging

logger = logging.getLogger(__name__)

@receiver(post_save, sender=Reservation)
def reservation_status_changed(sender, instance, created, **kwargs):
    """
    Send email notifications:
    - To admin when new reservation is created
    - To customer when status changes to confirmed/cancelled
    - Schedule auto-completion when confirmed
    """
    try:
        # Get user information
        user = instance.customer
        user_email = user.email
        user_name = f"{user.first_name} {user.last_name}".strip() or user.username
        
        # Format date and time
        reservation_date = instance.start_time.strftime('%B %d, %Y')
        reservation_time = instance.start_time.strftime('%I:%M %p')
        
        if created:  # New reservation created
            # Send notification to admin
            send_new_reservation_admin_notification.delay(
                customer_name=user_name,
                customer_email=user_email,
                reservation_id=instance.id,
                reservation_date=reservation_date,
                reservation_time=reservation_time
            )
            logger.info(f'Admin notification queued for new reservation {instance.id}')
            
        else:  # Existing reservation updated
            # Check if status changed to confirmed or cancelled
            if instance.status in ['confirmed', 'cancelled']:
                # Send email to customer
                send_reservation_status_email.delay(
                    user_email=user_email,
                    user_name=user_name,
                    reservation_id=instance.id,
                    status=instance.status,
                    reservation_date=reservation_date,
                    reservation_time=reservation_time
                )
                
                # Schedule auto-completion if confirmed
                if instance.status == 'confirmed':
                    schedule_reservation_completion.delay(instance.id)
                    logger.info(f'Scheduled auto-completion for reservation {instance.id}')
                
                logger.info(f'Customer email task queued for reservation {instance.id} with status {instance.status}')
                
    except Exception as e:
        logger.error(f'Failed to process reservation {instance.id}: {str(e)}')