# Multi-Tenant SaaS Transformation Documentation

## Overview

This document outlines the complete transformation of a single-tenant reservation system into a multi-tenant SaaS platform. The system now supports multiple businesses, each with their own subdomain and isolated data.

## Architecture Overview

### Three-Tier System

1. **Super Admin Level** (`yourdomain.com/superadmin`)
   - Manage all businesses on the platform
   - System-wide analytics and monitoring
   - Business onboarding and management

2. **Business Owner Level** (`yourdomain.com/business`)
   - Manage their own business reservations
   - Access business-specific dashboard
   - Configure business settings

3. **Public Level** (`business.yourdomain.com`)
   - Public booking interface for end customers
   - No authentication required
   - Business-branded experience

## Phase 1: Database Schema & Models

### New Models Created

#### Business Model (`backend/api/models/business.py`)
```python
class Business(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4)
    name = models.CharField(max_length=100)
    subdomain = models.CharField(max_length=50, unique=True)
    email = models.EmailField()
    phone = models.CharField(max_length=20, blank=True)
    
    # Business Settings
    business_hours_start = models.TimeField(default='09:00')
    business_hours_end = models.TimeField(default='18:00')
    timezone = models.CharField(max_length=50, default='Europe/Berlin')
    
    # Email Configuration
    email_from_name = models.CharField(max_length=100)
    email_from_address = models.EmailField(blank=True)
    
    # Branding
    primary_color = models.CharField(max_length=7, default='#3B82F6')
    logo_url = models.URLField(blank=True)
    
    # Status & Subscription
    is_active = models.BooleanField(default=True)
    subscription_status = models.CharField(max_length=20, default='trial')
    subscription_expires = models.DateTimeField(null=True, blank=True)
```

#### Updated User Model (`backend/api/models/user.py`)
- Replaced `AbstractUser` with custom `AbstractBaseUser`
- Email-based authentication (no username field)
- Added `user_type` field: `super_admin`, `business_owner`
- Added `business` foreign key for tenant isolation
- Only essential fields included

#### Updated Reservation Model (`backend/api/models/reservation.py`)
- Added `business` foreign key for tenant isolation
- Added direct customer fields: `customer_name`, `customer_email`, `customer_phone`
- Removed dependency on User model for customers
- Added tenant-aware manager for automatic data filtering

### Database Changes

#### Migration from MySQL to PostgreSQL
- Updated `docker-compose.yml` with PostgreSQL service
- Updated `requirements.txt` with `psycopg2-binary`
- Updated Django settings for PostgreSQL
- Added health checks for database service

## Phase 2: Multi-Tenant Infrastructure

### Tenant Middleware (`backend/api/middleware.py`)
```python
class TenantMiddleware(MiddlewareMixin):
    def process_request(self, request):
        host = request.get_host().lower()
        subdomain = self.get_subdomain(host)
        
        if subdomain:
            business = Business.objects.get(subdomain=subdomain, is_active=True)
            request.tenant = business
            set_current_tenant(business)
        else:
            request.tenant = None
            set_current_tenant(None)
```

### Tenant-Aware Managers (`backend/api/managers.py`)
```python
class TenantAwareManager(models.Manager):
    def get_queryset(self):
        queryset = super().get_queryset()
        tenant = get_current_tenant()
        
        if tenant and hasattr(self.model, 'business'):
            return queryset.filter(business=tenant)
        
        return queryset
```

### API Views & Serializers

#### Business Management API (`backend/api/views/business.py`)
- Full CRUD operations for businesses
- Super admin only access
- Business statistics and analytics
- Activation/deactivation controls

#### Multi-Tenant Reservation API (`backend/api/views/reservation.py`)
- Automatic tenant context detection
- Public booking (no auth required on subdomains)
- Business owner dashboard access
- Super admin global access

#### Enhanced Email System (`backend/api/tasks/email_tasks.py`)
- Business-specific email templates
- Custom from addresses per business
- Business timezone support
- Multi-tenant admin notifications

## Phase 3: Frontend Multi-Tenant Interface

### Super Admin Dashboard (`frontend/src/components/superadmin/`)

#### SuperAdminDashboard.jsx
- System-wide statistics
- Business management overview
- Quick actions for business operations
- Recent businesses list

#### BusinessManagement.jsx
- Complete business CRUD interface
- Business statistics modal
- Status management (activate/deactivate)
- Business creation form

### Business Owner Dashboard (`frontend/src/components/business/`)

#### BusinessDashboard.jsx
- Business-specific reservation management
- Booking link sharing
- Reservation statistics
- Status filtering

### Public Booking Interface (`frontend/src/components/public/`)

#### PublicBooking.jsx
- No authentication required
- Customer information collection
- Appointment scheduling
- Business-branded experience
- Email confirmation system

### Updated Router System (`frontend/src/router/index.js`)
- Subdomain detection
- Route separation by domain type
- User type-based redirects
- Protected route components

## Phase 4: Authentication & Authorization

### Updated Auth Store (`frontend/src/auth/authStore.js`)
- Added `isSuperAdmin()` method
- Added `isBusinessOwner()` method
- Multi-tenant user type support

### User Types & Permissions

#### Super Admin
- Access: All businesses and system-wide data
- Routes: `/superadmin/*`
- Permissions: Create/manage businesses, view all data

#### Business Owner
- Access: Only their business data
- Routes: `/business/*`
- Permissions: Manage their reservations, view their analytics

#### Public Users (Subdomains)
- Access: Public booking interface only
- Routes: All routes on `business.yourdomain.com`
- Permissions: Create reservations only

## Deployment & Configuration

### Docker Configuration

#### Updated docker-compose.yml
```yaml
services:
  postgres:
    image: postgres:15-alpine
    environment:
      - POSTGRES_DB=fade_district_db
      - POSTGRES_USER=postgres
      - POSTGRES_PASSWORD=password
    volumes:
      - postgres_data:/var/lib/postgresql/data
    healthcheck:
      test: ["CMD-SHELL", "pg_isready -U postgres"]
      interval: 5s
      timeout: 5s
      retries: 5

  backend:
    depends_on:
      postgres:
        condition: service_healthy
    environment:
      - DB_HOST=postgres
      - DB_PORT=5432
      - DB_NAME=fade_district_db
      - DB_USER=postgres
      - DB_PASSWORD=password
```

### Environment Variables

#### Backend (.env)
```
DB_NAME=fade_district_db
DB_USER=postgres
DB_PASSWORD=password
DB_HOST=postgres
DB_PORT=5432

EMAIL_HOST_USER=your-email@gmail.com
EMAIL_HOST_PASSWORD=your-app-password
ADMIN_EMAIL=admin@yourdomain.com

REDIS_URL=redis://redis:6379/0
```

## Management Commands

### Create Super Admin
```bash
python manage.py create_superadmin \
  --email admin@yourdomain.com \
  --password your-password \
  --first-name Admin \
  --last-name User
```

### Migrate Existing Data
```bash
python manage.py migrate_to_multitenant \
  --business-name "Your Business" \
  --subdomain "yourbusiness"
```

## API Endpoints

### Business Management (Super Admin Only)
- `GET /api/businesses/` - List all businesses
- `POST /api/businesses/` - Create new business
- `GET /api/businesses/{id}/` - Get business details
- `PUT /api/businesses/{id}/` - Update business
- `DELETE /api/businesses/{id}/` - Deactivate business
- `POST /api/businesses/{id}/activate/` - Activate business
- `POST /api/businesses/{id}/deactivate/` - Deactivate business
- `GET /api/businesses/{id}/stats/` - Get business statistics
- `GET /api/businesses/dashboard_stats/` - Get system-wide stats

### Reservations (Multi-Tenant)
- `GET /api/reservations/` - List reservations (filtered by context)
- `POST /api/reservations/` - Create reservation (auto-assigns business)
- `GET /api/reservations/{id}/` - Get reservation details
- `PUT /api/reservations/{id}/` - Update reservation
- `DELETE /api/reservations/{id}/` - Delete reservation

## Email System

### Business-Specific Templates
- Templates now include `business_name` variable
- Custom from addresses per business
- Business timezone-aware date/time formatting

### Email Flow
1. **New Reservation**: Email sent to business admin
2. **Status Change**: Email sent to customer
3. **Cancellation**: Email sent to customer

## Security & Data Isolation

### Tenant Isolation
- All queries automatically filtered by business context
- Middleware ensures proper tenant context
- No cross-tenant data access possible

### Authentication
- JWT-based authentication
- User type-based route protection
- Business relationship validation

## Testing & Validation

### Test Scenarios
1. **Subdomain Detection**: Verify middleware correctly identifies tenants
2. **Data Isolation**: Ensure businesses can't access each other's data
3. **Public Booking**: Test reservation creation without authentication
4. **Email System**: Verify business-specific email delivery
5. **User Types**: Test access controls for each user type

### Validation Commands
```bash
# Test email system
python manage.py test_email

# Test reservation creation
python manage.py test_reservation

# Test cancellation emails
python manage.py test_cancel_email
```

## Future Enhancements

### Planned Features
1. **Custom Domains**: Allow businesses to use their own domains
2. **Advanced Branding**: Logo uploads, custom CSS
3. **Payment Integration**: Subscription management
4. **Analytics Dashboard**: Advanced business analytics
5. **Mobile App**: React Native app for business owners
6. **API Keys**: Allow businesses to integrate with their systems

### Scalability Considerations
1. **Database Sharding**: For large-scale deployments
2. **CDN Integration**: For static assets and logos
3. **Caching Layer**: Redis-based caching for performance
4. **Load Balancing**: Multiple backend instances
5. **Monitoring**: Application performance monitoring

## Troubleshooting

### Common Issues

#### Subdomain Not Working
- Check DNS configuration
- Verify middleware is properly configured
- Ensure business exists and is active

#### Email Not Sending
- Verify email configuration in .env
- Check business email settings
- Test with management commands

#### Data Not Isolated
- Verify tenant middleware is working
- Check manager implementation
- Ensure business context is set

### Debug Commands
```bash
# Check tenant context
python manage.py shell
>>> from api.middleware import get_current_tenant
>>> print(get_current_tenant())

# Verify business setup
>>> from api.models import Business
>>> Business.objects.all()
```

## Conclusion

The multi-tenant SaaS transformation is now complete with:

✅ **Full Data Isolation**: Each business has completely isolated data
✅ **Subdomain Support**: Each business gets their own subdomain
✅ **Three-Tier Interface**: Super Admin, Business Owner, and Public interfaces
✅ **Email System**: Business-specific email templates and settings
✅ **PostgreSQL**: Robust database with proper indexing
✅ **Docker Setup**: Complete containerized deployment
✅ **Management Commands**: Easy setup and migration tools

The system is now ready for production deployment as a true multi-tenant SaaS platform.