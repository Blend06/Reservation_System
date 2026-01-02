# Fade District - Reservation Management System

## 🏢 Project Overview
A comprehensive reservation management system built with Django REST API backend and React frontend, featuring automated email notifications, status management, and admin controls.

## 🏗️ System Architecture

```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   React Frontend │    │  Django Backend │    │     Services    │
│                 │    │                 │    │                 │
│  • User Interface│◄──►│  • REST API     │◄──►│  • MySQL DB     │
│  • Admin Panel  │    │  • Authentication│    │  • Redis Queue  │
│  • Responsive   │    │  • Email System │    │  • Celery Tasks │
│  • Modern UI    │    │  • Auto Status  │    │  • SMTP Server  │
└─────────────────┘    └─────────────────┘    └─────────────────┘
```

## 🚀 Key Features

### 👥 User Management
- **JWT Authentication** - Secure token-based login system
- **Role-Based Access** - Admin, Staff, and Customer roles
- **Profile Management** - Complete user profile with phone numbers
- **Registration System** - Easy customer onboarding

### 📅 Reservation System
- **Full CRUD Operations** - Create, read, update, delete reservations
- **Status Workflow** - Pending → Confirmed → Completed → Cancelled
- **Automated Status Updates** - Auto-completion after 35 minutes
- **Date/Time Management** - DD/MM/YYYY format with time slots

### 📧 Email Notifications
- **HTML Email Templates** - Professional, responsive designs
- **Automated Triggers** - Status changes and new reservations
- **Admin Notifications** - Instant alerts for new bookings
- **Customer Updates** - Confirmation and cancellation emails

### 🔄 Background Processing
- **Celery Integration** - Async task processing
- **Scheduled Tasks** - Periodic status checks and updates
- **Redis Queue** - Reliable message broker
- **Email Queue** - Non-blocking email delivery

### 🎨 Modern Frontend
- **React 18** - Latest React with hooks
- **Tailwind CSS** - Utility-first styling
- **Responsive Design** - Mobile-first approach
- **Component Architecture** - Reusable UI components

## 📁 Project Structure

```
fade-district/
├── backend/                    # Django REST API
│   ├── api/                   # Main API application
│   │   ├── models/           # Database models
│   │   ├── serializers/      # API serializers
│   │   ├── views/            # API endpoints
│   │   ├── tasks/            # Celery background tasks
│   │   └── signals.py        # Django signals
│   ├── backend/              # Django project settings
│   ├── email_templates/      # HTML email templates
│   └── requirements.txt      # Python dependencies
├── frontend/                  # React application
│   ├── src/
│   │   ├── components/       # React components
│   │   │   ├── ui/          # Reusable UI components
│   │   │   ├── forms/       # Form components
│   │   │   └── admin/       # Admin panel components
│   │   ├── hooks/           # Custom React hooks
│   │   ├── utils/           # Utility functions
│   │   ├── auth/            # Authentication store
│   │   └── api/             # API configuration
│   └── package.json         # Node.js dependencies
├── docker-compose.yml        # Container orchestration
├── start-docker.bat         # Windows startup script
└── README.md               # This file
```

## 🛠️ Technology Stack

### Backend
- **Django 4.2+** - Python web framework
- **Django REST Framework** - API development
- **MySQL** - Primary database
- **Redis** - Task queue and caching
- **Celery** - Background task processing
- **JWT** - Authentication tokens
- **Gmail SMTP** - Email delivery

### Frontend
- **React 18** - JavaScript library
- **React Router** - Client-side routing
- **Tailwind CSS** - Utility-first CSS
- **Axios** - HTTP client
- **Zustand** - State management

### DevOps
- **Docker** - Containerization
- **Docker Compose** - Multi-container orchestration
- **Nginx** - Production web server
- **Environment Variables** - Configuration management

## 🚀 Quick Start

### Prerequisites
- Docker and Docker Compose
- Git

### 1. Clone Repository
```bash
git clone <repository-url>
cd fade-district
```

### 2. Environment Setup
```bash
# Copy environment template
cp backend/.env.example backend/.env

# Edit environment variables
# Update database, email, and Redis settings
```

### 3. Start with Docker
```bash
# Start all services
docker-compose up -d

# Or use the Windows batch file
start-docker.bat
```

### 4. Access Applications
- **Frontend**: http://localhost:3000
- **Backend API**: http://localhost:8000
- **Admin Panel**: http://localhost:8000/admin

### 5. Create Admin User
```bash
docker-compose exec backend python manage.py createsuperuser
```

## 📚 Documentation

### Component Documentation
- **[Backend API](backend/README.md)** - Django REST API documentation
- **[Frontend](frontend/README.md)** - React application documentation
- **[Email System](backend/EMAIL_SYSTEM.md)** - Email notification system
- **[Celery Automation](backend/CELERY_STATUS_AUTOMATION.md)** - Background task system

### API Documentation
- **Authentication**: JWT-based login/register
- **Users**: User management endpoints
- **Reservations**: Booking system API
- **Dashboard**: Statistics and analytics

## 🔧 Development Setup

### Backend Development
```bash
cd backend
python -m venv venv
source venv/bin/activate  # Windows: venv\Scripts\activate
pip install -r requirements.txt
python manage.py migrate
python manage.py runserver
```

### Frontend Development
```bash
cd frontend
npm install
npm start
```

### Background Services
```bash
# Redis (required for Celery)
redis-server

# Celery Worker
celery -A backend worker --loglevel=info

# Celery Beat (scheduled tasks)
celery -A backend beat --loglevel=info
```

## 🐳 Docker Services

### Service Overview
```yaml
services:
  mysql:        # Database server
  redis:        # Message broker
  backend:      # Django API server
  frontend:     # React development server
  celery-worker: # Background task processor
  celery-beat:  # Task scheduler
```

### Service Management
```bash
# Start all services
docker-compose up -d

# View logs
docker-compose logs -f [service-name]

# Stop services
docker-compose down

# Rebuild services
docker-compose up --build
```

## 🔒 Security Features

### Authentication & Authorization
- **JWT Tokens** - Secure, stateless authentication
- **Role-Based Access** - Admin, staff, and customer permissions
- **Password Security** - Django's built-in password hashing
- **CORS Configuration** - Secure cross-origin requests

### Data Protection
- **Environment Variables** - Sensitive data protection
- **Input Validation** - API request validation
- **SQL Injection Prevention** - Django ORM protection
- **XSS Protection** - Template auto-escaping

## 📊 System Features

### Reservation Workflow
1. **Customer Registration** - Account creation with phone number
2. **Reservation Creation** - Date/time selection with validation
3. **Admin Approval** - Manual confirmation process
4. **Email Notifications** - Automated customer and admin alerts
5. **Auto-Completion** - Automatic status updates after service time
6. **Status Management** - Complete lifecycle tracking

### Admin Capabilities
- **User Management** - View, edit, delete users
- **Reservation Control** - Approve, cancel, modify bookings
- **System Statistics** - Dashboard with key metrics
- **Email Monitoring** - Track notification delivery
- **Status Override** - Manual status management

### Customer Experience
- **Easy Registration** - Simple signup process
- **Reservation Booking** - Intuitive date/time selection
- **Status Tracking** - Real-time reservation updates
- **Email Updates** - Professional notification emails
- **Profile Management** - Update personal information

## 🧪 Testing

### Backend Testing
```bash
cd backend
python manage.py test
```

### Frontend Testing
```bash
cd frontend
npm test
```

### Integration Testing
```bash
# Test email system
python manage.py shell
>>> from django.core.mail import send_mail
>>> send_mail('Test', 'Message', 'from@example.com', ['to@example.com'])

# Test Celery tasks
celery -A backend inspect active
```

## 📈 Performance Optimization

### Backend Optimizations
- **Database Indexing** - Optimized query performance
- **Async Processing** - Non-blocking email delivery
- **Connection Pooling** - Efficient database connections
- **Caching Strategy** - Redis-based caching

### Frontend Optimizations
- **Code Splitting** - Route-based lazy loading
- **Component Memoization** - Optimized re-renders
- **Bundle Optimization** - Tree shaking and minification
- **State Management** - Efficient Zustand store

## 🔍 Monitoring & Logging

### Application Monitoring
- **Django Logging** - Comprehensive error tracking
- **Celery Monitoring** - Task execution tracking
- **Email Delivery** - Success/failure logging
- **API Performance** - Request/response monitoring

### Health Checks
- **Database Connectivity** - MySQL connection status
- **Redis Availability** - Queue system health
- **Email Service** - SMTP connection testing
- **API Endpoints** - Service availability checks

## 🚀 Deployment

### Production Deployment
1. **Environment Configuration** - Production settings
2. **Database Migration** - Schema updates
3. **Static File Collection** - Asset optimization
4. **Service Orchestration** - Docker Compose deployment
5. **SSL Configuration** - HTTPS setup
6. **Domain Configuration** - DNS and routing

### Scaling Considerations
- **Horizontal Scaling** - Multiple backend instances
- **Load Balancing** - Traffic distribution
- **Database Optimization** - Read replicas and indexing
- **CDN Integration** - Static asset delivery
- **Monitoring Setup** - Production monitoring tools

## 🤝 Contributing

### Development Workflow
1. Fork the repository
2. Create feature branch
3. Make changes with tests
4. Submit pull request
5. Code review process

### Code Standards
- **Python**: PEP 8 compliance
- **JavaScript**: ESLint configuration
- **Git**: Conventional commit messages
- **Documentation**: Comprehensive README updates

## 📄 License
This project is licensed under the MIT License - see the LICENSE file for details.

## 📞 Support
For support and questions:
- Create an issue in the repository
- Check existing documentation
- Review troubleshooting guides

---

**Built with ❤️ for efficient reservation management**