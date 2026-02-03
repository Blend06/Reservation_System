import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../auth/authStore';
import api from '../../api/axios';
import { LoadingSpinner } from '../ui';

const SuperAdminDashboard = () => {
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check if user is super admin
    if (!user?.is_super_admin) {
      navigate('/login');
      return;
    }
    
    fetchDashboardStats();
  }, [user, navigate]);

  const fetchDashboardStats = async () => {
    try {
      const response = await api.get('businesses/dashboard_stats/');
      setStats(response.data);
    } catch (error) {
      console.error('Error fetching dashboard stats:', error);
    }
    setLoading(false);
  };

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
              <h1 className="text-2xl font-bold text-gray-900">My Dashboard</h1>
              <p className="text-gray-600">Manage your clients (their businesses) on the platform</p>
            </div>
            <div className="flex items-center space-x-4">
              <span className="text-sm text-gray-600">Welcome, {user?.first_name}</span>
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
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <StatCard
            title="My clients (businesses)"
            value={stats?.total_businesses || 0}
            icon="🏢"
            color="bg-blue-500"
            onClick={() => navigate('/superadmin/businesses')}
          />
          <StatCard
            title="Active businesses"
            value={stats?.active_businesses || 0}
            icon="✅"
            color="bg-green-500"
            onClick={() => navigate('/superadmin/businesses')}
          />
          <StatCard
            title="Business owners"
            value={stats?.total_users || 0}
            icon="👤"
            color="bg-purple-500"
          />
          <StatCard
            title="Reservations (all)"
            value={stats?.total_reservations || 0}
            icon="📅"
            color="bg-orange-500"
            onClick={() => navigate('/superadmin/reservations')}
          />
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Recent clients (businesses) */}
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-semibold text-gray-800">Recent clients (businesses)</h2>
              <button
                onClick={() => navigate('/superadmin/businesses')}
                className="text-blue-600 hover:text-blue-800 text-sm font-medium"
              >
                View all
              </button>
            </div>
            <div className="space-y-3">
              {stats?.recent_businesses?.map((business) => (
                <div key={business.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div>
                    <h3 className="font-medium text-gray-900">{business.name}</h3>
                    <p className="text-sm text-gray-600">{business.full_domain}</p>
                  </div>
                  <div className="text-right">
                    <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                      business.is_active ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                    }`}>
                      {business.is_active ? 'Active' : 'Inactive'}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Quick Actions */}
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-xl font-semibold text-gray-800 mb-4">Quick actions</h2>
            <div className="space-y-3">
              <ActionButton
                title="Manage my clients (businesses)"
                description="View and manage all client businesses"
                icon="🏢"
                onClick={() => navigate('/superadmin/businesses')}
              />
              <ActionButton
                title="Add new client (business)"
                description="Create a new business on the platform"
                icon="➕"
                onClick={() => navigate('/superadmin/businesses')}
              />
              <ActionButton
                title="View all reservations"
                description="Reservations across all client businesses"
                icon="📊"
                onClick={() => navigate('/superadmin/reservations')}
              />
              <ActionButton
                title="System settings"
                description="Configure global system settings"
                icon="⚙️"
                onClick={() => navigate('/superadmin/settings')}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

const StatCard = ({ title, value, icon, color, onClick }) => (
  <div
    className={`bg-white rounded-lg shadow p-6 ${onClick ? 'cursor-pointer hover:shadow-lg transition duration-200 transform hover:scale-105' : ''}`}
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

const ActionButton = ({ title, description, icon, onClick }) => (
  <button
    onClick={onClick}
    className="w-full text-left p-4 bg-gray-50 hover:bg-gray-100 rounded-lg transition duration-200"
  >
    <div className="flex items-center">
      <span className="text-2xl mr-3">{icon}</span>
      <div>
        <h3 className="font-medium text-gray-900">{title}</h3>
        <p className="text-sm text-gray-600">{description}</p>
      </div>
    </div>
  </button>
);

export default SuperAdminDashboard;