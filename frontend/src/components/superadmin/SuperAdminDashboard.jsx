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
  Trophy,
  Filter,
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
  const [businessReservations, setBusinessReservations] = useState(null);
  const [reservationPeriod, setReservationPeriod] = useState('month');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user?.is_super_admin) { navigate('/login'); return; }
    fetchDashboardData();
  }, [user, navigate]);

  useEffect(() => {
    if (user?.is_super_admin) {
      fetchBusinessReservations(reservationPeriod);
    }
  }, [reservationPeriod, user]);

  const fetchDashboardData = async () => {
    try {
      const [statsRes, analyticsRes, reservationsRes] = await Promise.all([
        api.get('businesses/dashboard_stats/'),
        api.get('businesses/analytics/'),
        api.get('businesses/reservations_by_business/?period=month')
      ]);
      setStats(statsRes.data);
      setAnalytics(analyticsRes.data);
      setBusinessReservations(reservationsRes.data);
    } catch (e) {
      console.error('Error fetching dashboard data:', e);
    }
    setLoading(false);
  };

  const fetchBusinessReservations = async (period) => {
    try {
      const res = await api.get(`businesses/reservations_by_business/?period=${period}`);
      setBusinessReservations(res.data);
    } catch (e) {
      console.error('Error fetching business reservations:', e);
    }
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
        {activeTab === 'overview' && (
          <OverviewTab 
            stats={stats} 
            analytics={analytics} 
            businessReservations={businessReservations}
            reservationPeriod={reservationPeriod}
            setReservationPeriod={setReservationPeriod}
            setActiveTab={setActiveTab} 
          />
        )}
        {activeTab === 'businesses' && <BusinessManagement embedded />}
        {activeTab === 'reservations' && <ReservationsManagement embedded />}
        {activeTab === 'staff' && <StaffOverview />}
        {activeTab === 'analytics' && (
          <AnalyticsTab 
            analytics={analytics} 
            businessReservations={businessReservations}
            reservationPeriod={reservationPeriod}
            setReservationPeriod={setReservationPeriod}
          />
        )}
      </div>
    </div>
  );
};

/* ── Overview Tab ── */
const OverviewTab = ({ stats, analytics, businessReservations, reservationPeriod, setReservationPeriod, setActiveTab }) => (
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

    {/* Top 3 Businesses */}
    <TopBusinessesCard businessReservations={businessReservations} />

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
    {analytics && (
      <AnalyticsTab 
        analytics={analytics} 
        businessReservations={businessReservations}
        reservationPeriod={reservationPeriod}
        setReservationPeriod={setReservationPeriod}
      />
    )}
  </div>
);

/* ── Top 3 Businesses Card ── */
const TopBusinessesCard = ({ businessReservations }) => {
  const top3 = businessReservations?.top_businesses || [];
  
  return (
    <div className="bg-white rounded-lg shadow p-6">
      <div className="flex items-center gap-3 mb-4">
        <Trophy className="w-6 h-6 text-yellow-500" />
        <h2 className="text-lg font-semibold text-gray-800">Top 3 Businesses (This Month)</h2>
      </div>
      {top3.length === 0 ? (
        <p className="text-gray-500 text-center py-8">No reservation data available</p>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {top3.map((biz, idx) => (
            <div 
              key={biz.id} 
              className={`p-4 rounded-lg border-2 ${
                idx === 0 ? 'border-yellow-400 bg-yellow-50' : 
                idx === 1 ? 'border-gray-300 bg-gray-50' : 
                'border-amber-600 bg-amber-50'
              }`}
            >
              <div className="flex items-center gap-3 mb-2">
                <div className={`w-8 h-8 rounded-full flex items-center justify-center text-white font-bold ${
                  idx === 0 ? 'bg-yellow-500' : idx === 1 ? 'bg-gray-400' : 'bg-amber-600'
                }`}>
                  {idx + 1}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-semibold text-gray-900 truncate">{biz.name}</p>
                  <p className="text-xs text-gray-500 truncate">{biz.subdomain}</p>
                </div>
              </div>
              <div className="text-center mt-3">
                <p className="text-3xl font-bold text-blue-600">{biz.reservation_count}</p>
                <p className="text-sm text-gray-500">reservations</p>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

/* ── Period Filter Labels ── */
const PERIOD_LABELS = {
  today: 'Today',
  week: 'This Week',
  month: 'This Month',
  year: 'This Year'
};

/* ── Analytics Tab ── */
const AnalyticsTab = ({ analytics, businessReservations, reservationPeriod, setReservationPeriod }) => {
  if (!analytics) return <p className="text-gray-500">No analytics data available.</p>;

  const allBusinesses = businessReservations?.all_businesses || [];

  return (
    <div className="space-y-8">
      {/* Business Reservations Table with Filter */}
      <div className="bg-white rounded-lg shadow p-6">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <Building2 className="w-6 h-6 text-blue-500" />
            <h2 className="text-lg font-semibold text-gray-800">Reservations by Business</h2>
          </div>
          <div className="flex items-center gap-2">
            <Filter className="w-4 h-4 text-gray-400" />
            <select
              value={reservationPeriod}
              onChange={(e) => setReservationPeriod(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-lg text-sm font-medium bg-white text-gray-700 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 cursor-pointer"
            >
              <option value="today">Today</option>
              <option value="week">This Week</option>
              <option value="month">This Month</option>
              <option value="year">This Year</option>
            </select>
          </div>
        </div>
        
        <p className="text-sm text-gray-500 mb-4">
          Showing reservation counts for: <span className="font-medium">{PERIOD_LABELS[reservationPeriod]}</span>
        </p>

        {allBusinesses.length === 0 ? (
          <p className="text-gray-500 text-center py-8">No businesses found</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-200">
                  <th className="text-left py-3 px-4 text-sm font-semibold text-gray-600">#</th>
                  <th className="text-left py-3 px-4 text-sm font-semibold text-gray-600">Business Name</th>
                  <th className="text-left py-3 px-4 text-sm font-semibold text-gray-600">Subdomain</th>
                  <th className="text-right py-3 px-4 text-sm font-semibold text-gray-600">Reservations</th>
                </tr>
              </thead>
              <tbody>
                {allBusinesses.map((biz, idx) => (
                  <tr key={biz.id} className="border-b border-gray-100 hover:bg-gray-50">
                    <td className="py-3 px-4 text-sm text-gray-500">{idx + 1}</td>
                    <td className="py-3 px-4">
                      <p className="font-medium text-gray-900">{biz.name}</p>
                    </td>
                    <td className="py-3 px-4 text-sm text-gray-500">{biz.subdomain}</td>
                    <td className="py-3 px-4 text-right">
                      <span className={`inline-flex items-center justify-center px-3 py-1 rounded-full text-sm font-semibold ${
                        biz.reservation_count > 0 ? 'bg-blue-100 text-blue-800' : 'bg-gray-100 text-gray-500'
                      }`}>
                        {biz.reservation_count}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

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
