import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../auth/authStore';
import { useReservations } from '../../hooks/useReservations';
import { LoadingSpinner } from '../ui';
import ReservationList from '../reservations/ReservationList';
import StaffManagement from './StaffManagement';
import {
  LayoutDashboard, Calendar, Users, BarChart3, LogOut,
  Copy, ExternalLink
} from 'lucide-react';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, Cell
} from 'recharts';

const TABS = [
  { id: 'overview',      label: 'Përmbledhje',  icon: LayoutDashboard },
  { id: 'reservations',  label: 'Rezervimet',   icon: Calendar },
  { id: 'staff',         label: 'Stafi',        icon: Users },
  { id: 'analytics',     label: 'Analitika',    icon: BarChart3 },
];

const MONTH_NAMES = ['Jan','Shk','Mar','Pri','Maj','Qer','Kor','Gus','Sht','Tet','Nën','Dhj'];

const BusinessDashboard = () => {
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const { reservations, allReservations, loading, filterStatus, setFilterStatus, refreshReservations } = useReservations();
  const [activeTab, setActiveTab] = useState('overview');
  const [stats, setStats] = useState({ total: 0, pending: 0, confirmed: 0, completed: 0, canceled: 0 });

  useEffect(() => {
    if (!user?.is_business_owner || !user?.business_details) { navigate('/login'); return; }
  }, [user, navigate]);

  useEffect(() => {
    const interval = setInterval(refreshReservations, 5 * 60 * 1000);
    return () => clearInterval(interval);
  }, [refreshReservations]);

  useEffect(() => {
    if (allReservations) {
      const s = allReservations.reduce(
        (acc, r) => { acc.total++; acc[r.status] = (acc[r.status] || 0) + 1; return acc; },
        { total: 0, pending: 0, confirmed: 0, completed: 0, canceled: 0 }
      );
      setStats(s);
    }
  }, [allReservations]);

  // Analytics: reservations by month
  const byMonth = (() => {
    const map = {};
    (allReservations || []).forEach(r => {
      const d = new Date(r.start_time);
      const key = `${d.getFullYear()}-${d.getMonth()}`;
      if (!map[key]) map[key] = { month: MONTH_NAMES[d.getMonth()], total: 0, year: d.getFullYear(), idx: d.getMonth() };
      map[key].total++;
    });
    return Object.values(map).sort((a, b) => a.year !== b.year ? a.year - b.year : a.idx - b.idx);
  })();

  // Analytics: reservations by hour
  const byHour = (() => {
    const map = {};
    for (let h = 0; h < 24; h++) map[h] = { hour: `${String(h).padStart(2,'0')}:00`, total: 0 };
    (allReservations || []).forEach(r => {
      const h = new Date(r.start_time).getHours();
      map[h].total++;
    });
    return Object.values(map).filter(h => h.total > 0 || (h.hour >= '08:00' && h.hour <= '20:00'));
  })();

  const maxMonth = byMonth.reduce((m, x) => x.total > m ? x.total : m, 0);

  if (loading) return <LoadingSpinner fullScreen />;

  const biz = user?.business_details;
  const domain = biz?.full_domain || (biz?.subdomain ? `${biz.subdomain}.yourdomain.com` : null);
  const bookingUrl = domain ? `https://${domain}` : '';

  // Build absolute logo URL — backend may return a relative path like /media/...
  const API_BASE = (process.env.REACT_APP_API_URL || 'http://localhost:8000/api/').replace(/\/api\/?$/, '');
  const rawLogo = biz?.logo || biz?.logo_url || null;
  const logoSrc = rawLogo
    ? (rawLogo.startsWith('http') ? rawLogo : `${API_BASE}${rawLogo}`)
    : null;

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow">
        <div className="w-full px-8 py-4">
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-4">
              {logoSrc && (
                <img
                  src={logoSrc}
                  alt={biz?.name}
                  className="h-14 w-auto object-contain rounded"
                  onError={e => { e.target.style.display = 'none'; }}
                />
              )}
              <div>
                <p className="text-sm font-bold text-gray-900">Mirë se vini, {user?.first_name}</p>
                <p className="text-sm text-gray-900 mt-0.5">Menaxhoni klientët e {biz?.name}</p>
              </div>
            </div>
            <button onClick={() => { logout(); navigate('/login'); }}
              className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg flex items-center gap-2 text-sm font-medium">
              <LogOut className="w-4 h-4" />
              <span>Dilni</span>
            </button>
          </div>

          {/* Tabs */}
          <div className="flex space-x-2 mt-6 border-b border-gray-200">
            {TABS.map(tab => {
              const Icon = tab.icon;
              return (
                <button key={tab.id} onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center gap-2 px-6 py-3 text-base font-medium border-b-2 transition-colors ${
                    activeTab === tab.id
                      ? 'border-blue-600 text-blue-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}>
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
            bookingUrl={bookingUrl}
            reservations={allReservations || []}
            byMonth={byMonth}
            byHour={byHour}
            maxMonth={maxMonth}
            setActiveTab={setActiveTab}
          />
        )}
        {activeTab === 'reservations' && (
          <ReservationsTab
            reservations={reservations}
            filterStatus={filterStatus}
            setFilterStatus={setFilterStatus}
            refreshReservations={refreshReservations}
          />
        )}
        {activeTab === 'staff' && <StaffManagement />}
        {activeTab === 'analytics' && <AnalyticsTab byMonth={byMonth} byHour={byHour} maxMonth={maxMonth} />}
      </div>
    </div>
  );
};

/* ── Overview Tab ── */
const OverviewTab = ({ stats, bookingUrl, reservations, byMonth, byHour, maxMonth, setActiveTab }) => (
  <div className="space-y-8">
    {/* Stat cards */}
    <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
      {[
        { label: 'Gjithsej', value: stats.total, color: 'bg-blue-500', status: 'all' },
        { label: 'Në pritje', value: stats.pending, color: 'bg-yellow-500', status: 'pending' },
        { label: 'Konfirmuar', value: stats.confirmed, color: 'bg-green-500', status: 'confirmed' },
        { label: 'Përfunduar', value: stats.completed, color: 'bg-purple-500', status: 'completed' },
        { label: 'Anuluar', value: stats.canceled, color: 'bg-red-500', status: 'canceled' },
      ].map(c => (
        <div key={c.status} onClick={() => setActiveTab('reservations')}
          className="bg-white rounded-lg shadow p-6 cursor-pointer hover:shadow-lg transition">
          <div className={`${c.color} rounded-lg p-3 text-white w-fit mb-3`}>
            <Calendar className="w-6 h-6" />
          </div>
          <p className="text-sm font-medium text-gray-500">{c.label}</p>
          <p className="text-3xl font-bold text-gray-900 mt-1">{c.value}</p>
        </div>
      ))}
    </div>

    {/* Booking link */}
    <BookingLinkCard bookingUrl={bookingUrl} />

    {/* Staff */}
    <StaffManagement />

    {/* Analytics preview */}
    <AnalyticsTab byMonth={byMonth} byHour={byHour} maxMonth={maxMonth} />
  </div>
);

/* ── Booking Link Card ── */
const BookingLinkCard = ({ bookingUrl }) => (
  <div className="bg-white rounded-lg shadow p-6">
    <div className="flex justify-between items-start">
      <div className="flex-1">
        <h2 className="text-xl font-bold text-gray-900 mb-1">Linku i rezervimit për klientët tuaj</h2>
        <p className="text-gray-500 mb-4">Ndajeni këtë link me klientët tuaj – nuk kërkohet hyrje:</p>
        <div className="bg-gray-50 px-4 py-3 rounded-lg border border-gray-200 inline-block">
          <code className="text-blue-600 font-mono text-sm">{bookingUrl || 'Linku nuk është i disponueshëm'}</code>
        </div>
      </div>
      <div className="flex gap-2 ml-6">
        <button onClick={() => navigator.clipboard.writeText(bookingUrl)}
          className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg flex items-center gap-2 text-sm">
          <Copy className="w-4 h-4" />
          Kopjo
        </button>
        <button onClick={() => window.open(bookingUrl, '_blank')}
          className="bg-gray-700 hover:bg-gray-800 text-white px-4 py-2 rounded-lg flex items-center gap-2 text-sm">
          <ExternalLink className="w-4 h-4" />
          Shiko
        </button>
      </div>
    </div>
  </div>
);

/* ── Reservations Tab ── */
const ReservationsTab = ({ reservations, filterStatus, setFilterStatus, refreshReservations }) => (
  <div>
    <div className="flex justify-between items-center mb-6">
      <h2 className="text-2xl font-bold text-gray-900">Rezervimet e klientëve</h2>
      <div className="flex items-center gap-3">
        <select value={filterStatus} onChange={e => setFilterStatus(e.target.value)}
          className="px-5 py-2.5 border-2 border-gray-300 rounded-lg text-base font-medium bg-white text-gray-700 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 min-w-[160px] cursor-pointer shadow-sm">
          <option value="all">Të gjitha</option>
          <option value="pending">Në pritje</option>
          <option value="confirmed">Konfirmuar</option>
          <option value="completed">Përfunduar</option>
          <option value="canceled">Anuluar</option>
        </select>
        <button onClick={refreshReservations}
          className="text-base text-blue-600 hover:text-blue-800 border-2 border-blue-200 px-4 py-2.5 rounded-lg hover:bg-blue-50 font-medium shadow-sm">
          ↻ Rifresko
        </button>
      </div>
    </div>
    <ReservationList reservations={reservations} showBusinessInfo={false} onStatusChange={refreshReservations} />
  </div>
);

/* ── Analytics Tab ── */
const AnalyticsTab = ({ byMonth, byHour, maxMonth }) => (
  <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
    {/* Reservations by month */}
    <div className="bg-white rounded-lg shadow p-6">
      <h2 className="text-xl font-bold text-gray-800 mb-1">Rezervimet sipas muajit</h2>
      <p className="text-sm text-gray-500 mb-4">Cili muaj kishte më shumë klientë</p>
      {byMonth.length === 0 ? (
        <p className="text-gray-400 text-center py-12">Nuk ka të dhëna ende</p>
      ) : (
        <ResponsiveContainer width="100%" height={280}>
          <BarChart data={byMonth}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="month" />
            <YAxis allowDecimals={false} />
            <Tooltip formatter={(v) => [`${v} rezervime`, 'Totali']} />
            <Bar dataKey="total" radius={[4,4,0,0]}>
              {byMonth.map((entry, i) => (
                <Cell key={i} fill={entry.total === maxMonth ? '#3B82F6' : '#93C5FD'} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      )}
    </div>

    {/* Reservations by hour */}
    <div className="bg-white rounded-lg shadow p-6">
      <h2 className="text-xl font-bold text-gray-800 mb-1">Orët më të ngarkuara</h2>
      <p className="text-sm text-gray-500 mb-4">Në cilat orë vijnë më shumë klientë</p>
      {byHour.filter(h => h.total > 0).length === 0 ? (
        <p className="text-gray-400 text-center py-12">Nuk ka të dhëna ende</p>
      ) : (
        <ResponsiveContainer width="100%" height={280}>
          <BarChart data={byHour}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="hour" tick={{ fontSize: 11 }} />
            <YAxis allowDecimals={false} />
            <Tooltip formatter={(v) => [`${v} klientë`, 'Totali']} />
            <Bar dataKey="total" radius={[4,4,0,0]}>
              {byHour.map((entry, i) => {
                const maxH = Math.max(...byHour.map(h => h.total));
                return <Cell key={i} fill={entry.total === maxH && maxH > 0 ? '#10B981' : '#6EE7B7'} />;
              })}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      )}
    </div>
  </div>
);

export default BusinessDashboard;
