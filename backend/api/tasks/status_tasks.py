from celery import shared_task
from django.utils import timezone
from datetime import timedelta
import logging

logger = logging.getLogger(__name__)

@shared_task
def check_overdue_reservations():
    """
    Periodic task that runs every 5 minutes to auto-complete 
    confirmed reservations that are 35+ minutes past start_time
    """
    from api.models import Reservation
    
    try:
        # Calculate cutoff time (35 minutes ago)
        cutoff_time = timezone.now() - timedelta(minutes=35)
        
        # Find confirmed reservations that should be completed
        overdue_reservations = Reservation.objects.filter(
            status='confirmed',
            start_time__lte=cutoff_time
        )
        
        completed_count = 0
        for reservation in overdue_reservations:
            reservation.status = 'completed'
            reservation.save()
            completed_count += 1
            logger.info(f'Auto-completed overdue reservation {reservation.id}')
        
        if completed_count > 0:
            logger.info(f'Auto-completed {completed_count} overdue reservations')
        
        return f'Processed {completed_count} overdue reservations'
        
    except Exception as e:
        logger.error(f'Error checking overdue reservations: {str(e)}')
        raise e