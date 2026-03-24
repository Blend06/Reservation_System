import { Routes, Route, Navigate, useLocation } from 'react-router-dom';
import Login from '../components/Login';
import Reservations from '../components/Reservations';
import Homepage from '../components/Homepage';
import UsersManagement from '../components/admin/UsersManagement';
import ReservationsManagement from '../components/admin/ReservationsManagement';
import SuperAdminDashboard from '../components/superadmin/SuperAdminDashboard';
import BusinessManagement from '../components/superadmin/BusinessManagement';
import SuperAdminReservationsManagement from '../components/superadmin/ReservationsManagement';
import SystemSettings from '../components/superadmin/SystemSettings';
import BusinessDashboard from '../components/business/BusinessDashboard';
import PublicBooking from '../components/public/PublicBooking';
import LandingPage from '../components/LandingPage';
import DemoLandingPage from '../components/DemoLandingPage';
import TermsOfService from '../components/TermsOfService';
import PrivacyPolicy from '../components/PrivacyPolicy';
import { useAuth } from '../auth/authStore';

// Detect if we're on a subdomain (but not Cloudflare Pages preview URLs)
const isSubdomain = () => {
  const host = window.location.hostname;
  
  // Ignore Cloudflare Pages preview URLs
  if (host.includes('pages.dev')) {
    return false;
  }
  
  const parts = host.split('.');
  return parts.length >= 3 && parts[0] !== 'www' && parts[0] !== 'localhost';
};

const ProtectedRoute = ({ children, adminOnly = false, superAdminOnly = false, businessOwnerOnly = false }) => {
  const { isAuthenticated, user, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-lg">Loading...</div>
      </div>
    );
  }

  if (!isAuthenticated()) {
    return <Navigate to="/login" />;
  }

  // Super admin sees only /superadmin – business owner sent to their dashboard
  if (superAdminOnly) {
    if (user?.is_business_owner) return <Navigate to="/business/dashboard" replace />;
    if (!user?.is_super_admin) return <Navigate to="/login" />;
    return children;
  }

  // Business owner sees only /business – super admin sent to their dashboard
  if (businessOwnerOnly) {
    if (user?.is_super_admin) return <Navigate to="/superadmin/dashboard" replace />;
    if (!user?.is_business_owner) return <Navigate to="/login" />;
    return children;
  }

  if (adminOnly && !user?.is_admin) {
    return <Navigate to="/login" />;
  }

  return children;
};

const AppRoutes = () => {
  const { isAuthenticated, user, loading } = useAuth();
  const location = useLocation();
  const isBookPath = location.pathname === '/book' || location.pathname === '/book/' || location.pathname.startsWith('/book/');

  // Don't block /book or /book/:subdomain on auth loading – render routes so React Router can match
  if (loading && !isBookPath) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-lg">Loading...</div>
      </div>
    );
  }

  // If we're on a subdomain, show public booking interface
  if (isSubdomain()) {
    return (
      <Routes>
        <Route path="/*" element={<PublicBooking />} />
      </Routes>
    );
  }

  // Main domain routes
  return (
    <Routes>
      <Route path="/login" element={<Login />} />
      {/* Public booking – /book and /book/ redirect to /book/testsalon */}
      <Route path="/book" element={<Navigate to="/book/testsalon" replace />} />
      <Route path="/book/" element={<Navigate to="/book/testsalon" replace />} />
      <Route path="/book/:subdomain" element={<PublicBooking />} />
      
      {/* Super Admin Routes */}
      <Route 
        path="/superadmin/dashboard" 
        element={
          <ProtectedRoute superAdminOnly={true}>
            <SuperAdminDashboard />
          </ProtectedRoute>
        } 
      />
      <Route 
        path="/superadmin" 
        element={<Navigate to="/superadmin/dashboard" replace />}
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
      
      {/* Business Owner Routes */}
      <Route 
        path="/business/dashboard" 
        element={
          <ProtectedRoute businessOwnerOnly={true}>
            <BusinessDashboard />
          </ProtectedRoute>
        } 
      />
      <Route 
        path="/business" 
        element={<Navigate to="/business/dashboard" replace />}
      />
      
      {/* Legacy Routes (for backward compatibility) */}
      <Route 
        path="/homepage" 
        element={
          <ProtectedRoute>
            <Homepage />
          </ProtectedRoute>
        } 
      />
      
      {/* /dashboard removed – redirect to correct dashboard */}
      <Route 
        path="/dashboard" 
        element={
          isAuthenticated() ? (
            user?.is_super_admin ? <Navigate to="/superadmin/dashboard" replace /> :
            user?.is_business_owner ? <Navigate to="/business/dashboard" replace /> :
            <Navigate to="/superadmin/dashboard" replace />
          ) : <Navigate to="/login" replace />
        } 
      />
      
      <Route 
        path="/admin/users" 
        element={
          <ProtectedRoute adminOnly={true}>
            <UsersManagement />
          </ProtectedRoute>
        } 
      />
      
      <Route 
        path="/admin/reservations" 
        element={
          <ProtectedRoute adminOnly={true}>
            <ReservationsManagement />
          </ProtectedRoute>
        } 
      />
      
      <Route 
        path="/reservations" 
        element={
          <ProtectedRoute>
            <Reservations />
          </ProtectedRoute>
        } 
      />
      
      {/* Demo Landing Page - Now the main landing page */}
      <Route path="/demo" element={<DemoLandingPage />} />
      
      {/* Terms and Privacy Pages */}
      <Route path="/terms" element={<TermsOfService />} />
      <Route path="/privacy" element={<PrivacyPolicy />} />
      
      {/* Root Route - Show Demo as main landing page */}
      <Route 
        path="/" 
        element={
          isAuthenticated() ? 
            (user?.is_super_admin ? <Navigate to="/superadmin/dashboard" /> :
             user?.is_business_owner ? <Navigate to="/business/dashboard" /> :
             user?.is_admin ? <Navigate to="/superadmin/dashboard" /> :
             <Navigate to="/homepage" />) :
            <DemoLandingPage />
        } 
      />
      {/* Catch-all so "No routes matched" never appears in console */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
};

export default AppRoutes;