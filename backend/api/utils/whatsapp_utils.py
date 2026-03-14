"""
WhatsApp utilities for sending messages via Twilio or Ultramsg
"""
from django.conf import settings
import logging
import requests

logger = logging.getLogger(__name__)


def send_whatsapp_twilio(to_phone, message_type, reservation, business):
    """
    Send WhatsApp message using Twilio (Official WhatsApp Business API)
    
    Args:
        to_phone: Customer phone number (e.g., "+38344123456")
        message_type: 'confirmed' or 'rejected'
        reservation: Reservation object
        business: Business object
        
    Returns:
        bool: True if message sent successfully, False otherwise
    """
    try:
        from twilio.rest import Client
        
        # Check if Twilio is configured
        if not settings.TWILIO_ACCOUNT_SID or not settings.TWILIO_AUTH_TOKEN:
            logger.warning('⚠️ Twilio not configured, skipping WhatsApp')
            return False
        
        client = Client(
            settings.TWILIO_ACCOUNT_SID,
            settings.TWILIO_AUTH_TOKEN
        )
        
        # WhatsApp requires 'whatsapp:' prefix
        to_whatsapp = f'whatsapp:{to_phone}'
        from_whatsapp = settings.TWILIO_WHATSAPP_NUMBER  # already has whatsapp: prefix
        
        # Message content
        if message_type == 'confirmed':
            message_body = (
                f"✅ Rezervimi juaj në {business.name} është KONFIRMUAR!\n\n"
                f"📅 Data: {reservation.reservation_date}\n"
                f"🕐 Ora: {reservation.reservation_time}\n\n"
                f"Ju presim! 😊"
            )
        elif message_type == 'rejected':
            message_body = (
                f"❌ Na vjen keq, rezervimi juaj në {business.name} nuk është konfirmuar.\n\n"
                f"📅 Data: {reservation.reservation_date}\n"
                f"� Ora: {reservation.reservation_time}\n\n"
                f"Termini i kërkuar është i zënë. Ju lutemi caktoni një termin tjetër."
            )
        else:
            logger.error(f'❌ Invalid message type: {message_type}')
            return False
        
        # Send message
        message = client.messages.create(
            body=message_body,
            from_=from_whatsapp,
            to=to_whatsapp
        )
        
        logger.info(f'✅ WhatsApp sent via Twilio to {to_phone}: {message.sid}')
        return True
        
    except Exception as e:
        logger.error(f'❌ Failed to send WhatsApp via Twilio to {to_phone}: {str(e)}')
        return False


def send_whatsapp_ultramsg(to_phone, message_type, reservation, business):
    """
    Send WhatsApp message using Ultramsg (Unofficial API - for testing)
    
    Args:
        to_phone: Customer phone number (e.g., "+38344123456")
        message_type: 'confirmed' or 'rejected'
        reservation: Reservation object
        business: Business object
        
    Returns:
        bool: True if message sent successfully, False otherwise
    """
    try:
        # Check if Ultramsg is configured
        if not settings.ULTRAMSG_INSTANCE_ID or not settings.ULTRAMSG_TOKEN:
            logger.warning('⚠️ Ultramsg not configured, skipping WhatsApp')
            return False
        
        # Remove '+' and spaces from phone number
        phone = to_phone.replace('+', '').replace(' ', '').replace('-', '')
        
        # Message content
        if message_type == 'confirmed':
            message = (
                f"✅ Rezervimi juaj në {business.name} është KONFIRMUAR!\n\n"
                f"📅 Data: {reservation.reservation_date}\n"
                f"🕐 Ora: {reservation.reservation_time}\n\n"
                f"Ju presim! 😊"
            )
        elif message_type == 'rejected':
            message = (
                f"❌ Na vjen keq, rezervimi juaj në {business.name} nuk është konfirmuar.\n\n"
                f"📅 Data: {reservation.reservation_date}\n"
                f"� Ora: {reservation.reservation_time}\n\n"
                f"Termini i kërkuar është i zënë. Ju lutemi na kontaktoni për të caktuar një termin tjetër."
            )
        else:
            logger.error(f'❌ Invalid message type: {message_type}')
            return False
        
        # Ultramsg API endpoint
        url = f"https://api.ultramsg.com/{settings.ULTRAMSG_INSTANCE_ID}/messages/chat"
        
        payload = {
            'token': settings.ULTRAMSG_TOKEN,
            'to': phone,
            'body': message
        }
        
        response = requests.post(url, data=payload, timeout=10)
        
        if response.status_code == 200:
            logger.info(f'✅ WhatsApp sent via Ultramsg to {to_phone}')
            return True
        else:
            logger.error(f'❌ WhatsApp failed via Ultramsg: {response.text}')
            return False
        
    except Exception as e:
        logger.error(f'❌ Failed to send WhatsApp via Ultramsg to {to_phone}: {str(e)}')
        return False


def send_whatsapp_message(to_phone, message_type, reservation, business):
    """
    Send WhatsApp message using configured provider (Twilio or Ultramsg)
    
    Tries Twilio first (if configured), falls back to Ultramsg
    
    Args:
        to_phone: Customer phone number (e.g., "+38344123456")
        message_type: 'confirmed' or 'rejected'
        reservation: Reservation object
        business: Business object
        
    Returns:
        bool: True if message sent successfully, False otherwise
    """
    # Try Twilio first (official API)
    if settings.TWILIO_ACCOUNT_SID and settings.TWILIO_AUTH_TOKEN:
        logger.info('📱 Attempting to send WhatsApp via Twilio...')
        result = send_whatsapp_twilio(to_phone, message_type, reservation, business)
        if result:
            return True
    
    # Fall back to Ultramsg (unofficial API)
    if settings.ULTRAMSG_INSTANCE_ID and settings.ULTRAMSG_TOKEN:
        logger.info('📱 Attempting to send WhatsApp via Ultramsg...')
        result = send_whatsapp_ultramsg(to_phone, message_type, reservation, business)
        if result:
            return True
    
    logger.warning('⚠️ No WhatsApp provider configured (Twilio or Ultramsg)')
    return False
