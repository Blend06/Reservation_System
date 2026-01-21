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
            old_instance = Reservation.all_objects.get(pk=instance.pk)
            _reservation_old_status[instance.pk] = old_instance.status
        except Reservation.DoesNotExist:
            _reservation_old_status[instance.pk] = None
    else:
        _reservation_old_status[instance.pk] = None

@receiver(post_save, sender=Reservation)
def handle_reservation_changes(sender, instance, created, **kwargs):
    """
    Send email notifications:
    - To business admin when new reservation is created
    - No customer emails (customers are contacted via phone)
    """
    try:
        # Get business and customer information
        business = instance.business
        customer_name = instance.customer_display_name
        customer_phone = instance.customer_phone
        
        if not customer_phone:
            logger.warning(f'No customer phone for reservation {instance.id}')
            return
        
        # Format date and time (convert to business timezone for display)
        from django.utils import timezone
        import pytz
        
        # Convert UTC time to business timezone for display
        business_tz = pytz.timezone(business.timezone)
        local_time = instance.start_time.astimezone(business_tz)
            
        reservation_date = local_time.strftime('%B %d, %Y')
        reservation_time = local_time.strftime('%I:%M %p')
        
        if created:  # New reservation created
            logger.info(f'New reservation {instance.id} created for business {business.name}')
            
            # Send notification to business admin only
            admin_email = business.admin_email
            
            # Try Celery first, fallback to direct email
            try:
                send_new_reservation_admin_notification.delay(
                    customer_name=customer_name,
                    customer_phone=customer_phone,
                    reservation_id=instance.id,
                    reservation_date=reservation_date,
                    reservation_time=reservation_time,
                    business_name=business.name,
                    admin_email=admin_email
                )
                logger.info(f'Admin notification queued via Celery for reservation {instance.id}')
            except Exception as celery_error:
                logger.warning(f'Celery failed for admin notification, using direct email: {celery_error}')
                # Fallback to direct email
                success = send_new_reservation_admin_notification_direct(
                    customer_name=customer_name,
                    customer_phone=customer_phone,
                    reservation_id=instance.id,
                    reservation_date=reservation_date,
                    reservation_time=reservation_time,
                    business_name=business.name,
                    admin_email=admin_email
                )
                if success:
                    logger.info(f'Admin notification sent directly for reservation {instance.id}')
                else:
                    logger.error(f'Direct admin notification failed for reservation {instance.id}')
            
        # Note: No customer email notifications - business will contact customer via phone
        # Clean up the stored status
        if instance.pk in _reservation_old_status:
            del _reservation_old_status[instance.pk]
                
    except Exception as e:
        logger.error(f'Failed to process reservation {instance.id}: {str(e)}')
        # Clean up on error
        if instance.pk in _reservation_old_status:
            del _reservation_old_status[instance.pk]