from channels.layers import get_channel_layer
from asgiref.sync import async_to_sync
from django.utils import timezone

def send_dashboard_update(event_type, data):
    """
    Send real-time update to all connected dashboard clients
    """
    channel_layer = get_channel_layer()
    async_to_sync(channel_layer.group_send)(
        'dashboard_updates',
        {
            'type': event_type,
            'data': {
                'type': event_type,
                'payload': data,
                'timestamp': str(timezone.now())
            }
        }
    )

def send_user_notification(user_id, notification_data):
    """
    Send notification to specific user
    """
    channel_layer = get_channel_layer()
    async_to_sync(channel_layer.group_send)(
        f'notifications_{user_id}',
        {
            'type': 'notification',
            'data': notification_data
        }
    )
