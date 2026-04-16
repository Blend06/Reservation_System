# 🗺️ Routing Structure - How Your SaaS Works

## Overview

Your SaaS has a smart routing system that handles:
1. **Main domain** → Demo landing page
2. **Subdomains** → Public booking for specific businesses
3. **Admin panels** → Role-based dashboards

---

## 🌐 Main Domain (reservo.com)

### What Users See:

```
reservo.com                    → Demo landing page (dark hero + dashboard preview)
├── /login                     → Login page
├── /terms                     → Terms of Service
├── /privacy                   → Privacy Policy
├── /superadmin/dashboard      → Super admin panel (you)
└── /business/dashboard        → Business owner panel (your clients)
```

### Why Demo as Main Page?

**Before:** Main page showed simple "Make a reservation / Login" buttons
**Now:** Main page shows impressive demo with:
- Dark animated hero section
- "A jeni gati për të dixhitalizuar biznesin tuaj?"
- Live dashboard preview with mock data
- Analytics charts
- Professional UI

**Result:** Better first impression for potential clients!

---

## 🏪 Subdomains (salon.reservo.com)

### How It Works:

1. **Client visits:** `salon.reservo.com`
2. **DNS routes to:** Vercel (via wildcard `*` CNAME)
3. **React detects:** Subdomain = "salon"
4. **React fetches:** Business data from API: `/api/businesses/?subdomain=salon`
5. **React shows:** Public booking page with actual business info

### What Customers See:

```
salon.reservo.com
├── Business logo (if uploaded)
├── Business name: "Salon XYZ" (NOT "Fade District")
├── Booking form
└── "View My Reservations" button
```

### Example Flow:

**Scenario:** You create a business called "Barber Shop Prishtina" with subdomain "barbershop"

**Customer visits:** `barbershop.reservo.com`

**They see:**
```
┌─────────────────────────────────────┐
│         [Business Logo]             │
│                                     │
│   Book at Barber Shop Prishtina    │
│                                     │
│   Schedule your appointment...      │
│                                     │
│   [Booking Form]                    │
│   - Name                            │
│   - Phone                           │
│   - Date & Time                     │
│   - Notes                           │
│                                     │
│   [Book Appointment]                │
└─────────────────────────────────────┘
```

**After booking:**
1. Customer sees success message
2. Business owner receives email notification
3. Reservation appears in business owner's dashboard
4. Business owner accepts/rejects
5. Customer receives WhatsApp notification

---

## 🔐 Authentication & Roles

### Super Admin (You):

**Login at:** `reservo.com/login`

**Redirects to:** `/superadmin/dashboard`

**Can access:**
- `/superadmin/dashboard` - Overview of all businesses
- `/superadmin/businesses` - Create/manage businesses
- `/superadmin/reservations` - View all reservations
- `/superadmin/settings` - System settings

**Cannot access:**
- `/business/dashboard` (business owner panel)

### Business Owner (Your Clients):

**Login at:** `reservo.com/login`

**Redirects to:** `/business/dashboard`

**Can access:**
- `/business/dashboard` - Their reservations and customers

**Cannot access:**
- `/superadmin/*` (super admin panels)

### Public (Customers):

**No login required**

**Can access:**
- `salon.reservo.com` - Book appointments
- View their reservations (by phone number)

**Cannot access:**
- Admin panels
- Other businesses' data

---

## 🎯 Subdomain Detection Logic

### Code (frontend/src/router/index.js):

```javascript
const isSubdomain = () => {
  const host = window.location.hostname;
  const parts = host.split('.');
  return parts.length >= 3 && parts[0] !== 'www' && parts[0] !== 'localhost';
};

// If subdomain detected, show PublicBooking
if (isSubdomain()) {
  return (
    <Routes>
      <Route path="/*" element={<PublicBooking />} />
    </Routes>
  );
}
```

### Examples:

| URL | Subdomain? | Shows |
|-----|-----------|-------|
| `reservo.com` | ❌ No | Demo landing page |
| `www.reservo.com` | ❌ No | Demo landing page |
| `salon.reservo.com` | ✅ Yes | Public booking for "salon" |
| `barbershop.reservo.com` | ✅ Yes | Public booking for "barbershop" |
| `localhost:3000` | ❌ No | Demo landing page |

---

## 📱 Public Booking Component

### Features:

1. **Fetches Business Data:**
   ```javascript
   const response = await api.get(`businesses/?subdomain=${subdomain}`);
   setBusiness(response.data[0]);
   ```

2. **Displays Business Info:**
   - Logo (if uploaded)
   - Business name
   - Custom branding

3. **Booking Form:**
   - Customer name
   - Phone number
   - Date & time picker
   - Special notes

4. **Reservation Lookup:**
   - Customers can view their reservations
   - Search by phone number
   - See status (pending/confirmed/canceled)

---

## 🔄 Complete User Journey

### For Customers:

1. **Discovery:**
   - Business owner shares: `salon.reservo.com`
   - Or QR code pointing to subdomain

2. **Booking:**
   - Visit subdomain
   - Fill booking form
   - Submit

3. **Confirmation:**
   - See success message
   - Business owner receives email
   - Wait for confirmation

4. **Notification:**
   - Business owner accepts/rejects
   - Customer receives WhatsApp message

5. **Check Status:**
   - Return to subdomain
   - Click "View My Reservations"
   - Enter phone number
   - See all reservations

### For Business Owners:

1. **Onboarding:**
   - You (super admin) create their business
   - Set subdomain (e.g., "salon")
   - Upload logo (optional)
   - Create owner account

2. **Share Link:**
   - Receive subdomain: `salon.reservo.com`
   - Share with customers (social media, QR code, etc.)

3. **Manage Reservations:**
   - Login at `reservo.com/login`
   - View dashboard at `/business/dashboard`
   - See pending reservations
   - Accept/reject with one click

4. **Notifications:**
   - Receive email when new reservation comes
   - Customer receives WhatsApp when you accept/reject

### For You (Super Admin):

1. **Create Businesses:**
   - Login at `reservo.com/login`
   - Go to `/superadmin/businesses`
   - Create new business with subdomain

2. **Monitor:**
   - View all businesses
   - View all reservations
   - System settings

3. **Support:**
   - Help business owners with issues
   - Manage subscriptions
   - View analytics

---

## 🎨 Branding Per Business

### What's Customizable:

1. **Subdomain:** `salon.reservo.com`, `barbershop.reservo.com`
2. **Business Name:** Shows in booking page header
3. **Logo:** Displays at top of booking page
4. **Colors:** (Future feature - can add custom theme colors)

### What's Shared:

1. **Domain:** All use `reservo.com`
2. **UI Design:** Same booking form layout
3. **Features:** Same functionality for all

---

## 🚀 Deployment Impact

### DNS Configuration:

```
Type    Name    Value                       Purpose
A       @       76.76.21.21                 Main domain (reservo.com)
CNAME   www     cname.vercel-dns.com        www.reservo.com
CNAME   *       cname.vercel-dns.com        All subdomains (*.reservo.com)
CNAME   api     your-app.railway.app        Backend API
```

### Result:

- ✅ `reservo.com` → Demo page
- ✅ `www.reservo.com` → Demo page
- ✅ `salon.reservo.com` → Public booking
- ✅ `barbershop.reservo.com` → Public booking
- ✅ `anything.reservo.com` → Public booking (if business exists)
- ✅ `api.reservo.com` → Backend API

---

## 📊 Traffic Flow

```
Customer
   ↓
salon.reservo.com (Vercel)
   ↓
React App detects subdomain "salon"
   ↓
Fetches business data: api.reservo.com/api/businesses/?subdomain=salon
   ↓
Shows PublicBooking component with "Salon XYZ" branding
   ↓
Customer books appointment
   ↓
POST to api.reservo.com/api/reservations/
   ↓
Backend creates reservation
   ↓
Backend sends email to business owner
   ↓
Business owner logs in at reservo.com/login
   ↓
Sees reservation in /business/dashboard
   ↓
Accepts reservation
   ↓
Backend sends WhatsApp to customer
```

---

## ✅ Summary

**Main Domain (reservo.com):**
- Shows demo landing page (impressive first impression)
- Login portal for admins and business owners
- Terms and privacy pages

**Subdomains (*.reservo.com):**
- Public booking pages
- Each business gets unique subdomain
- Shows actual business name and logo
- Customers book without login

**Result:**
- Professional multi-tenant SaaS
- Each client feels like they have their own site
- You manage everything from one super admin panel
- Customers have simple booking experience

Perfect for your 5-client freelance start! 🎉
