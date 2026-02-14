import json
from channels.generic.websocket import AsyncWebsocketConsumer
from channels.db import database_sync_to_async
from django.contrib.auth.models import AnonymousUser

class DashboardConsumer(AsyncWebsocketConsumer):
    async def connect(self):
        self.user = self.scope["user"]
        
        # Only allow authenticated super admins
        if self.user == AnonymousUser or not self.user.is_super_admin:
            await self.close()
            return
        
        self.room_group_name = 'dashboard_updates'
        
        # Join room group
        await self.channel_layer.group_add(
            self.room_group_name,
            self.channel_name
        )
        
        await self.accept()
        
        # Send connection confirmation
        await self.send(text_data=json.dumps({
            'type': 'connection_established',
            'message': 'Connected to dashboard updates'
        }))
    
    async def disconnect(self, close_code):
        # Leave room group
        await self.channel_layer.group_discard(
            self.room_group_name,
            self.channel_name
        )
    
    # Receive message from WebSocket
    async def receive(self, text_data):
        data = json.loads(text_data)
        message_type = data.get('type')
        
        # Handle different message types
        if message_type == 'ping':
            await self.send(text_data=json.dumps({
                'type': 'pong'
            }))
    
    # Receive message from room group
    async def dashboard_update(self, event):
        # Send message to WebSocket
        await self.send(text_data=json.dumps(event['data']))
    
    async def business_created(self, event):
        await self.send(text_data=json.dumps(event['data']))
    
    async def business_updated(self, event):
        await self.send(text_data=json.dumps(event['data']))
    
    async def reservation_created(self, event):
        await self.send(text_data=json.dumps(event['data']))


class NotificationConsumer(AsyncWebsocketConsumer):
    async def connect(self):
        self.user = self.scope["user"]
        
        if self.user == AnonymousUser:
            await self.close()
            return
        
        # User-specific notification channel
        self.room_group_name = f'notifications_{self.user.id}'
        
        await self.channel_layer.group_add(
            self.room_group_name,
            self.channel_name
        )
        
        await self.accept()
    
    async def disconnect(self, close_code):
        await self.channel_layer.group_discard(
            self.room_group_name,
            self.channel_name
        )
    
    async def notification(self, event):
        await self.send(text_data=json.dumps(event['data']))
