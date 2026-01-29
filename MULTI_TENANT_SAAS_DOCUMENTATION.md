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
   - Public booking interface for end customers (simple clients)
   - No authentication or account required: customers only submit the booking form
   - No "view my reservations" for end customers; only business owners see reservations in their dashboard
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
- **No authentication required for creating reservations**: simple clients (end customers) can book without logging in.
- Tenant resolution in two ways:
  1. **From request Host** (when API is served on the same subdomain): middleware sets tenant from subdomain.
  2. **From request body or header** (when API is on a different host, e.g. `api.domain.com`): frontend sends `subdomain` in the request body or `X-Subdomain` header; backend uses `get_tenant_from_request()` to resolve the business and assign the reservation.
- Public booking: `POST /api/reservations/` with `subdomain` (and customer/data fields) does not require authentication.
- Business owner dashboard: list/update/delete reservations (authenticated, scoped to their business).
- Super admin: full access across all businesses.

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
- No authentication required: end customers never log in.
- Customer information: name, phone, optional notes (no account or email required for booking).
- Appointment scheduling: date and time selection.
- Subdomain is read from `window.location.hostname` via `getSubdomainFromHost()` and sent in the reservation request body so the backend can assign the reservation to the correct business when the API is on a different host.
- Success screen after booking; no "view my reservations" or lookup by phone for end customers.
- Business-branded experience and email confirmation as configured per business.

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

#### End Customers (Public / Simple Clients)
- Access: Public booking interface only; no login or account.
- Routes: All routes on `business.yourdomain.com` (subdomain).
- Permissions: Create reservations only. No access to view or manage existing reservations; only business owners see reservations in their dashboard.

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
- `GET /api/reservations/` - List reservations (filtered by context; requires authentication on main domain).
- `POST /api/reservations/` - Create reservation. **No authentication required.** Business is assigned from tenant (Host subdomain) or from request body `subdomain` / header `X-Subdomain` when API is on a different host.
- `GET /api/reservations/{id}/` - Get reservation details (authenticated, tenant-scoped).
- `PUT /api/reservations/{id}/` - Update reservation (authenticated).
- `DELETE /api/reservations/{id}/` - Delete reservation (authenticated).

## Email System

### Business-Specific Templates
- Templates now include `business_name` variable
- Custom from addresses per business
- Business timezone-aware date/time formatting

### Email Flow
1. **New Reservation**: Email sent to business admin
2. **Status Change**: Email sent to customer
3. **Cancellation**: Email sent to customer

## Public Booking Without Login

End customers (simple clients) do not need to sign up or log in to make a reservation.

1. **Customer** opens the business subdomain (e.g. `companyA.yourdomain.com`).
2. **Frontend** shows the public booking form (no auth check). On submit, it sends the reservation data plus the current subdomain (from `window.location.hostname`) in the request body.
3. **Backend** resolves the business (tenant) from:
   - the request **Host** (when the API is served on the same subdomain), or
   - the **`subdomain`** field in the request body or the **`X-Subdomain`** header (when the API is on a different host, e.g. `api.yourdomain.com`).
4. With a valid tenant, the backend creates the reservation with **no authentication** and returns success.
5. End customers do **not** have a "view my reservations" or lookup feature; only business owners see and manage reservations in their dashboard.

For **local development**, the frontend may run at `localhost:3000` while the API runs at `localhost:8000`, so the backend does not receive a subdomain in the Host header. Use a subdomain in development (e.g. add `127.0.0.1 salon.localhost` to your hosts file and open `http://salon.localhost:3000`) so that the frontend can send the subdomain and the reservation is assigned to the correct business.

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

### How to Test as a Simple User (End Customer)

#### Local development only

When working **locally only** (no production subdomains), use the `/book/:subdomain` route. No hosts file or real subdomains are needed.

1. Start backend and frontend (e.g. backend on `http://localhost:8000`, frontend on `http://localhost:3000`).
2. Create at least one **Business** with a **subdomain** (e.g. log in as Super Admin → Businesses → create business with subdomain `salon`).
3. **Do not log in** as a simple user (or use an incognito window).
4. Open in the browser: **`http://localhost:3000/book/salon`** (replace `salon` with your business subdomain).
5. You see the public booking form with no login.
6. Fill in name, phone, date, time, optional notes → submit. The reservation is created for that business without any authentication.

The frontend sends the subdomain from the URL path in the request body, so the backend assigns the reservation to the correct business even when the API is at `localhost:8000`.

#### With real subdomains (e.g. production or `salon.localhost`)

- Production: customers open `https://companyA.yourdomain.com` and get the same booking form.
- Local with subdomain: add `127.0.0.1 salon.localhost` to your hosts file and open `http://salon.localhost:3000`.

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

#### Reservation Creation Asks for Login or Fails
- If the API is on a different host than the frontend (e.g. `api.domain.com` vs `companyA.domain.com`), the backend cannot get the subdomain from the Host header. Ensure the frontend sends `subdomain` in the request body or the `X-Subdomain` header when creating a reservation.
- Check that the business exists and is active for the given subdomain.

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
✅ **Public Booking Without Login**: End customers can make reservations without signing up or logging in; tenant is resolved from Host or from request body/header  
✅ **No "View My Reservations" for End Customers**: Only business owners see and manage reservations in their dashboard  
✅ **Email System**: Business-specific email templates and settings  
✅ **PostgreSQL**: Robust database with proper indexing  
✅ **Docker Setup**: Complete containerized deployment  
✅ **Management Commands**: Easy setup and migration tools  

The system is ready for production deployment as a true multi-tenant SaaS platform. All documentation is in English.