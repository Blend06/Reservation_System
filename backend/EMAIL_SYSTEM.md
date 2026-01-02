# Email System Documentation

## Overview
Comprehensive email notification system for the Fade District reservation platform using Django's email framework, Celery for async processing, and Gmail SMTP for delivery.

## 🏗️ Architecture

### Components
- **Django Email Backend**: SMTP configuration for Gmail
- **Celery Tasks**: Asynchronous email processing
- **HTML Templates**: Professional email designs
- **Django Signals**: Automatic email triggers
- **Gmail SMTP**: Reliable email delivery service

## 📁 File Structure

```
backend/
├── email_templates/
│   ├── reservation_confirmed.html    # Customer confirmation email
│   ├── reservation_cancelled.html    # Customer cancellation email
│   └── new_reservation_admin.html    # Admin notification email
├── api/
│   ├── tasks/
│   │   └── email_tasks.py           # Celery email tasks
│   └── signals.py                   # Email trigger signals
└── backend/
    └── settings.py                  # Email configuration
```

## ⚙️ Email Configuration

### Django Settings (`backend/settings.py`)
```python
# Email Settings
EMAIL_BACKEND = 'django.core.mail.backends.smtp.EmailBackend'
EMAIL_HOST = 'smtp.gmail.com'
EMAIL_PORT = 587
EMAIL_USE_TLS = True
EMAIL_HOST_USER = os.getenv('EMAIL_HOST_USER')
EMAIL_HOST_PASSWORD = os.getenv('EMAIL_HOST_PASSWORD')
DEFAULT_FROM_EMAIL = os.getenv('EMAIL_HOST_USER')
ADMIN_EMAIL = os.getenv('ADMIN_EMAIL')

# Template Configuration
TEMPLATES = [
    {
        'BACKEND': 'django.template.backends.django.DjangoTemplates',
        'DIRS': [BASE_DIR / 'email_templates'],  # Email template directory
        'APP_DIRS': True,
        'OPTIONS': {
            'context_processors': [
                'django.template.context_processors.debug',
                'django.template.context_processors.request',
                'django.contrib.auth.context_processors.auth',
                'django.contrib.messages.context_processors.messages',
            ],
        },
    },
]
```

### Environment Variables (`.env`)
```env
# Gmail SMTP Configuration
EMAIL_HOST_USER=your-email@gmail.com
EMAIL_HOST_PASSWORD=your-app-password  # Gmail App Password (not regular password)
ADMIN_EMAIL=admin@example.com
```

## 📧 Email Tasks

### Customer Status Notifications (`email_tasks.py`)
```python
@shared_task
def send_reservation_status_email(user_email, user_name, reservation_id, status, reservation_date, reservation_time):
    """
    Send email notification when reservation status changes to confirmed or cancelled
    """
    try:
        if status == 'confirmed':
            subject = 'Your Reservation is Confirmed!'
            template = 'reservation_confirmed.html'
        elif status == 'cancelled':
            subject = 'Your Reservation has been Cancelled'
            template = 'reservation_cancelled.html'
        else:
            return  # Only send emails for confirmed or cancelled status
        
        # Render HTML email template
        html_message = render_to_string(template, {
            'user_name': user_name,
            'reservation_id': reservation_id,
            'reservation_date': reservation_date,
            'reservation_time': reservation_time,
            'status': status
        })
        
        # Send email
        send_mail(
            subject=subject,
            message='',  
            from_email=settings.DEFAULT_FROM_EMAIL,
            recipient_list=[user_email],
            html_message=html_message,
            fail_silently=False,
        )
        
        logger.info(f'Email sent successfully to {user_email} for reservation {reservation_id}')
        return f'Email sent to {user_email}'
        
    except Exception as e:
        logger.error(f'Failed to send email to {user_email}: {str(e)}')
        raise e
```

### Admin Notifications
```python
@shared_task
def send_new_reservation_admin_notification(customer_name, customer_email, reservation_id, reservation_date, reservation_time):
    """
    Send email notification to admin when a new reservation is created
    """
    try:
        subject = f'🔔 New Reservation #{reservation_id} - Action Required'
        template = 'new_reservation_admin.html'
        
        # Render HTML email template
        html_message = render_to_string(template, {
            'customer_name': customer_name,
            'customer_email': customer_email,
            'reservation_id': reservation_id,
            'reservation_date': reservation_date,
            'reservation_time': reservation_time,
        })
        
        # Send email to admin
        send_mail(
            subject=subject,
            message='',  
            from_email=settings.DEFAULT_FROM_EMAIL,
            recipient_list=[settings.ADMIN_EMAIL],
            html_message=html_message,
            fail_silently=False,
        )
        
        logger.info(f'Admin notification sent for new reservation {reservation_id}')
        return f'Admin notification sent for reservation {reservation_id}'
        
    except Exception as e:
        logger.error(f'Failed to send admin notification for reservation {reservation_id}: {str(e)}')
        raise e
```

## 🔔 Automatic Email Triggers

### Django Signals (`signals.py`)
```python
@receiver(post_save, sender=Reservation)
def reservation_status_changed(sender, instance, created, **kwargs):
    """
    Send email notifications:
    - To admin when new reservation is created
    - To customer when status changes to confirmed/cancelled
    """
    try:
        # Get user information
        user = instance.customer
        user_email = user.email
        user_name = f"{user.first_name} {user.last_name}".strip() or user.username
        
        # Format date and time
        reservation_date = instance.start_time.strftime('%B %d, %Y')
        reservation_time = instance.start_time.strftime('%I:%M %p')
        
        if created:  # New reservation created
            # Send notification to admin
            send_new_reservation_admin_notification.delay(
                customer_name=user_name,
                customer_email=user_email,
                reservation_id=instance.id,
                reservation_date=reservation_date,
                reservation_time=reservation_time
            )
            logger.info(f'Admin notification queued for new reservation {instance.id}')
            
        else:  # Existing reservation updated
            # Check if status changed to confirmed or cancelled
            if instance.status in ['confirmed', 'cancelled']:
                # Send email to customer
                send_reservation_status_email.delay(
                    user_email=user_email,
                    user_name=user_name,
                    reservation_id=instance.id,
                    status=instance.status,
                    reservation_date=reservation_date,
                    reservation_time=reservation_time
                )
                
                logger.info(f'Customer email task queued for reservation {instance.id} with status {instance.status}')
                
    except Exception as e:
        logger.error(f'Failed to process reservation {instance.id}: {str(e)}')
```

## 🎨 Email Templates

### 1. Reservation Confirmed (`reservation_confirmed.html`)
**Purpose**: Notify customer when reservation is approved
**Trigger**: Status changes to 'confirmed'
**Design**: Green theme with checkmark, professional layout

**Key Features**:
- Confirmation header with green styling
- Reservation details in highlighted box
- Clear call-to-action information
- Professional footer

### 2. Reservation Cancelled (`reservation_cancelled.html`)
**Purpose**: Notify customer when reservation is cancelled
**Trigger**: Status changes to 'cancelled'
**Design**: Red theme with cancellation styling

**Key Features**:
- Cancellation header with red styling
- Apologetic tone and explanation
- Rescheduling encouragement
- Contact information

### 3. Admin New Reservation (`new_reservation_admin.html`)
**Purpose**: Alert admin of new reservation requiring approval
**Trigger**: New reservation created
**Design**: Blue theme with urgent action styling

**Key Features**:
- Urgent action alert banner
- Complete customer and reservation details
- Clear next steps for admin
- Professional admin-focused design

## 📱 Email Template Features

### Responsive Design
- Mobile-friendly layouts
- Optimized for all email clients
- Professional typography
- Consistent branding

### Template Variables
```html
<!-- Available in all templates -->
{{ user_name }}          <!-- Customer's full name or username -->
{{ reservation_id }}     <!-- Unique reservation ID -->
{{ reservation_date }}   <!-- Formatted date (e.g., "January 15, 2025") -->
{{ reservation_time }}   <!-- Formatted time (e.g., "2:30 PM") -->
{{ status }}            <!-- Current reservation status -->

<!-- Admin template only -->
{{ customer_name }}     <!-- Customer's name -->
{{ customer_email }}    <!-- Customer's email address -->
```

### Styling Features
- Inline CSS for maximum compatibility
- Color-coded status indicators
- Professional color scheme
- Readable typography hierarchy
- Mobile-responsive design

## 🚀 Email Workflow

### New Reservation Flow
1. **Customer creates reservation** → Status: 'pending'
2. **Signal triggers** → `send_new_reservation_admin_notification.delay()`
3. **Admin receives email** → Professional notification with details
4. **Admin approves/rejects** → Status changes to 'confirmed'/'cancelled'
5. **Signal triggers** → `send_reservation_status_email.delay()`
6. **Customer receives email** → Confirmation or cancellation notification

### Status Change Flow
1. **Admin updates status** → Via admin panel or API
2. **Signal detects change** → Only for 'confirmed'/'cancelled' statuses
3. **Email task queued** → Async processing via Celery
4. **Email sent** → Professional HTML email to customer
5. **Logging** → Success/failure logged for monitoring

## 🔧 Gmail Setup

### App Password Configuration
1. **Enable 2FA** on Gmail account
2. **Generate App Password**:
   - Go to Google Account settings
   - Security → 2-Step Verification
   - App passwords → Generate password
   - Use generated password in `EMAIL_HOST_PASSWORD`

### Security Best Practices
- Use App Passwords (not regular password)
- Store credentials in environment variables
- Enable 2FA on Gmail account
- Monitor email sending limits
- Use dedicated email account for system

## 📊 Monitoring & Logging

### Email Task Logging
```python
import logging
logger = logging.getLogger(__name__)

# Success logging
logger.info(f'Email sent successfully to {user_email} for reservation {reservation_id}')

# Error logging
logger.error(f'Failed to send email to {user_email}: {str(e)}')
```

### Monitoring Points
- **Email delivery success/failure rates**
- **Task queue processing times**
- **SMTP connection issues**
- **Template rendering errors**
- **Signal trigger frequency**

## 🔍 Troubleshooting

### Common Issues

#### 1. Authentication Errors
```
SMTPAuthenticationError: Username and Password not accepted
```
**Solution**: 
- Verify App Password (not regular password)
- Check 2FA is enabled
- Regenerate App Password if needed

#### 2. Connection Timeouts
```
SMTPConnectError: Connection unexpectedly closed
```
**Solution**:
- Check internet connectivity
- Verify Gmail SMTP settings
- Check firewall/proxy settings

#### 3. Template Not Found
```
TemplateDoesNotExist: reservation_confirmed.html
```
**Solution**:
- Verify template directory in settings
- Check template file names
- Ensure templates are in correct location

#### 4. Signal Not Triggering
```
Email not sent when status changes
```
**Solution**:
- Verify signals are imported in `apps.py`
- Check signal receiver registration
- Review signal logic conditions

### Debug Commands
```bash
# Test email configuration
python manage.py shell
>>> from django.core.mail import send_mail
>>> send_mail('Test', 'Test message', 'from@example.com', ['to@example.com'])

# Check Celery task status
celery -A backend inspect active

# Monitor email tasks
celery -A backend events
```

## 📈 Performance Optimization

### Async Processing Benefits
- **Non-blocking**: Email sending doesn't delay API responses
- **Reliability**: Failed emails can be retried automatically
- **Scalability**: Multiple workers can process emails concurrently
- **Monitoring**: Task status and results are trackable

### Best Practices
- **Batch Processing**: Group multiple emails when possible
- **Rate Limiting**: Respect Gmail sending limits
- **Error Handling**: Graceful failure handling with retries
- **Template Caching**: Cache compiled templates for performance

## 🔒 Security Considerations

### Data Protection
- **No sensitive data** in email content
- **Secure credential storage** via environment variables
- **TLS encryption** for SMTP connections
- **Access logging** for audit trails

### Privacy Compliance
- **Opt-out mechanisms** for notifications
- **Data minimization** in email content
- **Secure template rendering** to prevent injection
- **Audit logging** for compliance tracking

## 🚀 Deployment

### Development Setup
```bash
# Install dependencies
pip install django celery redis

# Configure environment
cp .env.example .env
# Edit .env with your Gmail credentials

# Start services
redis-server
celery -A backend worker --loglevel=info
python manage.py runserver
```

### Production Deployment
```bash
# Docker Compose
docker-compose up -d

# Verify email service
docker-compose logs celery-worker
docker-compose logs backend
```

### Health Checks
- **SMTP connectivity**: Regular connection tests
- **Template validation**: Ensure templates render correctly
- **Queue monitoring**: Monitor Celery task queue
- **Delivery tracking**: Log email delivery success/failure