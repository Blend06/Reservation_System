# Backend Documentation

## Overview
Django REST API backend for the Fade District reservation system with JWT authentication, email notifications, and automated status management.

## 🏗️ Architecture

### Models
- **User**: Extended Django user with phone number and admin flags
- **Reservation**: Booking system with status tracking and timestamps

### API Endpoints
- **Authentication**: JWT-based login/register
- **Users**: CRUD operations for user management
- **Reservations**: Full reservation lifecycle management
- **Dashboard**: Statistics and overview data

## 📁 Project Structure

```
backend/
├── api/
│   ├── models/
│   │   ├── user.py          # Custom user model
│   │   └── reservation.py   # Reservation model
│   ├── serializers/
│   │   ├── user.py          # User serialization
│   │   └── reservation.py   # Reservation serialization
│   ├── views/
│   │   ├── auth.py          # Authentication endpoints
│   │   ├── user.py          # User management
│   │   ├── reservation.py   # Reservation CRUD
│   │   └── dashboard.py     # Dashboard statistics
│   ├── tasks/
│   │   ├── email_tasks.py   # Email notification tasks
│   │   └── status_tasks.py  # Status automation tasks
│   ├── signals.py           # Django signals for automation
│   └── urls.py              # API routing
├── backend/
│   ├── settings.py          # Django configuration
│   ├── celery.py           # Celery configuration
│   └── urls.py             # Main URL routing
├── email_templates/         # HTML email templates
├── requirements.txt         # Python dependencies
└── Dockerfile              # Container configuration
```

## 🔧 Key Features

### 1. Authentication System
- JWT token-based authentication
- Custom user model with phone field
- Admin and staff role management
- Secure password handling

### 2. Reservation Management
- Full CRUD operations
- Status workflow: pending → confirmed → completed
- Automatic status transitions via Celery
- Date/time validation

### 3. Email Notifications
- HTML email templates
- Async email sending via Celery
- Admin notifications for new reservations
- Customer notifications for status changes

### 4. Database Models

#### User Model
```python
class User(AbstractUser):
    phone = models.CharField(max_length=15, blank=True)
    is_admin = models.BooleanField(default=False)
    is_staff_member = models.BooleanField(default=False)
```

#### Reservation Model
```python
class Reservation(models.Model):
    customer = models.ForeignKey(User, on_delete=models.CASCADE)
    start_time = models.DateTimeField()
    end_time = models.DateTimeField()
    status = models.CharField(max_length=20, choices=STATUS_CHOICES)
    notes = models.TextField(blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
```

## 🚀 API Endpoints

### Authentication
- `POST /api/auth/register/` - User registration
- `POST /api/auth/login/` - User login
- `POST /api/auth/refresh/` - Token refresh

### Users
- `GET /api/users/` - List all users (admin only)
- `GET /api/users/{id}/` - Get user details
- `PATCH /api/users/{id}/` - Update user
- `DELETE /api/users/{id}/` - Delete user

### Reservations
- `GET /api/reservations/` - List reservations
- `POST /api/reservations/` - Create reservation
- `GET /api/reservations/{id}/` - Get reservation details
- `PATCH /api/reservations/{id}/` - Update reservation
- `DELETE /api/reservations/{id}/` - Delete reservation

### Dashboard
- `GET /api/dashboard/stats/` - Get system statistics

## ⚙️ Configuration

### Environment Variables (.env)
```env
SECRET_KEY=your-secret-key
DEBUG=True
DB_NAME=fade_district
DB_USER=root
DB_PASSWORD=password
DB_HOST=host.docker.internal
DB_PORT=3306
REDIS_URL=redis://redis:6379/0
EMAIL_HOST_USER=your-email@gmail.com
EMAIL_HOST_PASSWORD=your-app-password
ADMIN_EMAIL=admin@example.com
```

### Database Setup
```bash
python manage.py makemigrations
python manage.py migrate
python manage.py createsuperuser
```

### Running the Server
```bash
# Development
python manage.py runserver

# Production with Docker
docker-compose up backend
```

## 🔒 Security Features
- JWT token authentication
- CORS configuration for frontend
- Input validation and sanitization
- Admin-only endpoints protection
- Secure password hashing

## 📧 Email System
- Gmail SMTP integration
- HTML email templates
- Async processing via Celery
- Automatic notifications for:
  - New reservations (to admin)
  - Status changes (to customers)

## 🧪 Testing
```bash
python manage.py test
```

## 📦 Dependencies
- Django 4.2+
- Django REST Framework
- PyJWT for authentication
- Celery for background tasks
- Redis for task queue
- MySQL database
- python-dotenv for environment variables

## 🐳 Docker Support
- Multi-stage Dockerfile
- Production-ready configuration
- Automatic migrations on startup
- Health checks included