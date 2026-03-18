import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../auth/authStore';
import api from '../../api/axios';
import { LoadingSpinner } from '../ui';
import {
  Building2,
  CheckCircle,
  Calendar,
  LogOut,
  BarChart3,
  Activity,
  LayoutDashboard,
} from 'lucide-react';
import {
  AreaChart, Area,
  LineChart, Line,
  BarChart, Bar,
  PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, Legend,
  ResponsiveContainer
} from 'recharts';
import BusinessManagement from './BusinessManagement';
import ReservationsManagement from './ReservationsManagement';
import StaffOverview from './StaffOverview';

const TABS = [
  { id: 'overview',      label: 'Overview',      icon: LayoutDashboard },
  { id: 'businesses',    label: 'Businesses',     icon: Building2 },
  { id: 'reservations',  label: 'Reservations',   icon: Calendar },
  { id: 'staff',         label: 'Staff',          icon: Activity },
  { id: 'analytics',     label: 'Analytics',      icon: BarChart3 },
];

const SuperAdminDashboard = () => {
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const [activeTab, setActiveTab] = useState('overview');
  const [stats, setStats] = useState(null);
  const [analytics, setAnalytics] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user?.is_super_admin) { navigate('/login'); return; }
    fetchDashboardData();
  }, [user, navigate]);

  const fetchDashboardData = async () => {
    try {
      const [statsRes, analyticsRes] = await Promise.all([
        api.get('businesses/dashboard_stats/'),
        api.get('businesses/analytics/')
      ]);
      setStats(statsRes.data);
      setAnalytics(analyticsRes.data);
    } catch (e) {
      console.error('Error fetching dashboard data:', e);
    }
    setLoading(false);
  };

  if (loading) return <LoadingSpinner fullScreen />;

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow">
        <div className="w-full px-8 py-4">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-4xl font-bold text-gray-900">Admin Dashboard</h1>
              <p className="text-gray-600 text-base mt-1">Welcome, {user?.first_name}</p>
            </div>
            <button
              onClick={() => { logout(); navigate('/login'); }}
              className="bg-red-600 hover:bg-red-700 text-white px-5 py-2.5 rounded-lg flex items-center space-x-2 text-base"
            >
              <LogOut className="w-5 h-5" />
              <span>Logout</span>
            </button>
          </div>

          {/* Tabs */}
          <div className="flex space-x-2 mt-6 border-b border-gray-200">
            {TABS.map(tab => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center space-x-2 px-6 py-3 text-base font-medium border-b-2 transition-colors ${
                    activeTab === tab.id
                      ? 'border-blue-600 text-blue-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
                >
                  <Icon className="w-5 h-5" />
                  <span>{tab.label}</span>
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* Tab Content */}
      <div className="w-full px-8 py-8">
        {activeTab === 'overview' && <OverviewTab stats={stats} analytics={analytics} setActiveTab={setActiveTab} />}
        {activeTab === 'businesses' && <BusinessManagement embedded />}
        {activeTab === 'reservations' && <ReservationsManagement embedded />}
        {activeTab === 'staff' && <StaffOverview />}
        {activeTab === 'analytics' && <AnalyticsTab analytics={analytics} />}
      </div>
    </div>
  );
};

/* ── Overview Tab ── */
const OverviewTab = ({ stats, analytics, setActiveTab }) => (
  <div className="space-y-8">
    {/* Stat cards */}
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
      <StatCard
        title="Total Businesses"
        value={stats?.total_businesses || 0}
        icon={<Building2 className="w-6 h-6" />}
        color="bg-blue-500"
        onClick={() => setActiveTab('businesses')}
      />
      <StatCard
        title="Active Businesses"
        value={stats?.active_businesses || 0}
        icon={<CheckCircle className="w-6 h-6" />}
        color="bg-green-500"
        onClick={() => setActiveTab('businesses')}
      />
      <StatCard
        title="Total Reservations"
        value={stats?.total_reservations || 0}
        icon={<Calendar className="w-6 h-6" />}
        color="bg-orange-500"
        onClick={() => setActiveTab('reservations')}
      />
    </div>

    {/* Recent businesses */}
    <div className="bg-white rounded-lg shadow p-6">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-lg font-semibold text-gray-800">Recent Businesses</h2>
        <button onClick={() => setActiveTab('businesses')} className="text-blue-600 hover:text-blue-800 text-sm font-medium">
          View all
        </button>
      </div>
      <div className="space-y-3">
        {stats?.recent_businesses?.length > 0 ? stats.recent_businesses.map(b => (
          <div key={b.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
            <div>
              <p className="font-medium text-gray-900">{b.name}</p>
              <p className="text-sm text-gray-500">{b.full_domain}</p>
            </div>
            <span className={`px-3 py-1 text-xs font-semibold rounded-full ${b.is_active ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
              {b.is_active ? 'Active' : 'Inactive'}
            </span>
          </div>
        )) : (
          <p className="text-gray-500 text-center py-8">No businesses yet</p>
        )}
      </div>
    </div>

    {/* Analytics section */}
    {analytics && <AnalyticsTab analytics={analytics} />}
  </div>
);

/* ── Analytics Tab ── */
const AnalyticsTab = ({ analytics }) => {
  if (!analytics) return <p className="text-gray-500">No analytics data available.</p>;

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
      {/* Business Growth */}
      <div className="bg-white rounded-lg shadow p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-gray-800">Business Growth</h2>
          <BarChart3 className="w-5 h-5 text-gray-400" />
        </div>
        <ResponsiveContainer width="100%" height={280}>
          <AreaChart data={analytics.businessGrowth}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="month" />
            <YAxis allowDecimals={false} />
            <Tooltip />
            <Area type="monotone" dataKey="businesses" stroke="#3B82F6" fill="#3B82F6" fillOpacity={0.3} />
          </AreaChart>
        </ResponsiveContainer>
      </div>

      {/* Business Types */}
      <div className="bg-white rounded-lg shadow p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-gray-800">Business Types</h2>
          <Activity className="w-5 h-5 text-gray-400" />
        </div>
        <ResponsiveContainer width="100%" height={280}>
          <PieChart>
            <Pie
              data={analytics.businessTypes}
              cx="50%"
              cy="50%"
              outerRadius={100}
              dataKey="value"
              label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
            >
              {analytics.businessTypes.map((entry, i) => (
                <Cell key={i} fill={entry.color} />
              ))}
            </Pie>
            <Tooltip />
          </PieChart>
        </ResponsiveContainer>
      </div>

      {/* Reservation Trends */}
      <div className="bg-white rounded-lg shadow p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-gray-800">Reservation Trends</h2>
          <Calendar className="w-5 h-5 text-gray-400" />
        </div>
        <ResponsiveContainer width="100%" height={280}>
          <BarChart data={analytics.reservationTrends}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="month" />
            <YAxis allowDecimals={false} />
            <Tooltip />
            <Legend />
            <Bar dataKey="confirmed" fill="#10B981" name="Confirmed" />
            <Bar dataKey="pending" fill="#F59E0B" name="Pending" />
            <Bar dataKey="canceled" fill="#EF4444" name="Canceled" />
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* Monthly Reservations */}
      <div className="bg-white rounded-lg shadow p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-gray-800">Monthly Reservations</h2>
          <BarChart3 className="w-5 h-5 text-gray-400" />
        </div>
        <ResponsiveContainer width="100%" height={280}>
          <LineChart data={analytics.businessGrowth}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="month" />
            <YAxis allowDecimals={false} />
            <Tooltip />
            <Line type="monotone" dataKey="reservations" stroke="#8B5CF6" strokeWidth={2} dot={{ r: 4 }} />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};

const StatCard = ({ title, value, icon, color, onClick }) => (
  <div
    className="bg-white rounded-lg shadow p-6 cursor-pointer hover:shadow-lg transition duration-200"
    onClick={onClick}
  >
    <div className="flex items-center">
      <div className={`${color} rounded-lg p-3 text-white mr-4`}>{icon}</div>
      <div>
        <p className="text-sm font-medium text-gray-600">{title}</p>
        <p className="text-2xl font-bold text-gray-900">{value}</p>
      </div>
    </div>
  </div>
);

export default SuperAdminDashboard;
