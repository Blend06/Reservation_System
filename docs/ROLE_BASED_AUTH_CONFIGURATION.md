# Role-Based Authentication Configuration

## 🎯 Overview

This document shows all locations where role-based authentication is configured in the system. The system has two user roles: Super Admin (platform owner) and Business Owner (client).

---

## 👥 USER ROLES

### 1. Super Admin
- **Purpose:** Platform owner who manages all businesses
- **Access:** `/superadmin/*` routes only
- **Capabilities:**
  - Create/edit/delete businesses
  - View all reservations across all businesses
  - Manage system settings
  - View business statistics

### 2. Business Owner
- **Purpose:** Client who manages their own business
- **Access:** `/business/*` routes only
- **Capabilities:**
  - View their own business dashboard
  - Manage their own reservations
  - Accept/reject customer bookings
  - View their business statistics

---

## 📍 CONFIGURATION LOCATIONS

### 1. Backend - User Model
**File:** `backend/api/models/user.py`

```python
class User(AbstractBaseUser, PermissionsMixin):
    USER_TYPE_CHOICES = [
        ('super_admin', 'Super Admin'),
        ('business_owner', 'Business Owner'),
    ]
    
    user_type = models.CharField(
        max_length=20, 
        choices=USER_TYPE_CHOICES, 
        default='business_owner'
    )
    
    @property
    def is_super_admin(self):
        """Check if user is a super admin"""
        return self.user_type == 'super_admin'
    
    @property
    def is_business_owner(self):
        """Check if user is a business owner"""
        return self.user_type == 'business_owner'
```

**Key Points:**
- `user_type` field stores the role
- Properties `is_super_admin` and `is_business_owner` for easy checking
- Super admins have `business=null`, business owners have `business=<Business>`

---

### 2. Frontend - Auth Store
**File:** `frontend/src/auth/authStore.js`

```javascript
export const useAuth = () => {
  const context = useContext(AuthContext);
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(localStorage.getItem('token'));
  
  const isAuthenticated = () => {
    return !!token && !!user;
  };
  
  const isSuperAdmin = () => {
    return user?.is_super_admin || false;
  };
  
  const isBusinessOwner = () => {
    return user?.is_business_owner || false;
  };
  
  // ... login, logout, etc.
};
```

**Key Points:**
- `isAuthenticated()` - Check if user is logged in
- `isSuperAdmin()` - Check if user is super admin
- `isBusinessOwner()` - Check if user is business owner
- User data loaded from `/api/auth/me/` endpoint

---

### 3. Frontend - Router Configuration
**File:** `frontend/src/router/index.js`

```javascript
const ProtectedRoute = ({ 
  children, 
  superAdminOnly = false, 
  businessOwnerOnly = false 
}) => {
  const { isAuthenticated, user, loading } = useAuth();

  if (loading) {
    return <LoadingSpinner />;
  }

  if (!isAuthenticated()) {
    return <Navigate to="/login" />;
  }

  // Super admin trying to access business owner routes
  if (businessOwnerOnly) {
    if (user?.is_super_admin) {
      return <Navigate to="/superadmin/dashboard" replace />;
    }
    if (!user?.is_business_owner) {
      return <Navigate to="/login" />;
    }
    return children;
  }

  // Business owner trying to access super admin routes
  if (superAdminOnly) {
    if (user?.is_business_owner) {
      return <Navigate to="/business/dashboard" replace />;
    }
    if (!user?.is_super_admin) {
      return <Navigate to="/login" />;
    }
    return children;
  }

  return children;
};
```

**Key Points:**
- `ProtectedRoute` component wraps all protected routes
- `superAdminOnly={true}` - Only super admins can access
- `businessOwnerOnly={true}` - Only business owners can access
- Cross-role protection prevents wrong role from accessing routes

---

## 🛣️ ROUTE STRUCTURE

### Public Routes (No Auth Required)
```javascript
<Route path="/login" element={<Login />} />
<Route path="/register" element={<Register />} />
<Route path="/demo" element={<DemoLandingPage />} />
<Route path="/book/:subdomain" element={<PublicBooking />} />
<Route path="/" element={<LandingPage />} />
```

### Super Admin Routes (Requires `is_super_admin`)
```javascript
<Route 
  path="/superadmin/dashboard" 
  element={
    <ProtectedRoute superAdminOnly={true}>
      <SuperAdminDashboard />
    </ProtectedRoute>
  } 
/>
<Route 
  path="/superadmin/businesses" 
  element={
    <ProtectedRoute superAdminOnly={true}>
      <BusinessManagement />
    </ProtectedRoute>
  } 
/>
<Route 
  path="/superadmin/reservations" 
  element={
    <ProtectedRoute superAdminOnly={true}>
      <SuperAdminReservationsManagement />
    </ProtectedRoute>
  } 
/>
<Route 
  path="/superadmin/settings" 
  element={
    <ProtectedRoute superAdminOnly={true}>
      <SystemSettings />
    </ProtectedRoute>
  } 
/>
```

### Business Owner Routes (Requires `is_business_owner`)
```javascript
<Route 
  path="/business/dashboard" 
  element={
    <ProtectedRoute businessOwnerOnly={true}>
      <BusinessDashboard />
    </ProtectedRoute>
  } 
/>
```

### Redirect Routes
```javascript
// /superadmin redirects to /superadmin/dashboard
<Route 
  path="/superadmin" 
  element={<Navigate to="/superadmin/dashboard" replace />}
/>

// /business redirects to /business/dashboard
<Route 
  path="/business" 
  element={<Navigate to="/business/dashboard" replace />}
/>

// Root route redirects based on role
<Route 
  path="/" 
  element={
    isAuthenticated() ? 
      (user?.is_super_admin ? <Navigate to="/superadmin/dashboard" /> :
       user?.is_business_owner ? <Navigate to="/business/dashboard" /> :
       <Navigate to="/homepage" />) :
      <LandingPage />
  } 
/>
```

---

## 🔒 CROSS-ROLE PROTECTION

### Scenario 1: Super Admin tries to access Business Owner routes
```
User: Super Admin
Tries to access: /business/dashboard
Result: Redirected to /superadmin/dashboard
```

### Scenario 2: Business Owner tries to access Super Admin routes
```
User: Business Owner
Tries to access: /superadmin/dashboard
Result: Redirected to /business/dashboard
```

### Scenario 3: Unauthenticated user tries to access protected routes
```
User: Not logged in
Tries to access: /superadmin/dashboard or /business/dashboard
Result: Redirected to /login
```

---

## 🧪 TESTING ROLE-BASED AUTH

### Test Super Admin Access
1. Login as super admin
2. Try accessing `/superadmin/dashboard` → ✅ Should work
3. Try accessing `/business/dashboard` → ❌ Should redirect to `/superadmin/dashboard`
4. Try accessing `/superadmin/businesses` → ✅ Should work

### Test Business Owner Access
1. Login as business owner
2. Try accessing `/business/dashboard` → ✅ Should work
3. Try accessing `/superadmin/dashboard` → ❌ Should redirect to `/business/dashboard`
4. Try accessing `/superadmin/businesses` → ❌ Should redirect to `/business/dashboard`

### Test Unauthenticated Access
1. Logout
2. Try accessing `/superadmin/dashboard` → ❌ Should redirect to `/login`
3. Try accessing `/business/dashboard` → ❌ Should redirect to `/login`
4. Try accessing `/demo` → ✅ Should work (public)
5. Try accessing `/book/testsalon` → ✅ Should work (public)

---

## 📊 USER CREATION

### Creating Super Admin
**Method 1: Django Management Command**
```bash
docker exec -it fade_district-backend-1 python manage.py createsuperuser
```

**Method 2: Django Shell**
```python
from api.models import User
User.objects.create_superuser(
    email='admin@example.com',
    password='password123',
    first_name='Admin',
    last_name='User'
)
```

### Creating Business Owner
**Method 1: Super Admin Dashboard**
1. Login as super admin
2. Go to `/superadmin/businesses`
3. Click "Create Business"
4. Fill in business details + owner account details
5. System automatically creates business owner user

**Method 2: Django Shell**
```python
from api.models import User, Business

business = Business.objects.get(subdomain='testsalon')
User.objects.create_user(
    email='owner@testsalon.com',
    password='password123',
    first_name='John',
    last_name='Doe',
    user_type='business_owner',
    business=business
)
```

---

## 🔑 LOGIN FLOW

### 1. User submits login form
```javascript
// frontend/src/components/Login.jsx
const handleSubmit = async (e) => {
  e.preventDefault();
  const userData = await login(email, password);
  
  // Redirect based on role
  if (userData.is_super_admin) {
    navigate('/superadmin/dashboard');
  } else if (userData.is_business_owner) {
    navigate('/business/dashboard');
  }
};
```

### 2. Backend validates credentials
```python
# backend/api/views/auth.py
@api_view(['POST'])
def login_view(request):
    user = authenticate(email=email, password=password)
    if user:
        tokens = get_tokens_for_user(user)
        return Response({
            'access': tokens['access'],
            'refresh': tokens['refresh'],
            'user': {
                'id': user.id,
                'email': user.email,
                'is_super_admin': user.is_super_admin,
                'is_business_owner': user.is_business_owner,
                # ...
            }
        })
```

### 3. Frontend stores token and user data
```javascript
// frontend/src/auth/authStore.js
const login = async (email, password) => {
  const response = await api.post('auth/login/', { email, password });
  const newToken = response.data.access;
  
  localStorage.setItem('token', newToken);
  setToken(newToken);
  
  const userResponse = await api.get('auth/me/', {
    headers: { Authorization: `Bearer ${newToken}` }
  });
  setUser(userResponse.data);
  
  return userResponse.data;
};
```

---

## 🚀 DEPLOYMENT CHECKLIST

### Backend
- [x] User model has `user_type` field
- [x] User model has `is_super_admin` and `is_business_owner` properties
- [x] Auth endpoints return user role information
- [x] Business creation creates owner user automatically

### Frontend
- [x] Auth store has `isSuperAdmin()` and `isBusinessOwner()` functions
- [x] Router has `ProtectedRoute` component
- [x] All super admin routes use `superAdminOnly={true}`
- [x] All business owner routes use `businessOwnerOnly={true}`
- [x] Cross-role protection redirects to correct dashboard
- [x] Login redirects to correct dashboard based on role

### Testing
- [x] Super admin can access `/superadmin/*` routes
- [x] Business owner can access `/business/*` routes
- [x] Super admin cannot access `/business/*` routes
- [x] Business owner cannot access `/superadmin/*` routes
- [x] Unauthenticated users redirected to `/login`
- [x] Root route redirects to correct dashboard

---

## 📝 SUMMARY

The role-based authentication system is fully configured and working correctly:

1. **Backend:** User model with `user_type` field and role properties
2. **Frontend:** Auth store with role checking functions
3. **Router:** Protected routes with cross-role protection
4. **Login:** Automatic redirect to correct dashboard based on role

**All routes are properly protected and tested!** ✅

When you deploy, the system will automatically:
- Redirect super admins to `/superadmin/dashboard`
- Redirect business owners to `/business/dashboard`
- Prevent cross-role access
- Redirect unauthenticated users to `/login`

---

**Last Updated:** March 9, 2026  
**Status:** ✅ Production Ready  
**Tested:** All role-based routes working correctly
