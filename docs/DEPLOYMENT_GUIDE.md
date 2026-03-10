# 🚀 Complete Deployment Guide - Reservo SaaS

## Overview

This guide covers deploying your multi-tenant reservation system with:
- **Frontend (React)** → Vercel (FREE)
- **Backend (Django)** → Railway (FREE tier)
- **Database (PostgreSQL)** → Railway (FREE tier)
- **Domain + Subdomains** → Your domain provider

**Total Monthly Cost: €0-5** (domain only, ~€10/year)

---

## 📦 What You'll Deploy

```
reservo.com                    → Frontend (Vercel)
├── /demo                      → Demo page
├── /login                     → Login page
├── /superadmin/dashboard      → Super admin panel
└── /business/dashboard        → Business owner panel

testsalon.reservo.com          → Public booking for Test Salon
barbershop.reservo.com         → Public booking for Barbershop
*.reservo.com                  → Any subdomain for any business

api.reservo.com                → Backend API (Railway)
```

---

## 1️⃣ BACKEND DEPLOYMENT (Railway)

### Why Railway?
- ✅ FREE $5/month credit (enough for small projects)
- ✅ PostgreSQL database included
- ✅ Automatic deployments from GitHub
- ✅ Built-in SSL
- ✅ Easy environment variables
- ✅ No credit card required for free tier

### Step 1: Sign Up for Railway

1. Go to https://railway.app
2. Click "Start a New Project"
3. Sign up with GitHub
4. Click "Deploy from GitHub repo"

### Step 2: Prepare Backend for Production

Create a `Procfile` in the backend folder:

```bash
# backend/Procfile
web: gunicorn backend.wsgi --bind 0.0.0.0:$PORT
```

Create a `runtime.txt` in the backend folder:

```bash
# backend/runtime.txt
python-3.11.0
```

Update `backend/backend/settings.py` for production:

```python
import os
import dj_database_url

# SECURITY WARNING: keep the secret key used in production secret!
SECRET_KEY = os.environ.get('SECRET_KEY', 'your-secret-key-here-change-in-production')

# SECURITY WARNING: don't run with debug turned on in production!
DEBUG = os.environ.get('DEBUG', 'False') == 'True'

ALLOWED_HOSTS = [
    'localhost',
    '127.0.0.1',
    '.railway.app',  # Railway domains
    'api.reservo.com',  # Your custom domain
    'reservo.com',
    '*.reservo.com',  # All subdomains
]

# Database - Use Railway PostgreSQL in production
if os.environ.get('DATABASE_URL'):
    DATABASES = {
        'default': dj_database_url.config(
            default=os.environ.get('DATABASE_URL'),
            conn_max_age=600
        )
    }
else:
    # Local development database
    DATABASES = {
        'default': {
            'ENGINE': 'django.db.backends.sqlite3',
            'NAME': BASE_DIR / 'db.sqlite3',
        }
    }

# CORS settings for production
CORS_ALLOWED_ORIGINS = [
    'http://localhost:3000',
    'https://reservo.com',
    'https://www.reservo.com',
    'https://vercel.app',  # Vercel preview deployments
]

CORS_ALLOW_ALL_ORIGINS = False  # Set to True only for testing
CORS_ALLOW_CREDENTIALS = True

# Static files (CSS, JavaScript, Images)
STATIC_URL = '/static/'
STATIC_ROOT = os.path.join(BASE_DIR, 'staticfiles')

# Media files (User uploads)
MEDIA_URL = '/media/'
MEDIA_ROOT = os.path.join(BASE_DIR, 'media')
```

### Step 3: Deploy to Railway

1. **Connect GitHub Repo:**
   - In Railway dashboard, click "New Project"
   - Select "Deploy from GitHub repo"
   - Choose your repository
   - Select the `backend` folder as root

2. **Add PostgreSQL Database:**
   - In your Railway project, click "New"
   - Select "Database" → "PostgreSQL"
   - Railway will automatically create `DATABASE_URL` variable

3. **Set Environment Variables:**
   Click "Variables" tab and add:

   ```bash
   SECRET_KEY=your-super-secret-key-here-generate-random-string
   DEBUG=False
   ALLOWED_HOSTS=.railway.app,api.reservo.com,reservo.com
   
   # Email (Gmail)
   EMAIL_HOST_USER=your-email@gmail.com
   EMAIL_HOST_PASSWORD=your-app-password
   
   # Twilio WhatsApp
   TWILIO_ACCOUNT_SID=your-twilio-sid
   TWILIO_AUTH_TOKEN=your-twilio-token
   TWILIO_WHATSAPP_NUMBER=whatsapp:+14155238886
   
   # Database (automatically created by Railway)
   DATABASE_URL=postgresql://... (auto-generated)
   ```

4. **Deploy:**
   - Railway will automatically deploy
   - Wait 2-3 minutes
   - You'll get a URL like: `https://your-app.railway.app`

5. **Run Migrations:**
   - In Railway dashboard, click "Settings" → "Deploy"
   - Add this to deploy command:
   ```bash
   python manage.py migrate && python manage.py collectstatic --noinput && gunicorn backend.wsgi
   ```

6. **Create Superuser:**
   - In Railway, go to "Settings" → "Variables"
   - Add a one-time command:
   ```bash
   python manage.py createsuperuser
   ```

### Step 4: Test Backend

Visit: `https://your-app.railway.app/api/health/`

You should see: `{"status": "healthy"}`

---

## 2️⃣ FRONTEND DEPLOYMENT (Vercel)

### Why Vercel?
- ✅ FREE forever (no credit card needed)
- ✅ Perfect for React
- ✅ Automatic deployments
- ✅ Custom domains + wildcard subdomains
- ✅ Global CDN

### Step 1: Sign Up for Vercel

1. Go to https://vercel.com
2. Click "Sign Up"
3. Sign up with GitHub
4. Click "Import Project"

### Step 2: Deploy Frontend

1. **Import Repository:**
   - Click "Import Git Repository"
   - Select your repo
   - Set root directory to `frontend`

2. **Configure Build Settings:**
   - Framework Preset: Create React App
   - Build Command: `npm run build`
   - Output Directory: `build`
   - Install Command: `npm install`

3. **Add Environment Variables:**
   Click "Environment Variables" and add:

   ```bash
   REACT_APP_API_URL=https://your-app.railway.app/api/
   ```

   Replace `your-app.railway.app` with your Railway backend URL.

4. **Deploy:**
   - Click "Deploy"
   - Wait 2-3 minutes
   - You'll get a URL like: `https://your-app.vercel.app`

### Step 3: Test Frontend

Visit: `https://your-app.vercel.app`

You should see your landing page!

---

## 3️⃣ DOMAIN + SUBDOMAINS SETUP

### Buy a Domain

**Recommended Providers:**
- **Namecheap** (~€10/year) - Cheapest
- **Cloudflare** (~€10/year) - Best DNS
- **GoDaddy** (~€15/year) - Popular

Let's say you buy: `reservo.com`

### Configure DNS Records

In your domain provider's DNS settings, add these records:

#### For Frontend (Vercel):

```
Type    Name    Value                           TTL
A       @       76.76.21.21                     Auto
CNAME   www     cname.vercel-dns.com            Auto
CNAME   *       cname.vercel-dns.com            Auto
```

**Explanation:**
- `@` → Main domain (reservo.com)
- `www` → www.reservo.com
- `*` → All subdomains (testsalon.reservo.com, etc.)

#### For Backend (Railway):

```
Type    Name    Value                           TTL
CNAME   api     your-app.railway.app            Auto
```

**Explanation:**
- `api` → api.reservo.com points to Railway backend

### Add Domain to Vercel

1. In Vercel dashboard, go to your project
2. Click "Settings" → "Domains"
3. Add these domains:
   - `reservo.com`
   - `www.reservo.com`
   - `*.reservo.com` (wildcard for all subdomains)

4. Vercel will verify DNS and issue SSL certificates (automatic)

### Add Domain to Railway

1. In Railway dashboard, go to your project
2. Click "Settings" → "Domains"
3. Add custom domain: `api.reservo.com`
4. Railway will verify and issue SSL certificate

### Wait for DNS Propagation

- DNS changes take 5 minutes to 48 hours
- Usually works in 10-30 minutes
- Check status: https://dnschecker.org

---

## 4️⃣ CONNECT EVERYTHING

### Update Backend CORS

In `backend/backend/settings.py`:

```python
CORS_ALLOWED_ORIGINS = [
    'https://reservo.com',
    'https://www.reservo.com',
    'https://*.reservo.com',  # All subdomains
]

ALLOWED_HOSTS = [
    'api.reservo.com',
    'reservo.com',
    '*.reservo.com',
    '.railway.app',
]
```

### Update Frontend API URL

In Vercel dashboard:
1. Go to "Settings" → "Environment Variables"
2. Update `REACT_APP_API_URL`:
   ```
   REACT_APP_API_URL=https://api.reservo.com/api/
   ```
3. Redeploy (Vercel will auto-redeploy)

### Test Full Flow

1. **Main Site:** https://reservo.com
   - Should show landing page
   - Click "Shiko Demo" → Should show demo

2. **Login:** https://reservo.com/login
   - Login as super admin
   - Should redirect to `/superadmin/dashboard`

3. **API:** https://api.reservo.com/api/health/
   - Should return `{"status": "healthy"}`

4. **Subdomain:** https://testsalon.reservo.com
   - Should show public booking page for Test Salon

---

## 5️⃣ SUBDOMAIN ROUTING (How It Works)

### Frontend Subdomain Detection

Your React app already has this code in `frontend/src/router/index.js`:

```javascript
const isSubdomain = () => {
  const host = window.location.hostname;
  const parts = host.split('.');
  return parts.length >= 3 && parts[0] !== 'www' && parts[0] !== 'localhost';
};

// If subdomain detected, show PublicBooking component
if (isSubdomain()) {
  return (
    <Routes>
      <Route path="/*" element={<PublicBooking />} />
    </Routes>
  );
}
```

### How Subdomains Work:

1. User visits: `testsalon.reservo.com`
2. DNS routes to Vercel (via wildcard `*` CNAME)
3. Vercel serves your React app
4. React detects subdomain: `testsalon`
5. React shows `PublicBooking` component
6. `PublicBooking` fetches business data from API: `/api/businesses/?subdomain=testsalon`
7. Shows booking form for that business

### Backend Subdomain API

Your backend already has this endpoint:

```python
# GET /api/businesses/?subdomain=testsalon
# Returns business data for "testsalon"
```

---

## 6️⃣ FINAL CHECKLIST

### Before Going Live:

- [ ] Backend deployed to Railway
- [ ] PostgreSQL database created
- [ ] Environment variables set (EMAIL, TWILIO, SECRET_KEY)
- [ ] Migrations run successfully
- [ ] Super admin user created
- [ ] Frontend deployed to Vercel
- [ ] Frontend environment variable set (REACT_APP_API_URL)
- [ ] Domain purchased
- [ ] DNS records configured (A, CNAME for @, www, *, api)
- [ ] Domain added to Vercel (reservo.com, www, *.reservo.com)
- [ ] Domain added to Railway (api.reservo.com)
- [ ] SSL certificates issued (automatic)
- [ ] CORS configured in backend
- [ ] Test main site (reservo.com)
- [ ] Test login and dashboards
- [ ] Test API (api.reservo.com/api/health/)
- [ ] Test subdomain (testsalon.reservo.com)
- [ ] Test email notifications
- [ ] Test WhatsApp notifications

---

## 7️⃣ COSTS BREAKDOWN

### FREE Tier (First 6 Months):

| Service | Cost | Limits |
|---------|------|--------|
| Vercel | FREE | Unlimited bandwidth, 100 GB-hours |
| Railway | FREE | $5/month credit (enough for 1-5 clients) |
| PostgreSQL | FREE | Included with Railway |
| Domain | €10/year | One-time annual cost |
| **TOTAL** | **€10/year** | **= €0.83/month** |

### Paid Tier (After Growth):

| Service | Cost | When Needed |
|---------|------|-------------|
| Vercel Pro | $20/month | 10+ team members |
| Railway | $5-20/month | 10+ clients, more traffic |
| Domain | €10/year | Always |
| **TOTAL** | **€25-40/month** | **When you have 20+ clients** |

---

## 8️⃣ MONITORING & MAINTENANCE

### Check Backend Health:
```bash
curl https://api.reservo.com/api/health/
```

### Check Database:
- Railway dashboard → Database → Metrics
- Monitor storage, connections, queries

### Check Frontend:
- Vercel dashboard → Analytics
- Monitor page views, load times

### Logs:
- **Backend:** Railway dashboard → Logs
- **Frontend:** Vercel dashboard → Logs
- **Database:** Railway dashboard → Database → Logs

---

## 9️⃣ TROUBLESHOOTING

### Frontend can't connect to Backend:

**Check:**
1. CORS settings in `backend/settings.py`
2. `REACT_APP_API_URL` in Vercel environment variables
3. Backend is running: `https://api.reservo.com/api/health/`

**Fix:**
```python
# backend/settings.py
CORS_ALLOWED_ORIGINS = [
    'https://reservo.com',
    'https://www.reservo.com',
]
CORS_ALLOW_CREDENTIALS = True
```

### Subdomain not working:

**Check:**
1. DNS wildcard CNAME: `* → cname.vercel-dns.com`
2. Domain added to Vercel: `*.reservo.com`
3. Wait 10-30 minutes for DNS propagation

**Test:**
```bash
nslookup testsalon.reservo.com
# Should return Vercel IP
```

### Database connection error:

**Check:**
1. `DATABASE_URL` environment variable in Railway
2. PostgreSQL service is running
3. Migrations completed

**Fix:**
```bash
# In Railway, run:
python manage.py migrate
```

### SSL certificate not issued:

**Check:**
1. DNS records are correct
2. Domain is verified in Vercel/Railway
3. Wait 5-10 minutes

**Vercel SSL:** Automatic (Let's Encrypt)
**Railway SSL:** Automatic (Let's Encrypt)

---

## 🎉 YOU'RE LIVE!

Your SaaS is now deployed:

- ✅ Main site: https://reservo.com
- ✅ Demo: https://reservo.com/demo
- ✅ Super admin: https://reservo.com/superadmin/dashboard
- ✅ API: https://api.reservo.com
- ✅ Subdomains: https://testsalon.reservo.com

**Next Steps:**
1. Create your first business in super admin panel
2. Test public booking on subdomain
3. Test email notifications
4. Test WhatsApp notifications
5. Share demo link with potential clients!

---

## 📞 Support

If you get stuck:
- Railway Docs: https://docs.railway.app
- Vercel Docs: https://vercel.com/docs
- Django Deployment: https://docs.djangoproject.com/en/4.2/howto/deployment/

Good luck! 🚀
