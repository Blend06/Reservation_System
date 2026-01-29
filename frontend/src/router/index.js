import { Routes, Route, Navigate, useLocation } from 'react-router-dom';
import Login from '../components/Login';
import Register from '../components/Register';
import Reservations from '../components/Reservations';
import Dashboard from '../components/Dashboard';
import Homepage from '../components/Homepage';
import UsersManagement from '../components/admin/UsersManagement';
import ReservationsManagement from '../components/admin/ReservationsManagement';
import SuperAdminDashboard from '../components/superadmin/SuperAdminDashboard';
import BusinessManagement from '../components/superadmin/BusinessManagement';
import BusinessDashboard from '../components/business/BusinessDashboard';
import PublicBooking from '../components/public/PublicBooking';
import { useAuth } from '../auth/authStore';

// Detect if we're on a subdomain
const isSubdomain = () => {
  const host = window.location.hostname;
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
  
  if (superAdminOnly && !user?.is_super_admin) {
    return <Navigate to="/login" />;
  }
  
  if (businessOwnerOnly && !user?.is_business_owner) {
    return <Navigate to="/login" />;
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
      <Route path="/register" element={<Register />} />
      {/* Public booking – /book and /book/ redirect to /book/testsalon */}
      <Route path="/book" element={<Navigate to="/book/testsalon" replace />} />
      <Route path="/book/" element={<Navigate to="/book/testsalon" replace />} />
      <Route path="/book/:subdomain" element={<PublicBooking />} />
      
      {/* Super Admin Routes */}
      <Route 
        path="/superadmin" 
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
      
      {/* Business Owner Routes */}
      <Route 
        path="/business" 
        element={
          <ProtectedRoute businessOwnerOnly={true}>
            <BusinessDashboard />
          </ProtectedRoute>
        } 
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
      
      <Route 
        path="/dashboard" 
        element={
          <ProtectedRoute adminOnly={true}>
            <Dashboard />
          </ProtectedRoute>
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
      
      {/* Root Route - Redirect based on user type */}
      <Route 
        path="/" 
        element={
          isAuthenticated() ? 
            (user?.is_super_admin ? <Navigate to="/superadmin" /> :
             user?.is_business_owner ? <Navigate to="/business" /> :
             user?.is_admin ? <Navigate to="/dashboard" /> :
             <Navigate to="/homepage" />) :
            <Navigate to="/login" />
        } 
      />
      {/* Catch-all so "No routes matched" never appears in console */}
      <Route path="*" element={<Navigate to="/login" replace />} />
    </Routes>
  );
};

export default AppRoutes;