from django.db.models.signals import post_save
from django.dispatch import receiver
from .models import Business, Reservation
import logging

logger = logging.getLogger(__name__)

@receiver(post_save, sender=Business)
def business_saved(sender, instance, created, **kwargs):
    """Log business creation/update"""
    if created:
        logger.info(f'New business created: {instance.name}')
    else:
        logger.info(f'Business updated: {instance.name}')

@receiver(post_save, sender=Reservation)
def reservation_saved(sender, instance, created, **kwargs):
    """Log reservation creation"""
    if created:
        logger.info(f'New reservation created for {instance.business.name}')
