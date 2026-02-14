from django.db.models.signals import post_save, post_delete
from django.dispatch import receiver
from .models import Business, Reservation
from .websocket_utils import send_dashboard_update
from .serializers import BusinessListSerializer, ReservationSerializer

@receiver(post_save, sender=Business)
def business_saved(sender, instance, created, **kwargs):
    if created:
        send_dashboard_update('business_created', {
            'business': BusinessListSerializer(instance).data,
            'message': f'New business "{instance.name}" created'
        })
    else:
        send_dashboard_update('business_updated', {
            'business': BusinessListSerializer(instance).data,
            'message': f'Business "{instance.name}" updated'
        })

@receiver(post_save, sender=Reservation)
def reservation_saved(sender, instance, created, **kwargs):
    if created:
        send_dashboard_update('reservation_created', {
            'reservation': ReservationSerializer(instance).data,
            'business_name': instance.business.name,
            'message': f'New reservation for {instance.business.name}'
        })
