# Business Owner Account Setup

## Overview

When creating a new business from the Super Admin dashboard, you must also create the business owner account. This ensures each business has an owner who can log in and manage their business.

## Creating a Business with Owner Account

### From Super Admin Dashboard

1. Navigate to **Business Management** (`/superadmin/businesses`)
2. Click **Create Business** button
3. Fill in the form with two sections:

### Section 1: Business Owner Account

These fields create the login account for the business owner:

- **Owner Email*** - The email address the owner will use to log in
- **Owner Password*** - The password for the owner account (minimum 8 characters)
- **First Name*** - Owner's first name
- **Last Name*** - Owner's last name

### Section 2: Business Information

These fields configure the business settings:

- **Business Name*** - The name of the business
- **Subdomain*** - Unique subdomain (e.g., "salon" becomes "salon.yourdomain.com")
- **Email*** - Business contact email
- **Phone** - Business phone number
- **Opening Time** - Business hours start (default: 09:00)
- **Closing Time** - Business hours end (default: 18:00)
- **Timezone** - Business timezone (default: Europe/Berlin)
- **Email From Name** - Name shown in outgoing emails
- **Email From Address** - Optional custom email address for outgoing emails
- **Primary Color** - Brand color for the business (default: #3B82F6)
- **Logo URL** - Optional URL to business logo image

## What Happens When You Create a Business

1. **Business is created** in the database with all the provided information
2. **Owner account is automatically created** with:
   - Email: The owner_email you provided
   - Password: The owner_password you provided (securely hashed)
   - User Type: `business_owner`
   - Linked to the business
3. **Owner can immediately log in** using their email and password
4. **Owner sees their business dashboard** at `/business/dashboard`

## Owner Login Process

After creating the business:

1. Owner goes to http://localhost:3000/login
2. Enters their email (the owner_email from creation)
3. Enters their password (the owner_password from creation)
4. Gets redirected to their business dashboard

## Important Notes

- **Owner Email must be unique** - Cannot use an email that's already registered
- **Password minimum length is 8 characters** - For security
- **Subdomain must be unique** - Each business needs a unique subdomain
- **Owner is automatically linked to the business** - No manual linking required
- **Owner has full access** to their business dashboard and settings

## Example

Creating a salon business:

**Business Owner Account:**
- Owner Email: john@example.com
- Owner Password: SecurePass123
- First Name: John
- Last Name: Doe

**Business Information:**
- Business Name: John's Hair Salon
- Subdomain: johnssalon
- Email: contact@johnssalon.com
- Phone: +1234567890
- Opening Time: 09:00
- Closing Time: 18:00
- Timezone: Europe/Berlin

**Result:**
- Business "John's Hair Salon" is created
- Subdomain: johnssalon.yourdomain.com
- Owner account created for john@example.com
- John can log in with john@example.com / SecurePass123
- John sees his business dashboard with all features

## Security

- Passwords are **securely hashed** using Django's password hashing
- Passwords are **never stored in plain text**
- Owner passwords can be **reset** if forgotten (future feature)
- Only **super admins** can create businesses
- Business owners **cannot see other businesses**

## Troubleshooting

### "Email already exists"
- The owner email is already registered
- Use a different email address

### "Subdomain already taken"
- Another business is using that subdomain
- Choose a different subdomain

### "Password too short"
- Password must be at least 8 characters
- Use a longer password

### Owner can't log in
- Verify the email and password are correct
- Check if the business is active (is_active = True)
- Check if the owner account was created successfully

## API Endpoint

**POST** `/api/businesses/`

**Request Body:**
```json
{
  "name": "John's Hair Salon",
  "subdomain": "johnssalon",
  "email": "contact@johnssalon.com",
  "phone": "+1234567890",
  "business_hours_start": "09:00",
  "business_hours_end": "18:00",
  "timezone": "Europe/Berlin",
  "email_from_name": "John's Hair Salon",
  "email_from_address": "",
  "primary_color": "#3B82F6",
  "logo_url": "",
  "owner_email": "john@example.com",
  "owner_password": "SecurePass123",
  "owner_first_name": "John",
  "owner_last_name": "Doe"
}
```

**Response:**
```json
{
  "id": "uuid",
  "name": "John's Hair Salon",
  "subdomain": "johnssalon",
  "full_domain": "johnssalon.yourdomain.com",
  "email": "contact@johnssalon.com",
  "is_active": true,
  ...
}
```

---

**Last Updated**: February 14, 2026
**Status**: ✅ Implemented and Ready to Use
