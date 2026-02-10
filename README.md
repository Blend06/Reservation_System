# Fade District - Multi-Tenant SaaS Reservation System

## 🏢 Project Overview
A comprehensive multi-tenant SaaS reservation management system built with Django REST API backend and React frontend. Designed for businesses like salons, spas, restaurants, and service providers to manage customer reservations efficiently through a centralized platform.

## 🚀 Quick Start

### Prerequisites
- Docker and Docker Compose
- Git

### 1. Clone Repository
```bash
git clone <repository-url>
cd fade-district
```

### 2. Start with Docker
```bash
# Start all services
docker-compose up -d

# Or use the Windows batch file
start-docker.bat
```

### 3. Create Super Admin
```bash
docker-compose exec backend python manage.py create_superadmin \
  --email stars@reservation.com \
  --password test123 \
  --first-name Super \
  --last-name Admin
```

### 4. Access Applications
- **Frontend**: http://localhost:3000
- **Backend API**: http://localhost:8000
- **Admin Panel**: http://localhost:8000/admin

### 5. Test Login
- **Super Admin**: `stars@reservation.com` / `test123`
- **Public Booking**: http://localhost:3000/book/testsalon

## 📚 Documentation

All comprehensive documentation has been organized in the **[docs/](docs/)** directory:

### 📋 Quick Links
- **[📖 Documentation Index](docs/INDEX.md)** - Complete documentation overview
- **[🔑 Test Credentials](docs/TEST_CREDENTIALS.md)** - Login credentials and testing guide
- **[🏗️ System Architecture](docs/MULTI_TENANT_SAAS_DOCUMENTATION.md)** - Complete SaaS documentation
- **[👥 User Roles & Navigation](docs/NAVIGATION_AND_ROLES.md)** - Access control and navigation
- **[💼 Business Management](docs/BUSINESS_MANAGEMENT_GUIDE.md)** - CRUD operations guide

### 🔧 Technical Documentation
- **[⚙️ Backend API](docs/BACKEND_README.md)** - Django REST API documentation
- **[⚛️ Frontend](docs/FRONTEND_README.md)** - React application documentation
- **[📧 Email System](docs/EMAIL_SYSTEM.md)** - Email notifications
- **[🔄 Background Tasks](docs/CELERY_STATUS_AUTOMATION.md)** - Celery automation
- **[🚀 Performance](docs/OPTIMIZATION_SUMMARY.md)** - Optimization guide

## 🏗️ Multi-Tenant Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                    MAIN DOMAIN (yourdomain.com)                │
├─────────────────┬─────────────────┬─────────────────────────────┤
│  Super Admin    │ Business Owner  │        Public Access       │
│   Dashboard     │   Dashboard     │                             │
│                 │                 │                             │
│ • Manage All    │ • Own Business  │ • Landing Page             │
│   Businesses    │   Only          │ • Login/Register           │
│ • Create Users  │ • Reservations  │                             │
│ • System Stats  │ • Customers     │                             │
└─────────────────┴─────────────────┴─────────────────────────────┘
                            │
                            ▼
┌─────────────────────────────────────────────────────────────────┐
│              SUBDOMAINS (business.yourdomain.com)              │
├─────────────────────────────────────────────────────────────────┤
│                   PUBLIC BOOKING INTERFACE                     │
│                                                                 │
│ • No Login Required     • Business-Specific Branding          │
│ • Simple Booking Form   • Custom Domain Support               │
│ • Real-time Availability• Mobile-Optimized                    │
│ • Instant Confirmation  • Multi-language Support              │
└─────────────────────────────────────────────────────────────────┘
```

## 🎯 Key Features

### 👥 Three-Tier User System
1. **Super Admin**: Platform administrator managing the entire SaaS
2. **Business Owner**: Individual business managers with dedicated dashboards
3. **End Customers**: Public users making reservations (no login required)

### 🚀 Core Functionality
- **JWT Authentication** - Secure token-based login system
- **Full CRUD Operations** - Complete business and reservation management
- **Email Notifications** - Automated business owner notifications
- **Background Processing** - Celery-powered async tasks
- **Multi-Tenant Architecture** - Complete business data isolation
- **Responsive Design** - Mobile-first React interface

## 🛠️ Technology Stack

### Backend
- **Django 4.2+** - Python web framework
- **Django REST Framework** - API development
- **PostgreSQL** - Primary database
- **Redis** - Task queue and caching
- **Celery** - Background task processing

### Frontend
- **React 18** - JavaScript library
- **Tailwind CSS** - Utility-first CSS
- **React Router** - Client-side routing
- **Axios** - HTTP client

### DevOps
- **Docker** - Containerization
- **Docker Compose** - Multi-container orchestration

## 📁 Project Structure

```
fade-district/
├── docs/                      # 📚 All documentation
│   ├── INDEX.md              # Documentation index
│   ├── TEST_CREDENTIALS.md   # Test accounts
│   ├── MULTI_TENANT_SAAS_DOCUMENTATION.md
│   └── ... (all other docs)
├── backend/                   # Django REST API
│   ├── api/                  # Main API application
│   ├── backend/              # Django project settings
│   └── requirements.txt      # Python dependencies
├── frontend/                  # React application
│   ├── src/                  # Source code
│   └── package.json          # Node.js dependencies
├── docker-compose.yml         # Container orchestration
├── start-docker.bat          # Windows startup script
└── README.md                 # This file
```

## 🔍 Testing

### Test Accounts
- **Super Admin**: `stars@reservation.com` / `test123`
- **Test Business**: `testsalon` subdomain
- **Public Booking**: http://localhost:3000/book/testsalon

### Testing Workflows
1. **Super Admin**: Login → Manage businesses → View all reservations
2. **Business Owner**: Login → View business dashboard → Manage reservations
3. **Customer**: Visit booking page → Make reservation → Business owner gets notified

For detailed testing instructions, see **[Test Credentials Guide](docs/TEST_CREDENTIALS.md)**.

## 🚀 Deployment

### Development
```bash
docker-compose up -d
```

### Production
See **[System Architecture Documentation](docs/MULTI_TENANT_SAAS_DOCUMENTATION.md)** for production deployment guidelines.

## 🤝 Contributing

1. Fork the repository
2. Create feature branch
3. Make changes with tests
4. Update documentation in `docs/`
5. Submit pull request

## 📄 License
This project is licensed under the MIT License - see the LICENSE file for details.

## 📞 Support
- **Documentation**: Check the [docs/](docs/) directory
- **Issues**: Create an issue in the repository
- **Architecture Questions**: See [System Documentation](docs/MULTI_TENANT_SAAS_DOCUMENTATION.md)

---

**Built with ❤️ for efficient multi-tenant reservation management**