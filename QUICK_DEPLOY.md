# 🚀 Quick Deploy Guide - 15 Minutes

Follow these steps to deploy your SaaS in 15 minutes.

---

## ✅ Prerequisites

- GitHub account
- Railway account (sign up with GitHub)
- Vercel account (sign up with GitHub)
- Domain (optional, can use free .vercel.app domain)

---

## 📦 Step 1: Push to GitHub (2 minutes)

```bash
# Initialize git (if not already done)
git init
git add .
git commit -m "Initial commit - Ready for deployment"

# Create repo on GitHub, then:
git remote add origin https://github.com/YOUR_USERNAME/YOUR_REPO.git
git branch -M main
git push -u origin main
```

---

## 🚂 Step 2: Deploy Backend to Railway (5 minutes)

### A. Create Project

1. Go to https://railway.app
2. Click "New Project"
3. Select "Deploy from GitHub repo"
4. Choose your repository
5. Railway will detect Django automatically

### B. Add PostgreSQL Database

1. In your project, click "New"
2. Select "Database" → "PostgreSQL"
3. Railway automatically creates `DATABASE_URL` variable

### C. Set Environment Variables

Click "Variables" tab and add:

```bash
# Required
SECRET_KEY=your-random-secret-key-here-generate-50-chars
DEBUG=False
FRONTEND_URL=https://your-app.vercel.app

# Email (Gmail)
EMAIL_HOST_USER=your-email@gmail.com
EMAIL_HOST_PASSWORD=your-gmail-app-password

# Twilio WhatsApp
TWILIO_ACCOUNT_SID=your-twilio-sid
TWILIO_AUTH_TOKEN=your-twilio-token
TWILIO_WHATSAPP_NUMBER=whatsapp:+14155238886

# Optional
CUSTOM_DOMAIN=reservo.com
```

### D. Deploy

1. Railway will automatically deploy
2. Wait 2-3 minutes
3. Copy your Railway URL: `https://your-app.railway.app`

### E. Create Super Admin

1. In Railway, click your service
2. Go to "Settings" → "Variables"
3. Click "Raw Editor" and add:
   ```bash
   DJANGO_SUPERUSER_USERNAME=admin
   DJANGO_SUPERUSER_EMAIL=admin@example.com
   DJANGO_SUPERUSER_PASSWORD=your-secure-password
   ```
4. In "Settings" → "Deploy", add to start command:
   ```bash
   python manage.py createsuperuser --noinput || true && python manage.py migrate && gunicorn backend.wsgi
   ```

---

## ⚡ Step 3: Deploy Frontend to Vercel (5 minutes)

### A. Import Project

1. Go to https://vercel.com
2. Click "Add New" → "Project"
3. Import your GitHub repository
4. Set "Root Directory" to `frontend`

### B. Configure Build

Vercel auto-detects Create React App:
- Framework: Create React App
- Build Command: `npm run build`
- Output Directory: `build`

### C. Add Environment Variable

Click "Environment Variables":

```bash
REACT_APP_API_URL=https://your-app.railway.app/api/
```

Replace `your-app.railway.app` with your Railway URL from Step 2.

### D. Deploy

1. Click "Deploy"
2. Wait 2-3 minutes
3. Copy your Vercel URL: `https://your-app.vercel.app`

---

## 🌐 Step 4: Update Backend CORS (2 minutes)

### A. Update Railway Environment Variables

Go back to Railway → Variables and update:

```bash
FRONTEND_URL=https://your-app.vercel.app
```

Replace with your actual Vercel URL.

### B. Redeploy

Railway will automatically redeploy with new CORS settings.

---

## ✅ Step 5: Test Everything (1 minute)

### Test Backend:
```bash
curl https://your-app.railway.app/api/health/
# Should return: {"status": "healthy"}
```

### Test Frontend:
1. Visit: `https://your-app.vercel.app`
2. Should see landing page
3. Click "Shiko Demo" → Should show demo dashboard

### Test Login:
1. Go to: `https://your-app.vercel.app/login`
2. Login with super admin credentials
3. Should redirect to `/superadmin/dashboard`

### Test API Connection:
1. In super admin dashboard, try creating a business
2. Should work without CORS errors

---

## 🎉 YOU'RE LIVE!

Your SaaS is now deployed:

- **Frontend:** https://your-app.vercel.app
- **Backend:** https://your-app.railway.app
- **Database:** PostgreSQL on Railway
- **Cost:** FREE (Railway $5/month credit)

---

## 🔧 Optional: Add Custom Domain

### Buy Domain (~€10/year)

Recommended: Namecheap, Cloudflare, or GoDaddy

### Configure DNS

Add these records in your domain provider:

```
Type    Name    Value                       TTL
A       @       76.76.21.21                 Auto
CNAME   www     cname.vercel-dns.com        Auto
CNAME   *       cname.vercel-dns.com        Auto
CNAME   api     your-app.railway.app        Auto
```

### Add to Vercel

1. Vercel dashboard → Settings → Domains
2. Add: `reservo.com`, `www.reservo.com`, `*.reservo.com`

### Add to Railway

1. Railway dashboard → Settings → Domains
2. Add: `api.reservo.com`

### Update Environment Variables

**Railway:**
```bash
CUSTOM_DOMAIN=reservo.com
FRONTEND_URL=https://reservo.com
```

**Vercel:**
```bash
REACT_APP_API_URL=https://api.reservo.com/api/
```

### Wait for DNS (10-30 minutes)

Check: https://dnschecker.org

---

## 📊 Monitoring

### Backend Logs:
Railway dashboard → Your service → Logs

### Frontend Logs:
Vercel dashboard → Your project → Logs

### Database:
Railway dashboard → PostgreSQL → Metrics

---

## 🆘 Troubleshooting

### CORS Error:
- Check `FRONTEND_URL` in Railway variables
- Check `REACT_APP_API_URL` in Vercel variables
- Redeploy both services

### Database Error:
- Check `DATABASE_URL` exists in Railway
- Run migrations: Railway → Settings → Deploy → Add `python manage.py migrate`

### 404 on Frontend Routes:
- Check `vercel.json` exists in frontend folder
- Redeploy Vercel

---

## 🎯 Next Steps

1. Create your first business in super admin panel
2. Test subdomain booking (if using custom domain)
3. Configure Gmail for email notifications
4. Configure Twilio for WhatsApp notifications
5. Share demo link with potential clients!

---

## 💰 Costs

**Free Tier (First 6 months):**
- Vercel: FREE
- Railway: FREE ($5/month credit)
- Domain: €10/year (optional)
- **Total: €0-10/year**

**After Growth (20+ clients):**
- Vercel: FREE (still)
- Railway: $5-20/month
- Domain: €10/year
- **Total: €70-250/year**

---

Good luck! 🚀
