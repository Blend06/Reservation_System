import { useNavigate } from 'react-router-dom';
import { useAuth } from '../auth/authStore';
import { useReservations } from '../hooks/useReservations';
import { LoadingSpinner } from './ui';
import ReservationHeader from './reservations/ReservationHeader';
import ReservationForm from './reservations/ReservationForm';
import ReservationList from './reservations/ReservationList';

const Reservations = () => {
  const navigate = useNavigate();
  const { logout } = useAuth();
  const { reservations, loading, createReservation } = useReservations();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  if (loading) {
    return <LoadingSpinner fullScreen />;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <ReservationHeader onLogout={handleLogout} />
      
      <div className="max-w-7xl mx-auto px-6 py-8">
        <ReservationForm onSubmit={createReservation} loading={loading} />
        <ReservationList reservations={reservations} />
      </div>
    </div>
  );
};

export default Reservations;