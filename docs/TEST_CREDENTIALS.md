# Test Credentials and Setup Guide

## Test User Accounts

### Super Admin Account
- **Email**: `stars@reservation.com`
- **Password**: `test123`
- **Role**: Super Admin
- **Access**: Full system access, can manage all businesses
- **Dashboard**: `/superadmin/dashboard`

### Business Owner Account
To create a business owner account, you need to:
1. Login as Super Admin
2. Create a business in `/superadmin/businesses`
3. Create a user and assign them to that business

**Example Business Owner**:
- **Email**: `owner@testsalon.com`
- **Password**: `test123`
- **Role**: Business Owner
- **Business**: Test Salon (subdomain: `testsalon`)
- **Dashboard**: `/business/dashboard`

## Creating Test Users

### Method 1: Using Django Management Command
```bash
# Create Super Admin
docker-compose exec backend python manage.py create_superadmin \
  --email stars@reservation.com \
  --password test123 \
  --first-name Super \
  --last-name Admin

# Or if running locally
python manage.py create_superadmin \
  --email stars@reservation.com \
  --password test123 \
  --first-name Super \
  --last-name Admin
```

### Method 2: Using Django Admin Panel
1. Access Django Admin: `http://localhost:8000/admin/`
2. Login with super admin credentials
3. Create users manually through the interface

### Method 3: Using Super Admin Dashboard
1. Login as Super Admin at `http://localhost:3000/login`
2. Navigate to Business Management
3. Create businesses and assign business owners

## Test Business Setup

### Default Test Business
- **Name**: Test Salon
- **Subdomain**: `testsalon`
- **Email**: `info@testsalon.com`
- **Phone**: `+1-555-0123`
- **Hours**: 09:00 - 18:00
- **Timezone**: Europe/Berlin
- **Primary Color**: #3B82F6
- **Logo URL**: `https://via.placeholder.com/200x200/3B82F6/FFFFFF?text=TEST+SALON`

### Public Booking URL
- **Local**: `http://localhost:3000/book/testsalon`
- **Production**: `https://testsalon.yourdomain.com` or `https://yourdomain.com/book/testsalon`

## Login Testing

### Super Admin Login Flow
1. Go to `http://localhost:3000/login`
2. Enter email: `stars@reservation.com`
3. Enter password: `test123`
4. Should redirect to `/superadmin/dashboard`

### Business Owner Login Flow
1. Go to `http://localhost:3000/login`
2. Enter business owner credentials
3. Should redirect to `/business/dashboard`

### Public Booking (No Login Required)
1. Go to `http://localhost:3000/book/testsalon`
2. Fill out booking form
3. Submit reservation
4. Business owner receives email notification

## Database Setup Commands

### Initial Setup
```bash
# Run migrations
docker-compose exec backend python manage.py makemigrations
docker-compose exec backend python manage.py migrate

# Create super admin
docker-compose exec backend python manage.py create_superadmin \
  --email stars@reservation.com \
  --password test123 \
  --first-name Super \
  --last-name Admin
```

### Reset Database (if needed)
```bash
# Stop services
docker-compose down

# Remove database volume
docker volume rm fade_district_postgres_data

# Start services (will recreate database)
docker-compose up -d

# Run setup commands again
docker-compose exec backend python manage.py migrate
docker-compose exec backend python manage.py create_superadmin \
  --email stars@reservation.com \
  --password test123 \
  --first-name Super \
  --last-name Admin
```

## Testing Scenarios

### 1. Super Admin Workflow
1. Login as Super Admin
2. Create a new business
3. View business statistics
4. Manage all reservations across businesses
5. Configure system settings

### 2. Business Owner Workflow
1. Login as Business Owner
2. View business dashboard
3. Manage reservations for their business
4. Confirm/cancel customer reservations
5. View business analytics

### 3. Customer Booking Workflow
1. Visit public booking page
2. Fill out reservation form
3. Submit booking
4. Business owner receives email notification
5. Business owner can confirm/cancel from dashboard

## Email Testing

### SMTP Configuration
Add to `backend/.env`:
```env
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USE_TLS=True
EMAIL_HOST_USER=your-email@gmail.com
EMAIL_HOST_PASSWORD=your-app-password
ADMIN_EMAIL=stars@reservation.com
```

### Test Email Commands
```bash
# Test email system
docker-compose exec backend python manage.py test_email

# Test cancellation email
docker-compose exec backend python manage.py test_cancel_email --to stars@reservation.com

# Test reservation email
docker-compose exec backend python manage.py test_reservation
```

## Troubleshooting

### Login Issues
- Check if user exists in database
- Verify password is correct
- Check browser console for errors
- Verify backend is running on port 8000

### Database Issues
- Ensure PostgreSQL is running
- Check database connection settings
- Run migrations if needed
- Reset database if corrupted

### Email Issues
- Verify SMTP settings in .env file
- Check Gmail app password (not regular password)
- Test email connectivity
- Check Celery worker is running

## API Testing

### Authentication Endpoints
```bash
# Login
curl -X POST http://localhost:8000/api/auth/login/ \
  -H "Content-Type: application/json" \
  -d '{"email": "stars@reservation.com", "password": "test123"}'

# Get user info
curl -X GET http://localhost:8000/api/auth/me/ \
  -H "Authorization: Bearer YOUR_TOKEN_HERE"
```

### Business Endpoints
```bash
# List businesses (Super Admin only)
curl -X GET http://localhost:8000/api/businesses/ \
  -H "Authorization: Bearer YOUR_TOKEN_HERE"

# Create business
curl -X POST http://localhost:8000/api/businesses/ \
  -H "Authorization: Bearer YOUR_TOKEN_HERE" \
  -H "Content-Type: application/json" \
  -d '{"name": "Test Business", "subdomain": "testbiz", "email": "test@example.com"}'
```

## Environment Variables

### Required Environment Variables
```env
# Database
DB_NAME=reservation_db
DB_USER=postgres
DB_PASSWORD=password
DB_HOST=postgres
DB_PORT=5432

# Email
EMAIL_HOST_USER=your-email@gmail.com
EMAIL_HOST_PASSWORD=your-app-password
ADMIN_EMAIL=stars@reservation.com

# Redis
REDIS_URL=redis://redis:6379/0

# Django
DEBUG=1
SECRET_KEY=your-secret-key
```

This document provides all the necessary information for testing the multi-tenant SaaS reservation system with the appropriate credentials and setup procedures.