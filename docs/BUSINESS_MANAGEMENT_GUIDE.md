# Business Management Guide

## Complete CRUD Operations

The Super Admin Dashboard now has full CRUD (Create, Read, Update, Delete) functionality for managing businesses. Here's what each operation does:

### 1. CREATE Business
- **Access**: Click "Create Business" button in BusinessManagement component
- **Features**: 
  - Complete form with all business details
  - Real-time subdomain preview (shows `subdomain.yourdomain.com`)
  - Color picker for primary brand color
  - Logo URL with live preview
  - Validation for unique subdomains

### 2. READ/VIEW Businesses
- **Access**: Navigate to `/superadmin/businesses`
- **Features**:
  - Comprehensive table with all business data
  - Sortable columns
  - Business stats (user count, reservation count)
  - Status indicators (Active/Inactive, Subscription status)
  - Visual brand elements (color swatches, logo links)

### 3. UPDATE/EDIT Business
- **Access**: Click "Edit" button in any business row
- **Features**:
  - Pre-populated form with current business data
  - Same validation as create form
  - Instant updates to the business table
  - Preserves existing data while allowing modifications

### 4. DELETE Business
- **Access**: Click "Delete" button in any business row
- **Features**:
  - Confirmation modal with detailed warning
  - Lists all data that will be permanently deleted:
    - All business users and accounts
    - All reservations and booking history
    - All business settings and customizations
    - Subdomain becomes available again
  - Cannot be undone (permanent deletion)

## Logo URL Feature Explained

### What is Logo URL?
The Logo URL is a direct link to a business's logo image hosted on the internet. This allows businesses to display their brand logo throughout the booking interface.

### How it works:
1. **Input**: Business owner or super admin enters a direct URL to an image file
   - Example: `https://example.com/images/business-logo.png`
   - Supported formats: PNG, JPG, JPEG, GIF, SVG

2. **Preview**: The form shows a live preview of the logo as you type the URL
   - If the URL is invalid or image fails to load, preview is hidden
   - Preview is sized to 48px height to show how it will appear

3. **Usage**: The logo appears in:
   - Business management table (as a clickable "Logo" link)
   - Public booking interface (customer-facing)
   - Business dashboard header
   - Email templates (if configured)

### Best Practices for Logo URLs:
- **Use HTTPS**: Always use secure URLs (`https://` not `http://`)
- **Direct image links**: URL should point directly to the image file, not a webpage
- **Reliable hosting**: Use stable image hosting services (not temporary links)
- **Appropriate size**: Recommend 200x200px or similar square format
- **File formats**: PNG with transparency works best for logos

### Example Logo URLs:
```
✅ Good: https://cdn.example.com/logos/business-logo.png
✅ Good: https://images.unsplash.com/photo-123456789/logo.jpg
❌ Bad: https://example.com/about-us (webpage, not image)
❌ Bad: http://unsecure-site.com/logo.png (not HTTPS)
```

## Navigation Flow

### Super Admin Dashboard Buttons:
1. **"My clients (businesses)"** → `/superadmin/businesses` (BusinessManagement)
2. **"Add new client (business)"** → `/superadmin/businesses` (opens create modal)
3. **"View all reservations"** → `/superadmin/reservations` (ReservationsManagement)
4. **"System settings"** → `/superadmin/settings` (SystemSettings)

### BusinessManagement Actions:
- **Stats**: View detailed business statistics (users, reservations, activity)
- **Edit**: Modify business information and settings
- **Activate/Deactivate**: Toggle business status (affects public booking availability)
- **Delete**: Permanently remove business and all associated data

## Technical Implementation

### Components Created:
- `BusinessManagement.jsx` - Main CRUD interface
- `ReservationsManagement.jsx` - View all reservations across businesses
- `SystemSettings.jsx` - Global platform configuration

### API Endpoints Used:
- `GET /api/businesses/` - List all businesses
- `POST /api/businesses/` - Create new business
- `PUT /api/businesses/{id}/` - Update business
- `DELETE /api/businesses/{id}/` - Delete business
- `POST /api/businesses/{id}/activate/` - Activate business
- `POST /api/businesses/{id}/deactivate/` - Deactivate business
- `GET /api/businesses/{id}/stats/` - Get business statistics

### Routes Added:
- `/superadmin/businesses` - Business management interface
- `/superadmin/reservations` - All reservations view
- `/superadmin/settings` - System settings

## Security Features

### Access Control:
- Only super admins can access business management
- Authentication required for all operations
- Role-based route protection

### Data Validation:
- Subdomain uniqueness checking
- Email format validation
- URL format validation for logos
- Required field validation

### Confirmation Dialogs:
- Delete operations require explicit confirmation
- Clear warnings about permanent data loss
- Cancel options for all destructive actions

This completes the full CRUD functionality for business management in your multi-tenant SaaS platform!