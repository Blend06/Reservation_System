# Super Admin Setup Guide

## 🎯 Overview

This guide shows YOU (the super admin / platform owner) how to configure the notification system for your entire SaaS platform. You only need to do this ONCE, and it will work for ALL your business owner clients.

---

## 📧 STEP 1: Configure Email (Gmail)

### 1.1 Create Gmail Account

Create a dedicated Gmail account for your SaaS platform:

```
Email: your-saas-name@gmail.com
Example: reservationsystem@gmail.com
Purpose: Send emails for ALL businesses
```

### 1.2 Enable 2-Step Verification

1. Go to https://myaccount.google.com/
2. Click "Security" in left sidebar
3. Find "2-Step Verification"
4. Click "Get Started" and follow instructions
5. Verify with your phone number

### 1.3 Generate App Password

1. Go to https://myaccount.google.com/apppasswords
2. Select app: "Mail"
3. Select device: "Other (Custom name)"
4. Enter name: "Reservation System"
5. Click "Generate"
6. Copy the 16-character password (e.g., "abcd efgh ijkl mnop")
7. Save it securely - you'll need it in Step 3

---

## 📱 STEP 2: Configure WhatsApp (Twilio)

### 2.1 Sign Up at Twilio

1. Go to https://www.twilio.com/
2. Click "Sign Up"
3. Fill in your details
4. Verify your email and phone number

### 2.2 Get WhatsApp Sandbox (For Testing)

1. Log in to Twilio Console
2. Go to: Console → Messaging → Try it out → Send a WhatsApp message
3. You'll see a QR code and a join code
4. Open WhatsApp on your phone
5. Send the join code to the Twilio number (e.g., "join abc-def")
6. Copy the Twilio WhatsApp number (e.g., +14155238886)

### 2.3 Get Production WhatsApp (For Real Use)

**Note:** This takes 1-2 days for approval

1. Go to: Console → Messaging → WhatsApp → Senders
2. Click "Request Access"
3. Fill in your business profile:
   - Business Name: Your SaaS Name
   - Business Website: yourdomain.com
   - Business Description: Reservation management system
   - Use Case: Customer notifications
4. Submit and wait for approval (usually 1-2 days)
5. Once approved, you'll get a production WhatsApp number

### 2.4 Get API Credentials

1. Go to: Console → Account → API keys & tokens
2. Copy your "Account SID" (starts with AC...)
3. Copy your "Auth Token"
4. Save both securely - you'll need them in Step 3

---

## 🔧 STEP 3: Configure Backend

### 3.1 Create .env File

```bash
cd backend
cp .env.example .env
nano .env
```

### 3.2 Add Your Credentials

```env
# Database (leave as is for Docker)
DB_NAME=reservation_db
DB_USER=postgres
DB_PASSWORD=password
DB_HOST=postgres
DB_PORT=5432

# Email (Gmail SMTP)
EMAIL_HOST_USER=your-saas-name@gmail.com
EMAIL_HOST_PASSWORD=abcd efgh ijkl mnop
ADMIN_EMAIL=your-saas-name@gmail.com

# WhatsApp (Twilio)
TWILIO_ACCOUNT_SID=ACxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
TWILIO_AUTH_TOKEN=your_auth_token_here
TWILIO_WHATSAPP_NUMBER=+14155238886
```

**Replace:**
- `your-saas-name@gmail.com` → Your Gmail address
- `abcd efgh ijkl mnop` → Your Gmail app password (16 chars)
- `ACxxxxx...` → Your Twilio Account SID
- `your_auth_token_here` → Your Twilio Auth Token
- `+14155238886` → Your Twilio WhatsApp number

### 3.3 Save and Exit

Press `Ctrl+X`, then `Y`, then `Enter`

---

## 🚀 STEP 4: Start the System

### 4.1 Start Docker Containers

```bash
docker-compose down
docker-compose up -d
```

### 4.2 Check Logs

```bash
docker logs fade_district-backend-1
```

You should see:
```
✅ No warnings about EMAIL_HOST_USER
✅ No warnings about TWILIO_ACCOUNT_SID
✅ Server starting successfully
```

---

## 🧪 STEP 5: Test Email

### 5.1 Open Django Shell

```bash
docker exec -it fade_district-backend-1 python manage.py shell
```

### 5.2 Test Email Configuration

```python
from api.utils.email_utils import test_email_configuration
result = test_email_configuration()
print(result)
```

**Expected Output:**
```python
{
    'success': True,
    'message': 'Test email sent successfully'
}
```

### 5.3 Check Your Email

Check your Gmail inbox (the one you configured). You should receive:
```
Subject: ✅ Test Email - Reservation System
Body: This is a test email to verify the email system is working correctly.
```

### 5.4 Exit Shell

```python
exit()
```

---

## 🧪 STEP 6: Test WhatsApp

### 6.1 Join WhatsApp Sandbox (If Testing)

1. Open WhatsApp on your phone
2. Send the join code to your Twilio number
3. Wait for confirmation message

### 6.2 Open Django Shell

```bash
docker exec -it fade_district-backend-1 python manage.py shell
```

### 6.3 Create Test Reservation

```python
from api.models import Business, Reservation
from api.utils.whatsapp_utils import send_whatsapp_message

# Get first business
business = Business.objects.first()

# Get first reservation (or create one)
reservation = Reservation.objects.first()

# Send test WhatsApp to YOUR phone number
send_whatsapp_message(
    to_phone="+38344123456",  # Replace with YOUR phone number
    message_type="confirmed",
    reservation=reservation,
    business=business
)
```

**Expected Output:**
```
📱 Attempting to send WhatsApp via Twilio...
✅ WhatsApp sent via Twilio to +38344123456: SM1234567890
```

### 6.4 Check Your Phone

You should receive a WhatsApp message:
```
✅ Your reservation at [Business Name] is CONFIRMED!

📅 Date: 2026-03-10
🕐 Time: 14:00
📍 Location: [Business Address]

See you soon! 😊
```

### 6.5 Exit Shell

```python
exit()
```

---

## ✅ STEP 7: Verify Everything Works

### 7.1 Create a Test Business

1. Log in as super admin: http://localhost:3000/login
2. Go to: http://localhost:3000/superadmin/businesses
3. Click "Create Business"
4. Fill in all fields including owner email
5. Click "Create Business"

### 7.2 Test Email Notification

1. Go to public booking page: http://localhost:3000/book/testsalon
2. Fill in reservation form
3. Submit reservation
4. Check business owner's email inbox
5. They should receive: "🔔 New Reservation #123 - Business Name"

### 7.3 Test WhatsApp Notification

1. Log in as business owner
2. Go to dashboard
3. Find pending reservation
4. Click "Accept"
5. Customer should receive WhatsApp confirmation

---

## 🎉 SUCCESS!

If all tests passed, your notification system is fully configured!

**What happens now:**
- ✅ All business owners receive emails when customers book
- ✅ All customers receive WhatsApp when owners accept/reject
- ✅ All emails come from YOUR Gmail account
- ✅ All WhatsApp messages come from YOUR Twilio number
- ✅ Business names appear in emails and messages
- ✅ Business owners do ZERO technical setup

---

## 🔒 SECURITY NOTES

### Protect Your .env File

**Never commit .env to Git:**
```bash
# Already in .gitignore
backend/.env
```

**Backup your credentials securely:**
- Save in password manager (1Password, LastPass, etc.)
- Don't share with anyone
- Don't post in public forums

### Production Deployment

When deploying to production:
1. Use environment variables (not .env file)
2. Use secrets management (AWS Secrets Manager, etc.)
3. Enable 2FA on Gmail and Twilio accounts
4. Monitor usage and costs

---

## 💰 COST MONITORING

### Check Gmail Usage

1. Go to: https://mail.google.com/
2. Settings → Accounts and Import
3. Check "Sent Mail" folder
4. Monitor daily email count (limit: 500/day)

### Check Twilio Usage

1. Go to: https://www.twilio.com/console
2. Monitor → Usage
3. Check WhatsApp conversations
4. Monitor costs (first 1,000/month free)

### Set Up Alerts

**Gmail:**
- No built-in alerts
- Manually check weekly

**Twilio:**
1. Console → Monitor → Alerts
2. Set alert at 800 conversations (80% of free tier)
3. Get email when approaching limit

---

## 🐛 TROUBLESHOOTING

### Email Not Sending

**Problem:** Emails not being sent

**Solutions:**
1. Check Gmail app password is correct (16 chars, no spaces)
2. Verify 2-Step Verification is enabled
3. Check EMAIL_HOST_USER in .env
4. Check logs: `docker logs fade_district-backend-1 | grep Email`
5. Test with: `python manage.py shell` → `test_email_configuration()`

### WhatsApp Not Sending

**Problem:** WhatsApp messages not being sent

**Solutions:**
1. Verify Twilio credentials are correct
2. Check WhatsApp Sandbox is active (for testing)
3. Verify phone number format: +38344123456 (with +)
4. Check Twilio console for error messages
5. Verify you joined sandbox (for testing)
6. Check logs: `docker logs fade_district-backend-1 | grep WhatsApp`

### Environment Variables Not Loading

**Problem:** Still seeing warnings about missing variables

**Solutions:**
1. Verify .env file exists: `ls -la backend/.env`
2. Check file has correct format (no quotes around values)
3. Restart Docker: `docker-compose down && docker-compose up -d`
4. Check Docker logs: `docker logs fade_district-backend-1`

---

## 📞 SUPPORT

If you encounter issues:

1. Check logs: `docker logs fade_district-backend-1`
2. Review documentation: `docs/NOTIFICATION_ARCHITECTURE.md`
3. Test email: `python manage.py test_email`
4. Test WhatsApp: Use Django shell examples above

---

## 📝 SUMMARY

**What You Configured:**
- ✅ ONE Gmail account for ALL businesses
- ✅ ONE Twilio account for ALL businesses
- ✅ Backend .env file with credentials
- ✅ Tested email sending
- ✅ Tested WhatsApp sending

**What Business Owners Do:**
- ❌ NOTHING! They just provide their email when you create their business

**What Customers Experience:**
- ✅ Professional email notifications
- ✅ WhatsApp confirmations with business name
- ✅ Reliable, consistent service

**Your Monthly Costs (10 clients):**
- Gmail: €0 (free)
- Twilio: €1 (phone number)
- Total: €1/month

**Your Monthly Revenue (10 clients):**
- 10 × €25 = €250/month
- Profit: €249/month (99.6% margin)

---

**Last Updated:** March 9, 2026  
**For:** Super Admin / Platform Owner  
**Status:** ✅ Ready to Use
