import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../auth/authStore';
import { useWebSocketContext } from '../../context/WebSocketContext';
import api from '../../api/axios';
import { LoadingSpinner } from '../ui';
import NotificationBell from '../ui/NotificationBell';
import { 
  Building2, 
  CheckCircle, 
  Users, 
  Calendar, 
  Plus, 
  BarChart3, 
  Settings, 
  LogOut,
  TrendingUp,
  TrendingDown,
  Activity
} from 'lucide-react';
import {
  LineChart,
  Line,
  AreaChart,
  Area,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer
} from 'recharts';

const SuperAdminDashboard = () => {
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const { dashboardUpdates } = useWebSocketContext();
  const [stats, setStats] = useState(null);
  const [analytics, setAnalytics] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check if user is super admin
    if (!user?.is_super_admin) {
      navigate('/login');
      return;
    }
    
    fetchDashboardData();
  }, [user, navigate]);

  // Listen for real-time WebSocket updates
  useEffect(() => {
    if (dashboardUpdates.length > 0) {
      const latestUpdate = dashboardUpdates[0];
      console.log('Received real-time update:', latestUpdate);
      
      // Refresh data based on update type
      if (latestUpdate.type === 'business_created' || 
          latestUpdate.type === 'business_updated' ||
          latestUpdate.type === 'reservation_created') {
        fetchDashboardData();
      }
    }
  }, [dashboardUpdates]);

  const fetchDashboardData = async () => {
    try {
      const [statsResponse, analyticsResponse] = await Promise.all([
        api.get('businesses/dashboard_stats/'),
        api.get('businesses/analytics/')
      ]);
      setStats(statsResponse.data);
      setAnalytics(analyticsResponse.data);
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
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
              <NotificationBell />
              <button
                onClick={handleLogout}
                className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg transition duration-200 flex items-center space-x-2"
              >
                <LogOut className="w-4 h-4" />
                <span>Logout</span>
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
            icon={<Building2 className="w-6 h-6" />}
            color="bg-blue-500"
            trend={analytics?.monthlyGrowth > 0 ? 'up' : 'down'}
            trendValue={`${analytics?.monthlyGrowth || 0}%`}
            onClick={() => navigate('/superadmin/businesses')}
          />
          <StatCard
            title="Active businesses"
            value={stats?.active_businesses || 0}
            icon={<CheckCircle className="w-6 h-6" />}
            color="bg-green-500"
            trend="up"
            trendValue="8.2%"
            onClick={() => navigate('/superadmin/businesses')}
          />
          <StatCard
            title="Business owners"
            value={stats?.total_users || 0}
            icon={<Users className="w-6 h-6" />}
            color="bg-purple-500"
            trend="up"
            trendValue="5.1%"
            onClick={() => navigate('/superadmin/businesses')}
          />
          <StatCard
            title="Reservations (all)"
            value={stats?.total_reservations || 0}
            icon={<Calendar className="w-6 h-6" />}
            color="bg-orange-500"
            trend="up"
            trendValue="12.3%"
            onClick={() => navigate('/superadmin/reservations')}
          />
        </div>

        {/* Quick Overview Section */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
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
                <div key={business.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition duration-200 cursor-pointer" onClick={() => navigate('/superadmin/businesses')}>
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
              {(!stats?.recent_businesses || stats.recent_businesses.length === 0) && (
                <p className="text-gray-500 text-center py-8">No businesses yet</p>
              )}
            </div>
          </div>

          {/* Quick Actions */}
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-xl font-semibold text-gray-800 mb-4">Quick actions</h2>
            <div className="space-y-3">
              <ActionButton
                title="Manage my clients (businesses)"
                description="View and manage all client businesses"
                icon={<Building2 className="w-6 h-6" />}
                onClick={() => navigate('/superadmin/businesses')}
              />
              <ActionButton
                title="Add new client (business)"
                description="Create a new business on the platform"
                icon={<Plus className="w-6 h-6" />}
                onClick={() => navigate('/superadmin/businesses')}
              />
              <ActionButton
                title="View all reservations"
                description="Reservations across all client businesses"
                icon={<BarChart3 className="w-6 h-6" />}
                onClick={() => navigate('/superadmin/reservations')}
              />
              <ActionButton
                title="System settings"
                description="Configure global system settings"
                icon={<Settings className="w-6 h-6" />}
                onClick={() => navigate('/superadmin/settings')}
              />
            </div>
          </div>
        </div>

        {/* Analytics Charts */}
        {analytics && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
            {/* Business Growth Chart */}
            <div className="bg-white rounded-lg shadow p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-semibold text-gray-800">Business Growth</h2>
                <BarChart3 className="w-5 h-5 text-gray-500" />
              </div>
              <ResponsiveContainer width="100%" height={300}>
                <AreaChart data={analytics.businessGrowth}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="month" />
                  <YAxis />
                  <Tooltip />
                  <Area 
                    type="monotone" 
                    dataKey="businesses" 
                    stroke="#3B82F6" 
                    fill="#3B82F6" 
                    fillOpacity={0.3}
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>

            {/* Business Types Distribution */}
            <div className="bg-white rounded-lg shadow p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-semibold text-gray-800">Business Types</h2>
                <Activity className="w-5 h-5 text-gray-500" />
              </div>
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={analytics.businessTypes}
                    cx="50%"
                    cy="50%"
                    outerRadius={100}
                    fill="#8884d8"
                    dataKey="value"
                    label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                  >
                    {analytics.businessTypes.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </div>

            {/* Revenue Trends */}
            <div className="bg-white rounded-lg shadow p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-semibold text-gray-800">Revenue Trends</h2>
                <TrendingUp className="w-5 h-5 text-green-500" />
              </div>
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={analytics.businessGrowth}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="month" />
                  <YAxis />
                  <Tooltip formatter={(value) => [`$${value}`, 'Revenue']} />
                  <Line 
                    type="monotone" 
                    dataKey="revenue" 
                    stroke="#10B981" 
                    strokeWidth={3}
                    dot={{ fill: '#10B981', strokeWidth: 2, r: 4 }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>

            {/* Reservation Status Trends */}
            <div className="bg-white rounded-lg shadow p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-semibold text-gray-800">Reservation Trends</h2>
                <Calendar className="w-5 h-5 text-gray-500" />
              </div>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={analytics.reservationTrends}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="month" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Bar dataKey="confirmed" fill="#10B981" name="Confirmed" />
                  <Bar dataKey="pending" fill="#F59E0B" name="Pending" />
                  <Bar dataKey="canceled" fill="#EF4444" name="Canceled" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

const StatCard = ({ title, value, icon, color, trend, trendValue, onClick }) => (
  <div
    className={`bg-white rounded-lg shadow p-6 ${onClick ? 'cursor-pointer hover:shadow-lg transition duration-200 transform hover:scale-105' : ''}`}
    onClick={onClick}
  >
    <div className="flex items-center justify-between">
      <div className="flex items-center">
        <div className={`${color} rounded-lg p-3 text-white mr-4`}>
          {icon}
        </div>
        <div>
          <p className="text-sm font-medium text-gray-600">{title}</p>
          <p className="text-2xl font-bold text-gray-900">{value}</p>
        </div>
      </div>
      {trend && trendValue && (
        <div className="flex items-center">
          {trend === 'up' ? (
            <TrendingUp className="w-4 h-4 text-green-500 mr-1" />
          ) : (
            <TrendingDown className="w-4 h-4 text-red-500 mr-1" />
          )}
          <span className={`text-sm font-medium ${trend === 'up' ? 'text-green-600' : 'text-red-600'}`}>
            {trendValue}
          </span>
        </div>
      )}
    </div>
  </div>
);

const ActionButton = ({ title, description, icon, onClick }) => (
  <button
    onClick={onClick}
    className="w-full text-left p-4 bg-gray-50 hover:bg-gray-100 rounded-lg transition duration-200"
  >
    <div className="flex items-center">
      <div className="text-gray-600 mr-3">{icon}</div>
      <div>
        <h3 className="font-medium text-gray-900">{title}</h3>
        <p className="text-sm text-gray-600">{description}</p>
      </div>
    </div>
  </button>
);

export default SuperAdminDashboard;