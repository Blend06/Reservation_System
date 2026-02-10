# Celery Status Automation Documentation

## Overview
Automated reservation status management system using Celery Beat for scheduled tasks and Redis as the message broker.

## 🏗️ Architecture

### Components
- **Celery Worker**: Processes background tasks
- **Celery Beat**: Scheduler for periodic tasks
- **Redis**: Message broker and result backend
- **Django Signals**: Trigger automated workflows

## 📁 File Structure

```
backend/
├── backend/
│   └── celery.py              # Celery configuration
├── api/
│   ├── tasks/
│   │   ├── __init__.py        # Task imports
│   │   ├── email_tasks.py     # Email notification tasks
│   │   └── status_tasks.py    # Status automation tasks
│   ├── signals.py             # Django signals
│   └── apps.py               # Signal registration
└── docker-compose.yml         # Service orchestration
```

## ⚙️ Celery Configuration

### Backend Settings (`backend/celery.py`)
```python
from celery import Celery
from django.conf import settings
import os

# Set Django settings module
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'backend.settings')

app = Celery('backend')
app.config_from_object('django.conf:settings', namespace='CELERY')
app.autodiscover_tasks()

# Celery Beat Schedule
app.conf.beat_schedule = {
    'check-overdue-reservations': {
        'task': 'api.tasks.status_tasks.check_overdue_reservations',
        'schedule': 300.0,  # Every 5 minutes
    },
}
app.conf.timezone = 'UTC'
```

### Django Settings Integration
```python
# Celery Configuration
CELERY_BROKER_URL = os.getenv('REDIS_URL', 'redis://localhost:6379/0')
CELERY_RESULT_BACKEND = os.getenv('REDIS_URL', 'redis://localhost:6379/0')
CELERY_ACCEPT_CONTENT = ['json']
CELERY_TASK_SERIALIZER = 'json'
CELERY_RESULT_SERIALIZER = 'json'
CELERY_TIMEZONE = 'UTC'
```

## 🔄 Status Automation Tasks

### Auto-Completion Task (`status_tasks.py`)
```python
@shared_task
def check_overdue_reservations():
    """
    Periodic task that runs every 5 minutes to auto-complete 
    confirmed reservations that are 35+ minutes past start_time
    """
    from api.models import Reservation
    
    try:
        # Calculate cutoff time (35 minutes ago)
        cutoff_time = timezone.now() - timedelta(minutes=35)
        
        # Find confirmed reservations that should be completed
        overdue_reservations = Reservation.objects.filter(
            status='confirmed',
            start_time__lte=cutoff_time
        )
        
        completed_count = 0
        for reservation in overdue_reservations:
            reservation.status = 'completed'
            reservation.save()
            completed_count += 1
            logger.info(f'Auto-completed overdue reservation {reservation.id}')
        
        if completed_count > 0:
            logger.info(f'Auto-completed {completed_count} overdue reservations')
        
        return f'Processed {completed_count} overdue reservations'
        
    except Exception as e:
        logger.error(f'Error checking overdue reservations: {str(e)}')
        raise e
```

## 📧 Email Automation Tasks

### Status Change Notifications (`email_tasks.py`)
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
        
        html_message = render_to_string(template, {
            'customer_name': customer_name,
            'customer_email': customer_email,
            'reservation_id': reservation_id,
            'reservation_date': reservation_date,
            'reservation_time': reservation_time,
        })
        
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

## 🔔 Django Signals Integration

### Signal Configuration (`signals.py`)
```python
from django.db.models.signals import post_save, pre_save
from django.dispatch import receiver
from api.models import Reservation
from api.tasks.email_tasks import send_reservation_status_email, send_new_reservation_admin_notification

@receiver(post_save, sender=Reservation)
def handle_reservation_created(sender, instance, created, **kwargs):
    """Send admin notification when new reservation is created"""
    if created:
        # Get customer details
        customer = instance.customer
        customer_name = f"{customer.first_name} {customer.last_name}" if customer.first_name else customer.username
        
        # Send admin notification
        send_new_reservation_admin_notification.delay(
            customer_name=customer_name,
            customer_email=customer.email,
            reservation_id=instance.id,
            reservation_date=instance.start_time.strftime('%d/%m/%Y'),
            reservation_time=instance.start_time.strftime('%H:%M')
        )

@receiver(pre_save, sender=Reservation)
def handle_reservation_status_change(sender, instance, **kwargs):
    """Send email notification when reservation status changes"""
    if instance.pk:  # Only for existing reservations
        try:
            old_instance = Reservation.objects.get(pk=instance.pk)
            if old_instance.status != instance.status:
                # Status changed, send notification
                if instance.status in ['confirmed', 'cancelled']:
                    customer = instance.customer
                    customer_name = f"{customer.first_name} {customer.last_name}" if customer.first_name else customer.username
                    
                    send_reservation_status_email.delay(
                        user_email=customer.email,
                        user_name=customer_name,
                        reservation_id=instance.id,
                        status=instance.status,
                        reservation_date=instance.start_time.strftime('%d/%m/%Y'),
                        reservation_time=instance.start_time.strftime('%H:%M')
                    )
        except Reservation.DoesNotExist:
            pass
```

### Signal Registration (`apps.py`)
```python
from django.apps import AppConfig

class ApiConfig(AppConfig):
    default_auto_field = 'django.db.models.BigAutoField'
    name = 'api'
    
    def ready(self):
        import api.signals  # Import signals to register them
```

## 🐳 Docker Configuration

### Docker Compose Services
```yaml
services:
  redis:
    image: redis:7-alpine
    ports:
      - "6379:6379"
    volumes:
      - redis_data:/data

  celery-worker:
    build: ./backend
    command: celery -A backend worker --loglevel=info
    volumes:
      - ./backend:/app
    depends_on:
      - redis
      - mysql
    environment:
      - REDIS_URL=redis://redis:6379/0

  celery-beat:
    build: ./backend
    command: celery -A backend beat --loglevel=info
    volumes:
      - ./backend:/app
    depends_on:
      - redis
      - mysql
    environment:
      - REDIS_URL=redis://redis:6379/0
```

## 🔧 Task Scheduling

### Celery Beat Schedule
- **Task**: `check_overdue_reservations`
- **Frequency**: Every 5 minutes (300 seconds)
- **Purpose**: Auto-complete reservations 35 minutes after start time
- **Timezone**: UTC

### Status Workflow
1. **Pending** → Created by customer
2. **Confirmed** → Approved by admin
3. **Completed** → Auto-completed after 35 minutes
4. **Cancelled** → Cancelled by admin or customer

## 📊 Monitoring & Logging

### Task Monitoring
```python
import logging
logger = logging.getLogger(__name__)

# Log task execution
logger.info(f'Auto-completed overdue reservation {reservation.id}')
logger.error(f'Error checking overdue reservations: {str(e)}')
```

### Celery Monitoring Tools
- **Flower**: Web-based monitoring (optional)
- **Django Admin**: Task result tracking
- **Redis CLI**: Queue inspection

## 🚀 Running the System

### Development
```bash
# Start Redis
redis-server

# Start Celery Worker
celery -A backend worker --loglevel=info

# Start Celery Beat
celery -A backend beat --loglevel=info
```

### Production (Docker)
```bash
docker-compose up celery-worker celery-beat redis
```

## 🔍 Troubleshooting

### Common Issues
1. **Redis Connection**: Check REDIS_URL environment variable
2. **Task Not Running**: Verify Celery Beat is running
3. **Email Failures**: Check SMTP configuration
4. **Signal Not Firing**: Ensure signals are imported in apps.py

### Debug Commands
```bash
# Check Redis connection
redis-cli ping

# List Celery tasks
celery -A backend inspect active

# Monitor task queue
celery -A backend events
```

## 📈 Performance Considerations

### Optimization Tips
- **Task Frequency**: 5-minute intervals balance responsiveness with resource usage
- **Batch Processing**: Process multiple reservations in single task execution
- **Error Handling**: Graceful failure handling prevents task queue blocking
- **Logging**: Comprehensive logging for debugging and monitoring

### Scaling
- **Multiple Workers**: Scale Celery workers horizontally
- **Task Routing**: Route different task types to specialized workers
- **Redis Clustering**: Scale Redis for high-volume deployments