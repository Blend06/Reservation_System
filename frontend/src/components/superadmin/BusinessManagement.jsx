import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../auth/authStore';
import api from '../../api/axios';
import { LoadingSpinner, Modal, Table } from '../ui';
import StaffManagement from '../business/StaffManagement';
import { 
  ArrowLeft, 
  Plus, 
  BarChart3, 
  Edit, 
  Power, 
  PowerOff, 
  Trash2, 
  AlertTriangle,
  X
} from 'lucide-react';

const BusinessManagement = ({ embedded = false }) => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [businesses, setBusinesses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedBusiness, setSelectedBusiness] = useState(null);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
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

  const handleEditBusiness = (business) => {
    setSelectedBusiness(business);
    setShowEditModal(true);
  };

  const handleDeleteBusiness = (business) => {
    setSelectedBusiness(business);
    setShowDeleteModal(true);
  };

  const confirmDeleteBusiness = async () => {
    if (!selectedBusiness) return;
    
    try {
      await api.delete(`businesses/${selectedBusiness.id}/`);
      setShowDeleteModal(false);
      setSelectedBusiness(null);
      fetchBusinesses();
    } catch (error) {
      console.error('Error deleting business:', error);
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
      header: 'Type',
      accessor: 'business_type',
      render: (b) => (
        <span className="text-sm capitalize">{b.business_type || '—'}</span>
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
      header: 'Owner Login',
      accessor: 'owner_email',
      render: (b) => <span className="text-sm text-blue-700">{b.owner_email || '—'}</span>
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
            className="text-blue-600 hover:text-blue-800 text-sm font-medium flex items-center space-x-1"
          >
            <BarChart3 className="w-4 h-4" />
            <span>Stats</span>
          </button>
          <button
            onClick={() => handleEditBusiness(business)}
            className="text-indigo-600 hover:text-indigo-800 text-sm font-medium flex items-center space-x-1"
          >
            <Edit className="w-4 h-4" />
            <span>Edit</span>
          </button>
          <button
            onClick={() => handleToggleStatus(business)}
            className={`text-sm font-medium flex items-center space-x-1 ${
              business.is_active ? 'text-red-600 hover:text-red-800' : 'text-green-600 hover:text-green-800'
            }`}
          >
            {business.is_active ? (
              <>
                <PowerOff className="w-4 h-4" />
                <span>Deactivate</span>
              </>
            ) : (
              <>
                <Power className="w-4 h-4" />
                <span>Activate</span>
              </>
            )}
          </button>
          <button
            onClick={() => handleDeleteBusiness(business)}
            className="text-red-600 hover:text-red-800 text-sm font-medium flex items-center space-x-1"
          >
            <Trash2 className="w-4 h-4" />
            <span>Delete</span>
          </button>
        </div>
      )
    }
  ];

  if (loading) {
    return <LoadingSpinner fullScreen />;
  }

  return (
    <div className={embedded ? '' : 'min-h-screen bg-gray-50'}>
      {/* Header - only shown when not embedded */}
      {!embedded && (
      <div className="bg-white shadow">
        <div className="w-full px-8 py-4">
          <div className="flex justify-between items-center">
            <div>
              <button
                onClick={() => navigate('/superadmin')}
                className="text-blue-600 hover:text-blue-800 text-sm font-medium mb-2 flex items-center"
              >
                <ArrowLeft className="w-4 h-4 mr-1" />
                Back to My Dashboard
              </button>
              <h1 className="text-2xl font-bold text-gray-900">Business Management</h1>
              <p className="text-gray-600">Manage all businesses on the platform</p>
            </div>
            <button
              onClick={() => setShowCreateModal(true)}
              className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition duration-200 flex items-center space-x-2"
            >
              <Plus className="w-4 h-4" />
              <span>Create Business</span>
            </button>
          </div>
        </div>
      </div>
      )}

      <div className="w-full px-0 py-4">
        {/* Add Business button when embedded */}
        {embedded && (
          <div className="flex justify-end mb-4">
            <button
              onClick={() => setShowCreateModal(true)}
              className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition duration-200 flex items-center space-x-2"
            >
              <Plus className="w-4 h-4" />
              <span>Add Business</span>
            </button>
          </div>
        )}
        <div className="bg-white rounded-lg shadow overflow-x-auto">
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

      {/* Edit Business Modal */}
      <Modal
        isOpen={showEditModal}
        onClose={() => {
          setShowEditModal(false);
          setSelectedBusiness(null);
        }}
        title="Edit Business"
      >
        {selectedBusiness && (
          <EditBusinessForm
            business={selectedBusiness}
            onSuccess={() => {
              setShowEditModal(false);
              setSelectedBusiness(null);
              fetchBusinesses();
            }}
            onCancel={() => {
              setShowEditModal(false);
              setSelectedBusiness(null);
            }}
          />
        )}
      </Modal>

      {/* Delete Confirmation Modal */}
      <Modal
        isOpen={showDeleteModal}
        onClose={() => {
          setShowDeleteModal(false);
          setSelectedBusiness(null);
        }}
        title="Delete Business"
      >
        {selectedBusiness && (
          <div className="space-y-4">
            <div className="bg-red-50 border border-red-200 rounded-lg p-4">
              <div className="flex">
                <div className="flex-shrink-0">
                  <AlertTriangle className="w-5 h-5 text-red-400" />
                </div>
                <div className="ml-3">
                  <h3 className="text-sm font-medium text-red-800">
                    Are you sure you want to delete this business?
                  </h3>
                  <div className="mt-2 text-sm text-red-700">
                    <p>
                      This will permanently delete <strong>{selectedBusiness.name}</strong> and all associated data including:
                    </p>
                    <ul className="list-disc list-inside mt-2 space-y-1">
                      <li>All business users and their accounts</li>
                      <li>All reservations and booking history</li>
                      <li>All business settings and customizations</li>
                      <li>The subdomain <strong>{selectedBusiness.subdomain}</strong> will become available again</li>
                    </ul>
                    <p className="mt-2 font-medium">This action cannot be undone.</p>
                  </div>
                </div>
              </div>
            </div>
            
            <div className="flex justify-end space-x-3">
              <button
                onClick={() => {
                  setShowDeleteModal(false);
                  setSelectedBusiness(null);
                }}
                className="px-4 py-2 text-gray-600 border border-gray-300 rounded-md hover:bg-gray-50 flex items-center space-x-2"
              >
                <X className="w-4 h-4" />
                <span>Cancel</span>
              </button>
              <button
                onClick={confirmDeleteBusiness}
                className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 flex items-center space-x-2"
              >
                <Trash2 className="w-4 h-4" />
                <span>Delete Business</span>
              </button>
            </div>
          </div>
        )}
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
    business_type: 'other',
    business_hours_start: '09:00',
    business_hours_end: '18:00',
    timezone: 'Europe/Berlin',
    email_from_name: '',
    email_from_address: '',
    primary_color: '#3B82F6',
    logo_url: '',
    logo: null,
    subscription_status: 'active',
    subscription_expires: '',
    // Owner information
    owner_email: '',
    owner_first_name: '',
    owner_last_name: '',
    owner_password: ''
  });
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [logoOption, setLogoOption] = useState('url'); // 'url' or 'file'

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    
    try {
      // Create FormData for file upload support
      const submitData = new FormData();
      
      // Add all text fields
      Object.keys(formData).forEach(key => {
        if (key === 'logo') {
          // Handle file separately
          if (formData.logo) {
            submitData.append('logo', formData.logo);
          }
        } else if (formData[key] !== null && formData[key] !== '') {
          submitData.append(key, formData[key]);
        }
      });
      
      await api.post('businesses/', submitData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      onSuccess();
    } catch (error) {
      console.error('Error creating business:', error);
      const errData = error.response?.data;
      if (errData && typeof errData === 'object') {
        const messages = Object.entries(errData)
          .map(([field, msgs]) => `${field}: ${Array.isArray(msgs) ? msgs.join(', ') : msgs}`)
          .join('\n');
        alert(`Error creating business:\n${messages}`);
      } else {
        alert('Error creating business. Please check all fields.');
      }
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

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      // Validate file type
      if (!file.type.startsWith('image/')) {
        alert('Please select an image file');
        return;
      }
      // Validate file size (max 2MB)
      if (file.size > 2 * 1024 * 1024) {
        alert('File size must be less than 2MB');
        return;
      }
      setFormData(prev => ({
        ...prev,
        logo: file
      }));
    }
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

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Business Type</label>
        <select
          name="business_type"
          value={formData.business_type}
          onChange={handleChange}
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        >
          <option value="barbershop">Barbershop</option>
          <option value="salon">Salon</option>
          <option value="spa">Spa</option>
          <option value="fitness">Fitness</option>
          <option value="clinic">Clinic</option>
          <option value="other">Other</option>
        </select>
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
          <label className="block text-sm font-medium text-gray-700 mb-1">Subscription Expires (optional)</label>
          <input
            type="date"
            name="subscription_expires"
            value={formData.subscription_expires}
            onChange={handleChange}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>
      </div>

      {/* Logo Section - URL or File Upload */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">Business Logo</label>
        <div className="flex gap-4 mb-3">
          <button
            type="button"
            onClick={() => setLogoOption('url')}
            className={`px-4 py-2 rounded-md ${
              logoOption === 'url'
                ? 'bg-blue-600 text-white'
                : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
            }`}
          >
            URL
          </button>
          <button
            type="button"
            onClick={() => setLogoOption('file')}
            className={`px-4 py-2 rounded-md ${
              logoOption === 'file'
                ? 'bg-blue-600 text-white'
                : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
            }`}
          >
            Upload PNG
          </button>
        </div>

        {logoOption === 'url' ? (
          <div>
            <input
              type="url"
              name="logo_url"
              value={formData.logo_url}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="https://example.com/logo.png"
            />
            {formData.logo_url && (
              <div className="mt-2">
                <img 
                  src={formData.logo_url} 
                  alt="Logo preview" 
                  className="h-16 w-auto border border-gray-200 rounded p-2"
                  onError={(e) => {
                    e.target.style.display = 'none';
                  }}
                />
              </div>
            )}
          </div>
        ) : (
          <div>
            <input
              type="file"
              accept="image/png,image/jpeg,image/jpg"
              onChange={handleFileChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
            <p className="text-xs text-gray-500 mt-1">PNG, JPG or JPEG. Max 2MB.</p>
            {formData.logo && (
              <div className="mt-2">
                <p className="text-sm text-green-600">✓ File selected: {formData.logo.name}</p>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Owner Account Information */}
      <div className="border-t pt-4 mt-4">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Business Owner Account</h3>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Owner Email</label>
            <input
              type="email"
              name="owner_email"
              value={formData.owner_email}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="owner@example.com"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Owner Password</label>
            <div className="relative">
              <input
                type={showPassword ? 'text' : 'password'}
                name="owner_password"
                value={formData.owner_password}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="••••••••"
                required
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700"
              >
                {showPassword ? '👁️' : '👁️‍🗨️'}
              </button>
            </div>
          </div>
        </div>
        <div className="grid grid-cols-2 gap-4 mt-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Owner First Name</label>
            <input
              type="text"
              name="owner_first_name"
              value={formData.owner_first_name}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="John"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Owner Last Name</label>
            <input
              type="text"
              name="owner_last_name"
              value={formData.owner_last_name}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="Doe"
              required
            />
          </div>
        </div>
      </div>

      <div className="flex justify-end space-x-3 pt-4">
        <button
          type="button"
          onClick={onCancel}
          className="px-4 py-2 text-gray-600 border border-gray-300 rounded-md hover:bg-gray-50 flex items-center space-x-2"
        >
          <X className="w-4 h-4" />
          <span>Cancel</span>
        </button>
        <button
          type="submit"
          disabled={loading}
          className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:bg-blue-400 flex items-center space-x-2"
        >
          <Plus className="w-4 h-4" />
          <span>{loading ? 'Creating...' : 'Create Business'}</span>
        </button>
      </div>
    </form>
  );
};

const EditBusinessForm = ({ business, onSuccess, onCancel }) => {
  const [formData, setFormData] = useState({
    name: business.name || '',
    subdomain: business.subdomain || '',
    email: business.email || '',
    phone: business.phone || '',
    business_type: business.business_type || 'other',
    business_hours_start: business.business_hours_start || '09:00',
    business_hours_end: business.business_hours_end || '18:00',
    timezone: business.timezone || 'Europe/Berlin',
    email_from_name: business.email_from_name || '',
    email_from_address: business.email_from_address || '',
    primary_color: business.primary_color || '#3B82F6',
    logo_url: business.logo_url || ''
  });
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    
    try {
      await api.put(`businesses/${business.id}/`, formData);
      onSuccess();
    } catch (error) {
      console.error('Error updating business:', error);
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
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Logo URL (optional)
            <span className="text-xs text-gray-500 block">Direct link to business logo image</span>
          </label>
          <input
            type="url"
            name="logo_url"
            value={formData.logo_url}
            onChange={handleChange}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            placeholder="https://example.com/logo.png"
          />
          {formData.logo_url && (
            <div className="mt-2">
              <img 
                src={formData.logo_url} 
                alt="Logo preview" 
                className="h-12 w-auto border border-gray-200 rounded"
                onError={(e) => {
                  e.target.style.display = 'none';
                }}
              />
            </div>
          )}
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Business Type</label>
        <select
          name="business_type"
          value={formData.business_type}
          onChange={handleChange}
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        >
          <option value="barbershop">Barbershop</option>
          <option value="salon">Salon</option>
          <option value="spa">Spa</option>
          <option value="fitness">Fitness</option>
          <option value="clinic">Clinic</option>
          <option value="other">Other</option>
        </select>
      </div>

      <div className="border-t pt-4 mt-2">
        <StaffManagement businessId={business.id} />
      </div>

      <div className="flex justify-end space-x-3 pt-4">
        <button
          type="button"
          onClick={onCancel}
          className="px-4 py-2 text-gray-600 border border-gray-300 rounded-md hover:bg-gray-50 flex items-center space-x-2"
        >
          <X className="w-4 h-4" />
          <span>Cancel</span>
        </button>
        <button
          type="submit"
          disabled={loading}
          className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:bg-blue-400 flex items-center space-x-2"
        >
          <Edit className="w-4 h-4" />
          <span>{loading ? 'Updating...' : 'Update Business'}</span>
        </button>
      </div>
    </form>
  );
};

export default BusinessManagement;