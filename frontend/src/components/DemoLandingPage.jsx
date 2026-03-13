import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Calendar, 
  Clock, 
  CheckCircle, 
  Users, 
  TrendingUp, 
  Sparkles,
  BarChart3,
  Mail,
  MessageCircle,
  ArrowRight
} from 'lucide-react';
import { 
  AreaChart, 
  Area, 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  Legend
} from 'recharts';

// Mock data for demo
const MOCK_DATA = {
  business: {
    name: "Fade District Barbershop",
    subtitle: "(Test Client)"
  },
  stats: [
    { label: "Total Reservations", value: 156, icon: Calendar, color: "border-blue-500", iconColor: "text-blue-500" },
    { label: "Pending", value: 8, icon: Clock, color: "border-yellow-500", iconColor: "text-yellow-500" },
    { label: "Confirmed", value: 142, icon: CheckCircle, color: "border-green-500", iconColor: "text-green-500" },
    { label: "Total Customers", value: 89, icon: Users, color: "border-purple-500", iconColor: "text-purple-500" }
  ],
  reservations: [
    { name: "Klienti A.", phone: "+383 44 xxx xxx", date: "Mar 10, 2026", time: "10:00", status: "pending" },
    { name: "Klienti B.", phone: "+383 44 xxx xxx", date: "Mar 10, 2026", time: "11:30", status: "confirmed" },
    { name: "Klienti C.", phone: "+383 44 xxx xxx", date: "Mar 10, 2026", time: "14:00", status: "pending" },
    { name: "Klienti D.", phone: "+383 44 xxx xxx", date: "Mar 11, 2026", time: "09:00", status: "confirmed" },
    { name: "Klienti E.", phone: "+383 44 xxx xxx", date: "Mar 11, 2026", time: "15:30", status: "confirmed" },
    { name: "Klienti F.", phone: "+383 44 xxx xxx", date: "Mar 12, 2026", time: "10:30", status: "pending" },
    { name: "Klienti G.", phone: "+383 44 xxx xxx", date: "Mar 12, 2026", time: "13:00", status: "confirmed" },
    { name: "Klienti H.", phone: "+383 44 xxx xxx", date: "Mar 13, 2026", time: "11:00", status: "confirmed" }
  ],
  businessGrowth: [
    { month: 'Tet', businesses: 0 },
    { month: 'Nën', businesses: 0 },
    { month: 'Dhj', businesses: 0.5 },
    { month: 'Jan', businesses: 2 },
    { month: 'Shk', businesses: 1.2 },
    { month: 'Mar', businesses: 0.3 }
  ],
  reservationTrends: [
    { month: 'Tet', confirmed: 0, pending: 0, canceled: 0 },
    { month: 'Nën', confirmed: 0, pending: 0, canceled: 0 },
    { month: 'Dhj', confirmed: 45, pending: 5, canceled: 2 },
    { month: 'Jan', confirmed: 18, pending: 3, canceled: 1 },
    { month: 'Shk', confirmed: 0, pending: 0, canceled: 0 },
    { month: 'Mar', confirmed: 0, pending: 0, canceled: 0 }
  ]
};

const DemoLandingPage = () => {
  const navigate = useNavigate();
  const [filter, setFilter] = useState('all');

  const filteredReservations = filter === 'all' 
    ? MOCK_DATA.reservations 
    : MOCK_DATA.reservations.filter(r => r.status === filter);

  const scrollToDashboard = () => {
    document.getElementById('dashboard-preview').scrollIntoView({ 
      behavior: 'smooth' 
    });
  };

  return (
    <div className="min-h-screen">
      {/* Hero Section - Dark Creative */}
      <div className="relative min-h-screen bg-black text-white overflow-hidden">
        {/* Animated Background Gradient */}
        <div className="absolute inset-0 opacity-30">
          <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-blue-500 rounded-full filter blur-3xl animate-pulse"></div>
          <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-purple-500 rounded-full filter blur-3xl animate-pulse"></div>
        </div>

        {/* Navigation */}
        <nav className="relative z-10 flex justify-between items-center px-8 py-6">
          <img src="/logo+text.png" alt="Reservo" className="h-16 w-auto" />
          <button
            onClick={() => navigate('/login')}
            className="px-6 py-2 bg-white text-black rounded-full font-medium hover:bg-gray-200 transition-colors"
          >
            Kyçu
          </button>
        </nav>

        {/* Hero Content */}
        <div className="relative z-10 flex flex-col items-center justify-center min-h-[80vh] px-6 text-center">
          <div className="mb-6 px-4 py-2 bg-white/10 backdrop-blur-sm rounded-full text-sm">
            ✨ Sistemi më i ri i rezervimeve
          </div>
          
          <h1 className="text-5xl md:text-7xl font-bold mb-6 leading-tight">
            A jeni gati për të<br />
            <span className="bg-gradient-to-r from-blue-400 via-purple-400 to-pink-400 bg-clip-text text-transparent">
              dixhitalizuar
            </span><br />
            biznesin tuaj?
          </h1>
          
          <p className="text-lg md:text-xl text-gray-400 mb-12 max-w-2xl">
            Menaxhoni rezervimet tuaja në mënyrë profesionale.<br />
            Automatizoni njoftimet. Rritni efikasitetin.
          </p>

          <div className="flex gap-4 mb-16">
            <button
              onClick={scrollToDashboard}
              className="px-8 py-4 bg-white text-black rounded-full font-semibold text-lg hover:bg-gray-200 transition-all transform hover:scale-105"
            >
              Shiko Demo
            </button>
            <button
              onClick={() => navigate('/login')}
              className="px-8 py-4 bg-white/10 backdrop-blur-sm text-white rounded-full font-semibold text-lg hover:bg-white/20 transition-all border border-white/20"
            >
              Fillo Tani
            </button>
          </div>

          {/* Notification Workflow */}
          <div className="max-w-4xl mx-auto mb-16">
            <h3 className="text-xl md:text-2xl font-semibold mb-8 text-gray-300">
              Si Funksionon Automatizimi
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {/* Step 1: Customer Books */}
              <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-xl p-6 hover:bg-white/10 transition-all">
                <div className="w-12 h-12 bg-blue-500/20 rounded-full flex items-center justify-center mb-4 mx-auto">
                  <Calendar className="w-6 h-6 text-blue-400" />
                </div>
                <h4 className="font-semibold text-lg mb-2">1. Klienti Rezervon</h4>
                <p className="text-gray-400 text-sm">
                  Klienti plotëson formularin në faqen tuaj të rezervimeve
                </p>
              </div>

              {/* Step 2: Email to Owner */}
              <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-xl p-6 hover:bg-white/10 transition-all">
                <div className="w-12 h-12 bg-purple-500/20 rounded-full flex items-center justify-center mb-4 mx-auto">
                  <Mail className="w-6 h-6 text-purple-400" />
                </div>
                <h4 className="font-semibold text-lg mb-2">2. Email Automatik</h4>
                <p className="text-gray-400 text-sm">
                  Ju merrni email menjëherë me detajet e rezervimit
                </p>
              </div>

              {/* Step 3: WhatsApp to Customer */}
              <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-xl p-6 hover:bg-white/10 transition-all">
                <div className="w-12 h-12 bg-green-500/20 rounded-full flex items-center justify-center mb-4 mx-auto">
                  <MessageCircle className="w-6 h-6 text-green-400" />
                </div>
                <h4 className="font-semibold text-lg mb-2">3. WhatsApp Konfirmim</h4>
                <p className="text-gray-400 text-sm">
                  Klienti merr WhatsApp kur ju pranoni/refuzoni
                </p>
              </div>
            </div>

            {/* Workflow Arrow */}
            <div className="flex items-center justify-center gap-4 mt-8 text-gray-500">
              <div className="flex items-center gap-2">
                <span className="text-sm">Rezervim</span>
                <ArrowRight className="w-4 h-4" />
                <span className="text-sm">Email</span>
                <ArrowRight className="w-4 h-4" />
                <span className="text-sm">WhatsApp</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Dashboard Preview Section */}
      <div id="dashboard-preview" className="bg-gray-50">
        {/* Demo Banner */}
        <div className="bg-gradient-to-r from-indigo-600 via-blue-600 to-purple-600 text-white text-center py-3 px-4 text-sm font-medium tracking-wide flex items-center justify-center gap-2">
          <Sparkles className="w-4 h-4" />
          Kjo është një DEMO e Panelit tuaj të Biznesit • Provojeni FALAS për 30 ditë!
          <Sparkles className="w-4 h-4" />
        </div>

        {/* Header */}
        <div className="max-w-7xl mx-auto px-6 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center text-white font-bold text-xl shadow-md">
                FD
              </div>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">
                  {MOCK_DATA.business.name}{' '}
                  <span className="text-sm font-bold text-gray-400">{MOCK_DATA.business.subtitle}</span>
                </h1>
                <p className="text-sm text-gray-500">Business Owner Dashboard</p>
              </div>
            </div>
            <button
              onClick={() => navigate('/login')}
              className="bg-indigo-600 hover:bg-indigo-700 text-white px-6 py-2.5 rounded-full font-medium transition-colors shadow-md"
            >
              Get Started
            </button>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="max-w-7xl mx-auto px-6 pb-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {MOCK_DATA.stats.map((stat) => {
              const Icon = stat.icon;
              return (
                <div
                  key={stat.label}
                  className={`bg-white rounded-xl p-5 shadow-sm border-l-4 ${stat.color} flex items-center justify-between hover:shadow-md transition-shadow`}
                >
                  <div>
                    <p className="text-sm text-gray-500">{stat.label}</p>
                    <p className="text-3xl font-bold text-gray-900 mt-1">{stat.value}</p>
                  </div>
                  <Icon className={`w-10 h-10 ${stat.iconColor} opacity-80`} />
                </div>
              );
            })}
          </div>
        </div>

        {/* Reservations Table */}
        <div className="max-w-7xl mx-auto px-6 pb-10">
          <div className="bg-white rounded-xl shadow-sm p-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold text-gray-900">Recent Reservations</h2>
              <div className="flex gap-2">
                {[
                  { key: 'all', label: 'All' },
                  { key: 'pending', label: 'Pending' },
                  { key: 'confirmed', label: 'Confirmed' }
                ].map((f) => (
                  <button
                    key={f.key}
                    onClick={() => setFilter(f.key)}
                    className={`px-4 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                      filter === f.key
                        ? 'bg-indigo-600 text-white'
                        : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                    }`}
                  >
                    {f.label}
                  </button>
                ))}
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="text-left text-xs text-gray-400 uppercase tracking-wider border-b border-gray-100">
                    <th className="pb-3 font-semibold">Customer</th>
                    <th className="pb-3 font-semibold">Phone</th>
                    <th className="pb-3 font-semibold">Date</th>
                    <th className="pb-3 font-semibold">Time</th>
                    <th className="pb-3 font-semibold">Status</th>
                    <th className="pb-3 font-semibold">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredReservations.map((r, i) => (
                    <tr key={i} className="border-b border-gray-50 last:border-0 hover:bg-gray-50 transition-colors">
                      <td className="py-4 text-sm font-medium text-gray-900">{r.name}</td>
                      <td className="py-4 text-sm text-gray-600">{r.phone}</td>
                      <td className="py-4 text-sm text-gray-600">{r.date}</td>
                      <td className="py-4 text-sm text-gray-600">{r.time}</td>
                      <td className="py-4">
                        <span
                          className={`inline-block px-3 py-1 rounded-full text-xs font-medium ${
                            r.status === 'confirmed'
                              ? 'bg-green-100 text-green-700'
                              : 'bg-yellow-100 text-yellow-700'
                          }`}
                        >
                          {r.status}
                        </span>
                      </td>
                      <td className="py-4 text-sm">
                        {r.status === 'pending' ? (
                          <div className="flex gap-3">
                            <button className="text-green-600 font-medium hover:underline">Accept</button>
                            <button className="text-red-500 font-medium hover:underline">Reject</button>
                          </div>
                        ) : (
                          <span className="text-gray-300">—</span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* Analytics Charts */}
        <div className="max-w-7xl mx-auto px-6 pb-10">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Business Growth Chart */}
            <div className="bg-white rounded-xl shadow-sm p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-bold text-gray-900">Rritja e Biznesit</h2>
                <BarChart3 className="w-5 h-5 text-gray-400" />
              </div>
              <ResponsiveContainer width="100%" height={300}>
                <AreaChart data={MOCK_DATA.businessGrowth}>
                  <defs>
                    <linearGradient id="colorBusinesses" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#3B82F6" stopOpacity={0.3}/>
                      <stop offset="95%" stopColor="#3B82F6" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                  <XAxis 
                    dataKey="month" 
                    stroke="#9CA3AF"
                    style={{ fontSize: '12px' }}
                  />
                  <YAxis 
                    stroke="#9CA3AF"
                    style={{ fontSize: '12px' }}
                  />
                  <Tooltip 
                    contentStyle={{ 
                      backgroundColor: 'white', 
                      border: '1px solid #e5e7eb',
                      borderRadius: '8px',
                      fontSize: '14px'
                    }}
                    labelStyle={{ color: '#374151', fontWeight: 'bold' }}
                    formatter={(value) => [`${value}`, 'biznese']}
                  />
                  <Area 
                    type="monotone" 
                    dataKey="businesses" 
                    stroke="#3B82F6" 
                    strokeWidth={2}
                    fillOpacity={1} 
                    fill="url(#colorBusinesses)" 
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>

            {/* Reservation Trends Chart */}
            <div className="bg-white rounded-xl shadow-sm p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-bold text-gray-900">Tendencat e Rezervimeve</h2>
                <Calendar className="w-5 h-5 text-gray-400" />
              </div>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={MOCK_DATA.reservationTrends}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                  <XAxis 
                    dataKey="month" 
                    stroke="#9CA3AF"
                    style={{ fontSize: '12px' }}
                  />
                  <YAxis 
                    stroke="#9CA3AF"
                    style={{ fontSize: '12px' }}
                  />
                  <Tooltip 
                    contentStyle={{ 
                      backgroundColor: 'white', 
                      border: '1px solid #e5e7eb',
                      borderRadius: '8px',
                      fontSize: '14px'
                    }}
                    labelStyle={{ color: '#374151', fontWeight: 'bold' }}
                  />
                  <Legend 
                    wrapperStyle={{ fontSize: '14px', paddingTop: '20px' }}
                    formatter={(value) => {
                      const labels = {
                        confirmed: 'Konfirmuar',
                        pending: 'Në pritje',
                        canceled: 'Anuluar'
                      };
                      return labels[value] || value;
                    }}
                  />
                  <Bar dataKey="confirmed" fill="#10B981" radius={[4, 4, 0, 0]} />
                  <Bar dataKey="pending" fill="#F59E0B" radius={[4, 4, 0, 0]} />
                  <Bar dataKey="canceled" fill="#EF4444" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>

        {/* CTA Section */}
        <div className="max-w-7xl mx-auto px-6 pb-16">
          <div className="bg-gradient-to-br from-blue-600 via-indigo-600 to-purple-700 rounded-2xl p-12 text-center text-white shadow-xl">
            <TrendingUp className="w-12 h-12 mx-auto mb-5 opacity-90" />
            <h2 className="text-3xl font-bold mb-3">Gati për të Rritur Biznesin Tuaj?</h2>
            <p className="text-lg opacity-90 mb-8">
              Filloni të menaxhoni rezervimet tuaja në mënyrë profesionale sot!
            </p>
            <p className="text-sm opacity-90 mt-6">
              Nuk kërkohet kartë krediti • Na kontaktoni për bashkëpunim: <span className="font-bold">+383 45 853 844</span>
            </p>
          </div>
        </div>

        {/* Footer */}
        <div className="bg-gray-900 text-gray-400 py-8">
          <div className="max-w-7xl mx-auto px-6">
            <div className="flex flex-col md:flex-row justify-between items-center gap-4">
              <div className="text-sm">
                © Reservo 2026
              </div>
              <div className="flex gap-6 text-sm">
                <button
                  onClick={() => navigate('/terms')}
                  className="hover:text-white transition-colors"
                >
                  Kushtet e Shërbimit
                </button>
                <button
                  onClick={() => navigate('/privacy')}
                  className="hover:text-white transition-colors"
                >
                  Politika e Privatësisë
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DemoLandingPage;
