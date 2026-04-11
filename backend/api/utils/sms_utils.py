import os
from twilio.rest import Client
from django.utils import timezone
import pytz

def send_sms(to_phone, message):
    """
    Send SMS using Twilio
    
    Args:
        to_phone: Recipient phone number (format: +1234567890)
        message: SMS message text
    
    Returns:
        bool: True if sent successfully, False otherwise
    """
    try:
        account_sid = os.getenv('TWILIO_ACCOUNT_SID')
        auth_token = os.getenv('TWILIO_AUTH_TOKEN')
        from_phone = os.getenv('TWILIO_PHONE_NUMBER')
        
        if not all([account_sid, auth_token, from_phone]):
            print("Twilio credentials not configured")
            return False
        
        client = Client(account_sid, auth_token)
        
        message = client.messages.create(
            body=message,
            from_=from_phone,
            to=to_phone
        )
        
        print(f"SMS sent successfully. SID: {message.sid}")
        return True
        
    except Exception as e:
        print(f"Failed to send SMS: {str(e)}")
        return False


def send_reservation_confirmation_sms(reservation):
    """Send SMS notification for confirmed reservation"""
    customer_phone = reservation.customer_phone
    business_name = reservation.business.name if reservation.business else "the business"
    
    # Convert to local timezone (Europe/Berlin = Kosovo time)
    local_tz = pytz.timezone('Europe/Berlin')
    local_time = reservation.start_time.astimezone(local_tz)
    
    # Staff line if staff is assigned
    staff_line = f"Stafi: {reservation.staff.name}\n" if reservation.staff else ""
    
    message = (
        f"Rezervimi juaj ne {business_name} eshte KONFIRMUAR!\n\n"
        f"Data: {local_time.strftime('%d/%m/%Y')}\n"
        f"Ora: {local_time.strftime('%H:%M')}\n"
        f"{staff_line}\n"
        f"Ju presim!"
    )
    
    return send_sms(customer_phone, message)


def send_reservation_cancelled_sms(reservation):
    """Send SMS notification for cancelled/rejected reservation"""
    customer_phone = reservation.customer_phone
    business_name = reservation.business.name if reservation.business else "the business"
    
    # Convert to local timezone (Europe/Berlin = Kosovo time)
    local_tz = pytz.timezone('Europe/Berlin')
    local_time = reservation.start_time.astimezone(local_tz)
    
    # Staff line if staff was assigned
    staff_line = f"Stafi: {reservation.staff.name}\n" if reservation.staff else ""
    
    message = (
        f"Na vjen keq, rezervimi juaj ne {business_name} nuk eshte konfirmuar.\n\n"
        f"Data: {local_time.strftime('%d/%m/%Y')}\n"
        f"Ora: {local_time.strftime('%H:%M')}\n"
        f"{staff_line}\n"
        f"Ju lutemi caktoni nje termin tjeter."
    )
    
    return send_sms(customer_phone, message)


def send_admin_notification_sms(reservation, admin_phone):
    """Send SMS notification to business admin about new reservation"""
    # Convert to local timezone (Europe/Berlin = Kosovo time)
    local_tz = pytz.timezone('Europe/Berlin')
    local_time = reservation.start_time.astimezone(local_tz)
    
    staff_info = f"\nStafi: {reservation.staff.name}" if reservation.staff else ""
    
    message = (
        f"New Reservation!\n\n"
        f"Customer: {reservation.customer_name}\n"
        f"Phone: {reservation.customer_phone}\n"
        f"Date: {local_time.strftime('%d/%m/%Y')}\n"
        f"Time: {local_time.strftime('%H:%M')}"
        f"{staff_info}"
    )
    
    return send_sms(admin_phone, message)
