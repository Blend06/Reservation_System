# SMS Notification System

## Overview

The reservation system uses **Twilio SMS** to send text message notifications to customers when their reservation status changes.

## How It Works

### Notification Flow

```
Customer books → Email to business owner
Business owner accepts/rejects → SMS to customer
```

### SMS Triggers

SMS notifications are sent when:
- Reservation status changes to **confirmed**
- Reservation status changes to **rejected** 
- Reservation status changes to **canceled**

## SMS Message Templates

### Confirmation SMS
```
Reservation Confirmed at [Business Name]!

Date: January 15, 2026
Time: 02:00 PM
Service: Haircut

We'll see you soon!
```

### Cancellation SMS
```
Reservation Cancelled

Your reservation at [Business Name] on January 15, 2026 at 02:00 PM has been cancelled.

Contact us if you have questions.
```

## Technical Implementation

### Backend (Django)

**File:** `backend/api/utils/sms_utils.py`

```python
from twilio.rest import Client

def send_sms(to_phone, message):
    client = Client(account_sid, auth_token)
    message = client.messages.create(
        body=message,
        from_=twilio_phone,
        to=to_phone
    )
    return True
```

### Environment Variables

```env
TWILIO_ACCOUNT_SID=ACxxxxxxxxxxxxx
TWILIO_AUTH_TOKEN=your_auth_token
TWILIO_PHONE_NUMBER=+1234567890
```

## Setup Guide

See `SUPER_ADMIN_SETUP_GUIDE.md` for complete Twilio SMS setup instructions.

## Cost

- Twilio SMS: ~$0.0075 per message (US)
- International rates vary by country
- No monthly fees, pay-as-you-go

## Testing

```python
from api.utils.sms_utils import send_sms

send_sms("+1234567890", "Test message from Reservo!")
```

## Troubleshooting

### SMS Not Sending

1. Check Twilio credentials in `.env`
2. Verify phone number format: `+1234567890` (with country code)
3. Check Twilio console for error messages
4. Verify account has credits
5. Check logs: `docker logs backend | grep SMS`

### Invalid Phone Number

- Must include country code: `+1` for US
- No spaces or special characters
- Format: `+12345678900`
