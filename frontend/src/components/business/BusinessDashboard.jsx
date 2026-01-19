import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../auth/authStore';
import { useReservations } from '../../hooks/useReservations';
import { LoadingSpinner } from '../ui';
import ReservationList from '../reservations/ReservationList';

const BusinessDashboard = () => {
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const { reservations, loading, filterStatus, setFilterStatus } = useReservations();
  const [stats, setStats] = useState({
    total: 0,
    pending: 0,
    confirmed: 0,
    completed: 0,
    canceled: 0
  });

  useEffect(() => {
    // Check if user is business owner
    if (!user?.is_business_owner || !user?.business) {
      navigate('/login');
      return;
    }
  }, [user, navigate]);

  useEffect(() => {
    // Calculate stats from reservations
    if (reservations) {
      const newStats = reservations.reduce((acc, reservation) => {
        acc.total++;
        acc[reservation.status] = (acc[reservation.status] || 0) + 1;
        return acc;
      }, { total: 0, pending: 0, confirmed: 0, completed: 0, canceled: 0 });
      
      setStats(newStats);
    }
  }, [reservations]);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  if (loading) {
    return <LoadingSpinner fullScreen />;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Business Dashboard</h1>
              <p className="text-gray-600">
                {user?.business?.name} - Manage your reservations
              </p>
            </div>
            <div className="flex items-center space-x-4">
              <div className="text-right">
                <p className="text-sm text-gray-600">Welcome, {user?.first_name}</p>
                <p className="text-xs text-gray-500">{user?.business?.full_domain}</p>
              </div>
              <button
                onClick={handleLogout}
                className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg transition duration-200"
              >
                Logout
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 py-8">
        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-5 gap-6 mb-8">
          <StatCard
            title="Total Reservations"
            value={stats.total}
            icon="📅"
            color="bg-blue-500"
            onClick={() => setFilterStatus('all')}
            active={filterStatus === 'all'}
          />
          <StatCard
            title="Pending"
            value={stats.pending}
            icon="⏳"
            color="bg-yellow-500"
            onClick={() => setFilterStatus('pending')}
            active={filterStatus === 'pending'}
          />
          <StatCard
            title="Confirmed"
            value={stats.confirmed}
            icon="✅"
            color="bg-green-500"
            onClick={() => setFilterStatus('confirmed')}
            active={filterStatus === 'confirmed'}
          />
          <StatCard
            title="Completed"
            value={stats.completed}
            icon="🎉"
            color="bg-purple-500"
            onClick={() => setFilterStatus('completed')}
            active={filterStatus === 'completed'}
          />
          <StatCard
            title="Canceled"
            value={stats.canceled}
            icon="❌"
            color="bg-red-500"
            onClick={() => setFilterStatus('canceled')}
            active={filterStatus === 'canceled'}
          />
        </div>

        {/* Business Info Card */}
        <div className="bg-white rounded-lg shadow p-6 mb-8">
          <div className="flex justify-between items-start">
            <div>
              <h2 className="text-xl font-semibold text-gray-900 mb-2">Your Booking Link</h2>
              <p className="text-gray-600 mb-4">
                Share this link with your customers so they can book appointments directly:
              </p>
              <div className="bg-gray-50 p-3 rounded-lg border">
                <code className="text-blue-600 font-mono">
                  https://{user?.business?.full_domain}
                </code>
              </div>
            </div>
            <div className="flex space-x-2">
              <button
                onClick={() => navigator.clipboard.writeText(`https://${user?.business?.full_domain}`)}
                className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition duration-200"
              >
                Copy Link
              </button>
              <button
                onClick={() => window.open(`https://${user?.business?.full_domain}`, '_blank')}
                className="bg-gray-600 hover:bg-gray-700 text-white px-4 py-2 rounded-lg transition duration-200"
              >
                Preview
              </button>
            </div>
          </div>
        </div>

        {/* Reservations List */}
        <div className="bg-white rounded-lg shadow">
          <div className="px-6 py-4 border-b border-gray-200">
            <div className="flex justify-between items-center">
              <h2 className="text-xl font-semibold text-gray-900">
                Reservations
                {filterStatus !== 'all' && (
                  <span className="ml-2 text-sm font-normal text-gray-500">
                    (Filtered by {filterStatus})
                  </span>
                )}
              </h2>
              {filterStatus !== 'all' && (
                <button
                  onClick={() => setFilterStatus('all')}
                  className="text-blue-600 hover:text-blue-800 text-sm font-medium"
                >
                  Show All
                </button>
              )}
            </div>
          </div>
          <ReservationList reservations={reservations} showBusinessInfo={false} />
        </div>
      </div>
    </div>
  );
};

const StatCard = ({ title, value, icon, color, onClick, active }) => (
  <div
    className={`bg-white rounded-lg shadow p-6 cursor-pointer transition duration-200 transform hover:scale-105 ${
      active ? 'ring-2 ring-blue-500' : 'hover:shadow-lg'
    }`}
    onClick={onClick}
  >
    <div className="flex items-center">
      <div className={`${color} rounded-lg p-3 text-white text-2xl mr-4`}>
        {icon}
      </div>
      <div>
        <p className="text-sm font-medium text-gray-600">{title}</p>
        <p className="text-2xl font-bold text-gray-900">{value}</p>
      </div>
    </div>
  </div>
);

export default BusinessDashboard;