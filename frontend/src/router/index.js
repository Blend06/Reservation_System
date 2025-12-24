import { Routes, Route, Navigate } from 'react-router-dom';
import Login from '../components/Login';
import Register from '../components/Register';
import Reservations from '../components/Reservations';
import Dashboard from '../components/Dashboard';
import Homepage from '../components/Homepage';
import UsersManagement from '../components/admin/UsersManagement';
import ReservationsManagement from '../components/admin/ReservationsManagement';
import { useAuth } from '../auth/authStore';

const ProtectedRoute = ({ children, adminOnly = false }) => {
  const { isAuthenticated, isAdmin, loading } = useAuth();
  
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
  
  if (adminOnly && !isAdmin()) {
    return <Navigate to="/homepage" />;
  }
  
  return children;
};

const AppRoutes = () => {
  const { isAuthenticated, isAdmin, loading } = useAuth();
  
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-lg">Loading...</div>
      </div>
    );
  }
  
  return (
    <Routes>
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />
      
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
      
      <Route 
        path="/" 
        element={
          isAuthenticated() ? 
            (isAdmin() ? <Navigate to="/dashboard" /> : <Navigate to="/homepage" />) :
            <Navigate to="/login" />
        } 
      />
    </Routes>
  );
};

export default AppRoutes;