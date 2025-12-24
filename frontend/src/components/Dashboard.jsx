import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../auth/authStore';
import api from '../api/axios';

const Dashboard = () => {
  const navigate = useNavigate();
  const { logout } = useAuth();
  const [stats, setStats] = useState([
    { name: 'Total Users', value: '0', icon: '👥', color: 'bg-blue-500', route: '/admin/users' },
    { name: 'Total Reservations', value: '0', icon: '📅', color: 'bg-green-500', route: '/admin/reservations' },
    { name: 'Pending Reservations', value: '0', icon: '⏳', color: 'bg-yellow-500', route: '/admin/reservations' },
  ]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      const response = await api.get('dashboard/stats/');
      const data = response.data;
      
      setStats([
        { name: 'Total Users', value: data.total_users.toString(), icon: '👥', color: 'bg-blue-500', route: '/admin/users' },
        { name: 'Total Reservations', value: data.total_reservations.toString(), icon: '📅', color: 'bg-green-500', route: '/admin/reservations' },
        { name: 'Pending Reservations', value: data.pending_reservations.toString(), icon: '⏳', color: 'bg-yellow-500', route: '/admin/reservations' },
      ]);
    } catch (error) {
      console.error('Error fetching stats:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex justify-between items-center">
            <h1 className="text-3xl font-bold text-gray-800">Admin Dashboard</h1>
            <button 
              onClick={handleLogout}
              className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg transition duration-200"
            >
              Logout
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 py-8">
        {/* Welcome Section */}
        <div className="mb-8">
          <h2 className="text-2xl font-semibold text-gray-800 mb-2">
            Welcome back, Admin!
          </h2>
          <p className="text-gray-600">
            Here's what's happening with your reservation system today.
          </p>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {loading ? (
            // Loading skeleton
            Array.from({ length: 3 }).map((_, index) => (
              <div key={index} className="bg-white rounded-lg shadow p-6">
                <div className="flex items-center">
                  <div className="bg-gray-200 rounded-lg p-3 mr-4 animate-pulse">
                    <div className="w-8 h-8"></div>
                  </div>
                  <div>
                    <div className="h-4 bg-gray-200 rounded animate-pulse mb-2 w-20"></div>
                    <div className="h-6 bg-gray-200 rounded animate-pulse w-12"></div>
                  </div>
                </div>
              </div>
            ))
          ) : (
            stats.map((stat, index) => (
              <div 
                key={index}
                onClick={() => navigate(stat.route)}
                className="bg-white rounded-lg shadow p-6 cursor-pointer hover:shadow-lg transition duration-200 transform hover:scale-105"
              >
                <div className="flex items-center">
                  <div className={`${stat.color} rounded-lg p-3 mr-4`}>
                    <span className="text-2xl">{stat.icon}</span>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-600">{stat.name}</p>
                    <p className="text-2xl font-semibold text-gray-900">{stat.value}</p>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-lg font-semibold text-gray-800 mb-4">Quick Actions</h3>
            <div className="space-y-3">
              <button 
                onClick={() => navigate('/admin/users')}
                className="w-full text-left p-3 rounded-lg border border-gray-200 hover:bg-gray-50 transition duration-200"
              >
                <div className="flex items-center">
                  <span className="text-xl mr-3">👥</span>
                  <div>
                    <div className="font-medium text-gray-800">Manage Users</div>
                    <div className="text-sm text-gray-600">View, edit, and delete users</div>
                  </div>
                </div>
              </button>
              
              <button 
                onClick={() => navigate('/admin/reservations')}
                className="w-full text-left p-3 rounded-lg border border-gray-200 hover:bg-gray-50 transition duration-200"
              >
                <div className="flex items-center">
                  <span className="text-xl mr-3">📅</span>
                  <div>
                    <div className="font-medium text-gray-800">Manage Reservations</div>
                    <div className="text-sm text-gray-600">View and update reservation status</div>
                  </div>
                </div>
              </button>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-lg font-semibold text-gray-800 mb-4">System Status</h3>
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-gray-600">System Status</span>
                <span className="inline-flex px-2 py-1 text-xs font-semibold rounded-full bg-green-100 text-green-800">
                  Online
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-gray-600">Database</span>
                <span className="inline-flex px-2 py-1 text-xs font-semibold rounded-full bg-green-100 text-green-800">
                  Connected
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-gray-600">Last Backup</span>
                <span className="text-sm text-gray-500">Today</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;