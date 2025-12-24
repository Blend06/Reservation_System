import { useNavigate } from 'react-router-dom';
import { useAuth } from '../auth/authStore';

const Homepage = () => {
  const navigate = useNavigate();
  const { logout } = useAuth();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
      <div className="max-w-md w-full bg-white rounded-lg shadow-lg p-8 text-center">
        <h1 className="text-3xl font-bold text-gray-800 mb-4">
          Welcome to Reservation System
        </h1>
        <p className="text-gray-600 mb-8">
          Hello! You can manage your reservations here.
        </p>
        
        <div className="space-y-4">
          <button 
            onClick={() => navigate('/reservations')}
            className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 px-6 rounded-lg transition duration-200 transform hover:scale-105"
          >
            My Reservations
          </button>
          
          <button 
            onClick={handleLogout}
            className="w-full bg-gray-500 hover:bg-gray-600 text-white font-semibold py-3 px-6 rounded-lg transition duration-200"
          >
            Logout
          </button>
        </div>
      </div>
    </div>
  );
};

export default Homepage;