# Navigation and User Roles Documentation

## Overview
This document explains the user roles, navigation flow, and access control system in the Fade District reservation system.

## User Roles

### 1. Super Admin
- **Purpose**: System administrator who manages the entire SaaS platform
- **Access Level**: Full system access
- **Responsibilities**:
  - Create and manage businesses
  - Assign business owners to businesses
  - Monitor system-wide activity
  - Access all businesses' data

### 2. Business Owner
- **Purpose**: Individual business owner who manages their own business
- **Access Level**: Limited to their assigned business
- **Responsibilities**:
  - View and manage their business's reservations
  - Confirm/cancel reservations from customers
  - Monitor their business dashboard
  - Access their business's customer data

### 3. End Customers (No Login Required)
- **Purpose**: People who make reservations at businesses
- **Access Level**: Public booking interface only
- **Responsibilities**:
  - Make reservations through public booking forms
  - No login or account creation required

## Navigation Flow

### Root Path (`/`)
- **Unauthenticated Users**: Shows landing page with login/register options
- **Authenticated Users**: Automatically redirects based on role:
  - Super Admin → `/superadmin/dashboard`
  - Business Owner → `/business/dashboard`

### Login Process
1. User enters credentials at `/login`
2. System validates credentials and determines user role
3. Automatic redirection based on role:
   - `is_super_admin: true` → `/superadmin/dashboard`
   - `is_business_owner: true` → `/business/dashboard`

## Route Structure

### Super Admin Routes
```
/superadmin/dashboard        → Main super admin dashboard
/superadmin                  → Redirects to /superadmin/dashboard
/superadmin/businesses       → Business management interface
```

### Business Owner Routes
```
/business/dashboard          → Main business owner dashboard
/business                    → Redirects to /business/dashboard
```

### Public Routes
```
/login                       → Login page
/register                    → Registration page (for business owners)
/book/:subdomain             → Public booking interface for specific business
/                           → Landing page or role-based redirect
```

### Legacy Routes (Redirects)
```
/dashboard                   → Redirects to appropriate dashboard based on role
/homepage                    → Legacy route (still accessible)
```

## Access Control (ProtectedRoute)

### Route Protection Logic
1. **Authentication Check**: User must be logged in
2. **Role-Based Access**:
   - `superAdminOnly`: Only super admins can access
   - `businessOwnerOnly`: Only business owners can access
   - `adminOnly`: General admin access (includes super admins)

### Cross-Role Protection
- Super admins trying to access business routes → Redirected to `/superadmin/dashboard`
- Business owners trying to access super admin routes → Redirected to `/business/dashboard`
- Unauthenticated users → Redirected to `/login`

## User Properties

### API Response Fields
```json
{
  "id": "uuid",
  "email": "user@example.com",
  "first_name": "John",
  "last_name": "Doe",
  "user_type": "business_owner",
  "is_super_admin": false,
  "is_business_owner": true,
  "is_admin": false,
  "business": "business-uuid",
  "business_details": {
    "id": "business-uuid",
    "name": "Business Name",
    "subdomain": "businessname"
  }
}
```

### Role Determination
- `user_type`: String field ("super_admin" or "business_owner")
- `is_super_admin`: Boolean property for super admin access
- `is_business_owner`: Boolean property for business owner access
- `is_admin`: Boolean property for general admin access

## Business Assignment

### Super Admin
- `business`: null (not assigned to any specific business)
- `business_details`: null
- Can access all businesses through the system

### Business Owner
- `business`: UUID of assigned business
- `business_details`: Object with business information
- Can only access their assigned business data

## Dashboard Features

### Super Admin Dashboard (`/superadmin/dashboard`)
- System-wide statistics
- Business management
- User management
- Global reservation overview

### Business Owner Dashboard (`/business/dashboard`)
- Business-specific reservation management
- Customer reservation list
- Reservation status updates (pending → confirmed/canceled)
- Business statistics and analytics
- Public booking link for customers

## Security Considerations

### Authentication
- JWT-based authentication
- Token stored in localStorage
- Automatic token refresh
- Secure API endpoints

### Authorization
- Role-based access control
- Route-level protection
- API endpoint permissions
- Business data isolation

### Data Isolation
- Business owners can only see their business data
- Super admins have system-wide access
- Customers don't need accounts (privacy-focused)

## Error Handling

### Invalid Access Attempts
- Wrong role accessing protected route → Redirect to appropriate dashboard
- Unauthenticated access → Redirect to login
- Invalid business assignment → Redirect to login

### Navigation Failures
- Fallback redirects to appropriate dashboard
- Error logging for debugging
- User-friendly error messages

## Future Enhancements

### Planned Features
- Multi-business support for business owners
- Staff user roles within businesses
- Customer account system (optional)
- Advanced permission granularity
- Business-specific branding and customization