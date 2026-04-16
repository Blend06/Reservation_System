# Email & SMS Notification System

## Overview

This document explains how the notification system works for the reservation platform. The system uses:
- **Email** for business owner notifications
- **SMS** for customer notifications

## Architecture

### Notification Flow

```
┌─────────────────────────────────────────────────────────────┐
│  CUSTOMER BOOKS RESERVATION                                  │
│  (via public booking page)                                   │
└─────────────────────────────────────────────────────────────┘
                          │
                          ▼
┌─────────────────────────────────────────────────────────────┐
│  BACKEND CREATES RESERVATION                                 │
│  Status: pending                                             │
└─────────────────────────────────────────────────────────────┘
                          │
                          ▼
┌─────────────────────────────────────────────────────────────┐
│  EMAIL SENT TO BUSINESS OWNER                                │
│  "New reservation from [Customer Name]"                      │
└─────────────────────────────────────────────────────────────┘
                          │
                          ▼
┌─────────────────────────────────────────────────────────────┐
│  BUSINESS OWNER REVIEWS                                      │
│  (Clicks Accept or Reject)                                   │
└─────────────────────────────────────────────────────────────┘
                          │
                          ▼
┌─────────────────────────────────────────────────────────────┐
│  STATUS UPDATED                                              │
│  pending → confirmed/rejected                                │
└─────────────────────────────────────────────────────────────┘
                          │
                          ▼
┌─────────────────────────────────────────────────────────────┐
│  SMS SENT TO CUSTOMER                                        │
│  "Your reservation is confirmed!"                            │
└─────────────────────────────────────────────────────────────┘
```

## Email System (Gmail SMTP)

### Configuration

```env
EMAIL_HOST_USER=your-email@gmail.com
EMAIL_HOST_PASSWORD=your-app-password
ADMIN_EMAIL=your-email@gmail.com
```

### When Emails Are Sent

- New reservation created → Email to business owner
- Includes customer details, date, time, service

## SMS System (Twilio)

### Configuration

```env
TWILIO_ACCOUNT_SID=ACxxxxxxxxxxxxx
TWILIO_AUTH_TOKEN=your_auth_token
TWILIO_PHONE_NUMBER=+1234567890
```

### When SMS Are Sent

- Reservation confirmed → SMS to customer
- Reservation rejected → SMS to customer
- Reservation canceled → SMS to customer

### SMS Templates

**Confirmation:**
```
Reservation Confirmed at [Business Name]!

Date: January 15, 2026
Time: 02:00 PM
Service: Haircut

We'll see you soon!
```

**Cancellation:**
```
Reservation Cancelled

Your reservation at [Business Name] on January 15, 2026 at 02:00 PM has been cancelled.

Contact us if you have questions.
```

## Setup Instructions

See `SUPER_ADMIN_SETUP_GUIDE.md` for complete setup instructions for both email and SMS.

## Cost Analysis

### Email (Gmail)
- **Cost:** FREE
- **Limit:** 500 emails/day
- **Best for:** Business owner notifications

### SMS (Twilio)
- **Cost:** ~$0.0075/message (US)
- **Limit:** Pay-as-you-go
- **Best for:** Customer notifications

## Testing

### Test Email
```bash
docker exec -it backend python manage.py test_email
```

### Test SMS
```python
from api.utils.sms_utils import send_sms
send_sms("+1234567890", "Test message!")
```

## Troubleshooting

### Email Issues
- Check Gmail app password
- Verify 2FA is enabled
- Check spam folder

### SMS Issues  
- Verify Twilio credentials
- Check phone number format (+1234567890)
- Verify account has credits
- Check Twilio console for errors


## 🎯 Overview

This system handles all customer and business owner notifications through:
- **Email** → Business owners receive notifications about new reservations
- **WhatsApp** → Customers receive confirmation/rejection messages

**Key Features:**
- ✅ Synchronous sending (no Celery/Redis needed)
- ✅ Gmail SMTP for emails (FREE)
- ✅ Twilio WhatsApp API (FREE for 1,000 conversations/month)
- ✅ Simple and reliable
- ✅ Perfect for 5-50 clients

---

## 📧 EMAIL SYSTEM

### How It Works

**Workflow:**
1. Customer makes reservation on public booking page
2. System immediately sends email to business owner
3. Email contains: customer name, phone, date, time
4. Business owner opens dashboard to accept/reject

**Email Provider:** Gmail SMTP (FREE)

**Limits:**
- 500 emails per day
- For 10 clients × 50 reservations/month = 17 emails/day ✅

**Cost:** FREE

### Email Configuration

**1. Enable Gmail App Password:**

```
1. Go to myaccount.google.com
2. Security → 2-Step Verification → Turn On
3. Security → App passwords
4. Select "Mail" and "Other (Custom name)"
5. Name it "Reservation System"
6. Copy the 16-character password
```

**2. Update .env file:**

```env
EMAIL_HOST_USER=your-email@gmail.com
EMAIL_HOST_PASSWORD=your-16-char-app-password
ADMIN_EMAIL=your-email@gmail.com
```

**3. Test email:**

```bash
docker exec -it fade_district-backend-1 python manage.py shell

from api.utils.email_utils import test_email_configuration
result = test_email_configuration()
print(result)
```

### Email Templates

Located in `backend/email_templates/`:

**new_reservation_admin.html** - Sent to business owner when new reservation is created

```html
Subject: 🔔 New Reservation #123 - Salon Name

Body:
- Customer Name
- Customer Email
- Customer Phone
- Reservation Date
- Reservation Time
```

### Email Code

**File:** `backend/api/utils/email_utils.py`

```python
from api.utils.email_utils import send_new_reservation_email

# Send email to business owner
result = send_new_reservation_email(reservation)
if result:
    print("Email sent successfully")
```

---

## 📱 WHATSAPP SYSTEM

### How It Works

**Workflow:**
1. Business owner receives email about new reservation
2. Business owner opens dashboard
3. Business owner clicks "Accept" or "Reject"
4. System immediately sends WhatsApp to customer
5. Customer receives confirmation/rejection message

**WhatsApp Provider:** Twilio (Official WhatsApp Business API)

**Limits:**
- First 1,000 conversations/month: FREE
- For 10 clients × 50 reservations/month = 500 conversations ✅

**Cost:** FREE (under 1,000/month)

### WhatsApp Configuration - Twilio (Recommended)

**1. Sign up at Twilio:**

```
1. Go to https://www.twilio.com/
2. Sign up for free account
3. Verify your email and phone
```

**2. Get WhatsApp Sandbox (for testing):**

```
1. Console → Messaging → Try it out → Send a WhatsApp message
2. Scan QR code or send "join <code>" to Twilio number
3. Copy the sandbox number (e.g., +14155238886)
```

**3. Get Production WhatsApp Number (for real use):**

```
1. Console → Messaging → WhatsApp → Senders
2. Request access to WhatsApp Business API
3. Submit business profile (takes 1-2 days)
4. Get approved WhatsApp number
```

**4. Get API Credentials:**

```
1. Console → Account → API keys & tokens
2. Copy Account SID
3. Copy Auth Token
```

**5. Update .env file:**

```env
TWILIO_ACCOUNT_SID=ACxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
TWILIO_AUTH_TOKEN=your_auth_token_here
TWILIO_WHATSAPP_NUMBER=+14155238886
```

**6. Test WhatsApp:**

```bash
docker exec -it fade_district-backend-1 python manage.py shell

from api.models import Reservation, Business
from api.utils.whatsapp_utils import send_whatsapp_message

reservation = Reservation.objects.first()
business = reservation.business

result = send_whatsapp_message(
    to_phone="+38344123456",  # Your test number
    message_type="confirmed",
    reservation=reservation,
    business=business
)
print(result)
```

### WhatsApp Configuration - Ultramsg (Alternative for Testing)

**1. Sign up at Ultramsg:**

```
1. Go to https://ultramsg.com/
2. Sign up for account
3. Choose plan (€10/month for 5,000 messages)
```

**2. Connect WhatsApp:**

```
1. Dashboard → Instances → Create Instance
2. Scan QR code with business phone
3. Copy Instance ID
4. Copy Token
```

**3. Update .env file:**

```env
ULTRAMSG_INSTANCE_ID=instance123456
ULTRAMSG_TOKEN=your_token_here
```

**Note:** Ultramsg is unofficial and against WhatsApp ToS. Use only for testing, switch to Twilio for production.

### WhatsApp Message Templates

**Confirmed Reservation:**
```
✅ Your reservation at [Business Name] is CONFIRMED!

📅 Date: 2026-03-15
🕐 Time: 14:00
📍 Location: [Business Address]

See you soon! 😊
```

**Rejected Reservation:**
```
❌ Sorry, your reservation at [Business Name] could not be confirmed.

📅 Date: 2026-03-15
🕐 Time: 14:00

Please contact us to reschedule.
```

### WhatsApp Code

**File:** `backend/api/utils/whatsapp_utils.py`

```python
from api.utils.whatsapp_utils import send_whatsapp_message

# Send WhatsApp to customer
result = send_whatsapp_message(
    to_phone=reservation.customer_phone,
    message_type='confirmed',  # or 'rejected'
    reservation=reservation,
    business=business
)
if result:
    print("WhatsApp sent successfully")
```

---

## 🔄 COMPLETE WORKFLOW

### 1. Customer Makes Reservation

**File:** `backend/api/views/reservation.py`

```python
def create(self, request, *args, **kwargs):
    # Create reservation
    reservation = serializer.save()
    
    # Send email to business owner (synchronous)
    send_new_reservation_email(reservation)
    
    return Response(serializer.data)
```

### 2. Business Owner Accepts/Rejects

**File:** `backend/api/views/reservation.py`

```python
@action(detail=True, methods=['post'])
def update_status(self, request, pk=None):
    reservation = self.get_object()
    new_status = request.data.get('status')
    
    # Update status
    reservation.status = new_status
    reservation.save()
    
    # Send WhatsApp to customer (synchronous)
    if new_status in ['confirmed', 'rejected']:
        send_whatsapp_message(
            to_phone=reservation.customer_phone,
            message_type=new_status,
            reservation=reservation,
            business=reservation.business
        )
    
    return Response({'status': 'success'})
```

---

## 💰 COST BREAKDOWN

### Email Costs

| Clients | Reservations/Month | Emails/Day | Gmail Limit | Cost |
|---------|-------------------|------------|-------------|------|
| 5 | 250 | 8 | 500/day | FREE |
| 10 | 500 | 17 | 500/day | FREE |
| 20 | 1,000 | 33 | 500/day | FREE |
| 30 | 1,500 | 50 | 500/day | FREE |

**Gmail SMTP is FREE forever for up to 500 emails/day!**

### WhatsApp Costs (Twilio)

| Clients | Conversations/Month | Free Tier | Paid | Cost |
|---------|-------------------|-----------|------|------|
| 5 | 250 | 250 | 0 | €0 |
| 10 | 500 | 500 | 0 | €0 |
| 20 | 1,000 | 1,000 | 0 | €0 |
| 25 | 1,250 | 1,000 | 250 | €7.50 |
| 50 | 2,500 | 1,000 | 1,500 | €45 |

**Additional:** Twilio phone number = €1/month

**Total Monthly Costs (10 clients):**
```
Email: €0
WhatsApp: €0
Twilio Phone: €1
Total: €1/month
```

---

## 🚀 DEPLOYMENT CHECKLIST

### Email Setup
- [ ] Enable Gmail 2-Step Verification
- [ ] Generate Gmail App Password
- [ ] Update EMAIL_HOST_USER in .env
- [ ] Update EMAIL_HOST_PASSWORD in .env
- [ ] Test email sending

### WhatsApp Setup (Twilio)
- [ ] Sign up at Twilio
- [ ] Get WhatsApp Sandbox for testing
- [ ] Request WhatsApp Business API access
- [ ] Get Account SID and Auth Token
- [ ] Update TWILIO_ACCOUNT_SID in .env
- [ ] Update TWILIO_AUTH_TOKEN in .env
- [ ] Update TWILIO_WHATSAPP_NUMBER in .env
- [ ] Test WhatsApp sending

### Alternative: WhatsApp Setup (Ultramsg)
- [ ] Sign up at Ultramsg
- [ ] Create instance and scan QR code
- [ ] Get Instance ID and Token
- [ ] Update ULTRAMSG_INSTANCE_ID in .env
- [ ] Update ULTRAMSG_TOKEN in .env
- [ ] Test WhatsApp sending

---

## 🐛 TROUBLESHOOTING

### Email Not Sending

**Problem:** Email fails to send

**Solutions:**
1. Check Gmail App Password is correct (16 characters, no spaces)
2. Verify 2-Step Verification is enabled
3. Check EMAIL_HOST_USER and EMAIL_HOST_PASSWORD in .env
4. Check logs: `docker logs fade_district-backend-1`
5. Test with: `python manage.py shell` → `test_email_configuration()`

### WhatsApp Not Sending (Twilio)

**Problem:** WhatsApp message fails

**Solutions:**
1. Verify Twilio credentials are correct
2. Check WhatsApp Sandbox is active (for testing)
3. Verify phone number format: +38344123456 (with country code)
4. Check Twilio console for error messages
5. Verify you have WhatsApp Business API access (not just sandbox)
6. Check logs: `docker logs fade_district-backend-1`

### WhatsApp Not Sending (Ultramsg)

**Problem:** WhatsApp message fails

**Solutions:**
1. Verify Ultramsg instance is active
2. Check QR code connection is still valid
3. Verify phone number format: 38344123456 (no + sign)
4. Check Ultramsg dashboard for errors
5. Verify you have enough message credits

---

## 📊 MONITORING

### Check Email Logs

```bash
docker logs fade_district-backend-1 | grep "Email"
```

**Expected output:**
```
✅ Email sent to owner@business.com for reservation 123
```

### Check WhatsApp Logs

```bash
docker logs fade_district-backend-1 | grep "WhatsApp"
```

**Expected output:**
```
📱 Attempting to send WhatsApp via Twilio...
✅ WhatsApp sent via Twilio to +38344123456: SM1234567890
```

---

## 🎯 BEST PRACTICES

### Email
- ✅ Use Gmail SMTP (free and reliable)
- ✅ Keep emails simple and clear
- ✅ Include all reservation details
- ✅ Send only to business owner (not customer)
- ✅ Log all email attempts

### WhatsApp
- ✅ Use Twilio for production (official API)
- ✅ Use Ultramsg only for testing
- ✅ Keep messages short and clear
- ✅ Include emojis for better UX
- ✅ Send only after status change (confirmed/rejected)
- ✅ Log all WhatsApp attempts
- ✅ Handle failures gracefully

### Phone Numbers
- ✅ Always include country code: +383
- ✅ Validate format before sending
- ✅ Store in international format: +38344123456
- ✅ Remove spaces and dashes before sending

---

## 📝 SUMMARY

**Email System:**
- Gmail SMTP (FREE)
- Synchronous sending (no Celery)
- Business owner notifications only
- 500 emails/day limit

**WhatsApp System:**
- Twilio (FREE for 1,000/month)
- Synchronous sending (no Celery)
- Customer notifications only
- Confirmed/rejected messages

**Total Cost (10 clients):**
- Email: €0/month
- WhatsApp: €0/month
- Twilio Phone: €1/month
- **Total: €1/month** 🎉

**Perfect for 5-50 clients!**

---

**Last Updated:** February 14, 2026
**System:** Simplified Architecture (No Celery, No Redis, No WebSockets)
