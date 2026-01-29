import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../auth/authStore';
import api from '../../api/axios';
import { LoadingSpinner, Modal, Table } from '../ui';

const BusinessManagement = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [businesses, setBusinesses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedBusiness, setSelectedBusiness] = useState(null);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showStatsModal, setShowStatsModal] = useState(false);
  const [businessStats, setBusinessStats] = useState(null);

  useEffect(() => {
    if (!user?.is_super_admin) {
      navigate('/login');
      return;
    }
    fetchBusinesses();
  }, [user, navigate]);

  const fetchBusinesses = async () => {
    try {
      const response = await api.get('businesses/');
      setBusinesses(response.data);
    } catch (error) {
      console.error('Error fetching businesses:', error);
    }
    setLoading(false);
  };

  const handleToggleStatus = async (business) => {
    try {
      const endpoint = business.is_active ? 'deactivate' : 'activate';
      await api.post(`businesses/${business.id}/${endpoint}/`);
      fetchBusinesses();
    } catch (error) {
      console.error('Error toggling business status:', error);
    }
  };

  const handleViewStats = async (business) => {
    try {
      const response = await api.get(`businesses/${business.id}/stats/`);
      setBusinessStats(response.data);
      setSelectedBusiness(business);
      setShowStatsModal(true);
    } catch (error) {
      console.error('Error fetching business stats:', error);
    }
  };

  const formatTime = (t) => (t ? String(t).slice(0, 5) : '—');
  const formatDate = (d) => (d ? new Date(d).toLocaleDateString() : '—');

  const columns = [
    {
      header: 'Name',
      accessor: 'name',
      render: (b) => (
        <div>
          <div className="font-medium text-gray-900">{b.name}</div>
          <div className="text-xs text-gray-500">{b.subdomain}</div>
        </div>
      )
    },
    {
      header: 'Domain',
      accessor: 'full_domain',
      render: (b) => <span className="text-sm">{b.full_domain || '—'}</span>
    },
    {
      header: 'Email',
      accessor: 'email',
      render: (b) => <span className="text-sm">{b.email}</span>
    },
    {
      header: 'Phone',
      accessor: 'phone',
      render: (b) => <span className="text-sm">{b.phone || '—'}</span>
    },
    {
      header: 'Hours',
      accessor: 'hours',
      render: (b) => (
        <span className="text-sm">
          {formatTime(b.business_hours_start)} – {formatTime(b.business_hours_end)}
        </span>
      )
    },
    {
      header: 'Timezone',
      accessor: 'timezone',
      render: (b) => <span className="text-sm">{b.timezone || '—'}</span>
    },
    {
      header: 'Email From',
      accessor: 'email_from_name',
      render: (b) => (
        <div>
          <div className="text-sm">{b.email_from_name || '—'}</div>
          {b.email_from_address && (
            <div className="text-xs text-gray-500">{b.email_from_address}</div>
          )}
        </div>
      )
    },
    {
      header: 'Brand',
      accessor: 'primary_color',
      render: (b) => (
        <div className="flex items-center gap-2">
          {b.primary_color && (
            <span
              className="inline-block w-5 h-5 rounded border border-gray-300"
              style={{ backgroundColor: b.primary_color }}
              title={b.primary_color}
            />
          )}
          {b.logo_url ? (
            <a href={b.logo_url} target="_blank" rel="noopener noreferrer" className="text-blue-600 text-xs truncate max-w-[80px]">
              Logo
            </a>
          ) : (
            <span className="text-gray-400 text-xs">—</span>
          )}
        </div>
      )
    },
    {
      header: 'Users',
      accessor: 'user_count',
      render: (b) => <span className="text-sm">{b.user_count ?? 0}</span>
    },
    {
      header: 'Reservations',
      accessor: 'reservation_count',
      render: (b) => <span className="text-sm">{b.reservation_count ?? 0}</span>
    },
    {
      header: 'Status',
      accessor: 'is_active',
      render: (b) => (
        <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
          b.is_active ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
        }`}>
          {b.is_active ? 'Active' : 'Inactive'}
        </span>
      )
    },
    {
      header: 'Subscription',
      accessor: 'subscription_status',
      render: (b) => (
        <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
          b.subscription_status === 'active' ? 'bg-blue-100 text-blue-800' :
          b.subscription_status === 'suspended' ? 'bg-red-100 text-red-800' :
          'bg-yellow-100 text-yellow-800'
        }`}>
          {b.subscription_status}
        </span>
      )
    },
    {
      header: 'Sub. expires',
      accessor: 'subscription_expires',
      render: (b) => <span className="text-sm">{formatDate(b.subscription_expires)}</span>
    },
    {
      header: 'Created',
      accessor: 'created_at',
      render: (b) => <span className="text-sm text-gray-600">{formatDate(b.created_at)}</span>
    },
    {
      header: 'Updated',
      accessor: 'updated_at',
      render: (b) => <span className="text-sm text-gray-600">{formatDate(b.updated_at)}</span>
    },
    {
      header: 'Actions',
      accessor: 'actions',
      render: (business) => (
        <div className="flex space-x-2">
          <button
            onClick={() => handleViewStats(business)}
            className="text-blue-600 hover:text-blue-800 text-sm font-medium"
          >
            Stats
          </button>
          <button
            onClick={() => handleToggleStatus(business)}
            className={`text-sm font-medium ${
              business.is_active ? 'text-red-600 hover:text-red-800' : 'text-green-600 hover:text-green-800'
            }`}
          >
            {business.is_active ? 'Deactivate' : 'Activate'}
          </button>
        </div>
      )
    }
  ];

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
              <button
                onClick={() => navigate('/superadmin')}
                className="text-blue-600 hover:text-blue-800 text-sm font-medium mb-2"
              >
                ← Back to My Dashboard
              </button>
              <h1 className="text-2xl font-bold text-gray-900">Business Management</h1>
              <p className="text-gray-600">Manage all businesses on the platform</p>
            </div>
            <button
              onClick={() => setShowCreateModal(true)}
              className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition duration-200"
            >
              Create Business
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 py-8">
        <div className="bg-white rounded-lg shadow">
          <Table
            title={`Businesses (${businesses.length})`}
            data={businesses}
            columns={columns}
            emptyMessage="No businesses found"
          />
        </div>
      </div>

      {/* Create Business Modal */}
      <Modal
        isOpen={showCreateModal}
        onClose={() => setShowCreateModal(false)}
        title="Create New Business"
      >
        <CreateBusinessForm
          onSuccess={() => {
            setShowCreateModal(false);
            fetchBusinesses();
          }}
          onCancel={() => setShowCreateModal(false)}
        />
      </Modal>

      {/* Business Stats Modal */}
      <Modal
        isOpen={showStatsModal}
        onClose={() => setShowStatsModal(false)}
        title={`${selectedBusiness?.name} Statistics`}
      >
        {businessStats && (
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-gray-50 p-4 rounded-lg">
                <h3 className="font-medium text-gray-900">Total Users</h3>
                <p className="text-2xl font-bold text-blue-600">{businessStats.total_users}</p>
              </div>
              <div className="bg-gray-50 p-4 rounded-lg">
                <h3 className="font-medium text-gray-900">Total Reservations</h3>
                <p className="text-2xl font-bold text-green-600">{businessStats.total_reservations}</p>
              </div>
              <div className="bg-gray-50 p-4 rounded-lg">
                <h3 className="font-medium text-gray-900">Pending</h3>
                <p className="text-2xl font-bold text-yellow-600">{businessStats.pending_reservations}</p>
              </div>
              <div className="bg-gray-50 p-4 rounded-lg">
                <h3 className="font-medium text-gray-900">Confirmed</h3>
                <p className="text-2xl font-bold text-purple-600">{businessStats.confirmed_reservations}</p>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-gray-50 p-4 rounded-lg">
                <h3 className="font-medium text-gray-900">Last 7 Days</h3>
                <p className="text-2xl font-bold text-indigo-600">{businessStats.reservations_last_7_days}</p>
              </div>
              <div className="bg-gray-50 p-4 rounded-lg">
                <h3 className="font-medium text-gray-900">Last 30 Days</h3>
                <p className="text-2xl font-bold text-pink-600">{businessStats.reservations_last_30_days}</p>
              </div>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
};

const CreateBusinessForm = ({ onSuccess, onCancel }) => {
  const [formData, setFormData] = useState({
    name: '',
    subdomain: '',
    email: '',
    phone: '',
    business_hours_start: '09:00',
    business_hours_end: '18:00',
    timezone: 'Europe/Berlin',
    email_from_name: '',
    email_from_address: '',
    primary_color: '#3B82F6',
    logo_url: ''
  });
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    
    try {
      await api.post('businesses/', formData);
      onSuccess();
    } catch (error) {
      console.error('Error creating business:', error);
    }
    setLoading(false);
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Business Name</label>
          <input
            type="text"
            name="name"
            value={formData.name}
            onChange={handleChange}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            required
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Subdomain</label>
          <input
            type="text"
            name="subdomain"
            value={formData.subdomain}
            onChange={handleChange}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            placeholder="salon"
            required
          />
          <p className="text-xs text-gray-500 mt-1">{formData.subdomain}.yourdomain.com</p>
        </div>
      </div>
      
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
          <input
            type="email"
            name="email"
            value={formData.email}
            onChange={handleChange}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            required
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Phone</label>
          <input
            type="tel"
            name="phone"
            value={formData.phone}
            onChange={handleChange}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Opening Time</label>
          <input
            type="time"
            name="business_hours_start"
            value={formData.business_hours_start}
            onChange={handleChange}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Closing Time</label>
          <input
            type="time"
            name="business_hours_end"
            value={formData.business_hours_end}
            onChange={handleChange}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Timezone</label>
        <input
          type="text"
          name="timezone"
          value={formData.timezone}
          onChange={handleChange}
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          placeholder="Europe/Berlin"
        />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Email From Name</label>
          <input
            type="text"
            name="email_from_name"
            value={formData.email_from_name}
            onChange={handleChange}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            placeholder="Business Name"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Email From Address (optional)</label>
          <input
            type="email"
            name="email_from_address"
            value={formData.email_from_address}
            onChange={handleChange}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            placeholder="noreply@example.com"
          />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Primary Color</label>
          <div className="flex items-center gap-2">
            <input
              type="color"
              name="primary_color"
              value={formData.primary_color}
              onChange={handleChange}
              className="h-10 w-14 rounded border border-gray-300 cursor-pointer"
            />
            <input
              type="text"
              value={formData.primary_color}
              onChange={(e) => setFormData((prev) => ({ ...prev, primary_color: e.target.value }))}
              className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="#3B82F6"
            />
          </div>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Logo URL (optional)</label>
          <input
            type="url"
            name="logo_url"
            value={formData.logo_url}
            onChange={handleChange}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            placeholder="https://..."
          />
        </div>
      </div>

      <div className="flex justify-end space-x-3 pt-4">
        <button
          type="button"
          onClick={onCancel}
          className="px-4 py-2 text-gray-600 border border-gray-300 rounded-md hover:bg-gray-50"
        >
          Cancel
        </button>
        <button
          type="submit"
          disabled={loading}
          className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:bg-blue-400"
        >
          {loading ? 'Creating...' : 'Create Business'}
        </button>
      </div>
    </form>
  );
};

export default BusinessManagement;