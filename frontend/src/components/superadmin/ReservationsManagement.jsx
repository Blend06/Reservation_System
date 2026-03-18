import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../auth/authStore';
import api from '../../api/axios';
import { LoadingSpinner, Table, StatusBadge } from '../ui';
import { 
  Calendar, 
  Clock, 
  CheckCircle, 
  XCircle 
} from 'lucide-react';

const ReservationsManagement = ({ embedded = false }) => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [reservations, setReservations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [businesses, setBusinesses] = useState([]);
  const [selectedBusiness, setSelectedBusiness] = useState('all');

  useEffect(() => {
    if (!user?.is_super_admin) {
      navigate('/login');
      return;
    }
    fetchData();
  }, [user, navigate]);

  const fetchData = async () => {
    try {
      const [reservationsRes, businessesRes] = await Promise.all([
        api.get('reservations/'),
        api.get('businesses/')
      ]);
      // Handle both paginated { results: [] } and plain array responses
      const resData = reservationsRes.data;
      const bizData = businessesRes.data;
      const resList = Array.isArray(resData) ? resData : (resData.results || []);
      const bizList = Array.isArray(bizData) ? bizData : (bizData.results || []);
      setReservations(resList);
      setBusinesses(bizList);
    } catch (error) {
      console.error('Error fetching data:', error);
      setReservations([]);
      setBusinesses([]);
    }
    setLoading(false);
  };

  const filteredReservations = selectedBusiness === 'all' 
    ? reservations 
    : reservations.filter(r => {
        const bizId = String(selectedBusiness);
        return String(r.business_id) === bizId || String(r.business) === bizId;
      });

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const columns = [
    {
      header: 'ID',
      accessor: 'id',
      render: (reservation) => <span className="font-mono text-sm">#{reservation.id}</span>
    },
    {
      header: 'Business',
      accessor: 'business',
      render: (reservation) => (
        <div>
          <div className="font-medium text-gray-900">{reservation.business_name}</div>
          <div className="text-xs text-gray-500">{reservation.business_subdomain}</div>
        </div>
      )
    },
    {
      header: 'Customer',
      accessor: 'customer_name',
      render: (reservation) => (
        <div>
          <div className="font-medium text-gray-900">{reservation.customer_name}</div>
          <div className="text-xs text-gray-500">{reservation.customer_email}</div>
        </div>
      )
    },
    {
      header: 'Phone',
      accessor: 'customer_phone',
      render: (reservation) => <span className="text-sm">{reservation.customer_phone || '—'}</span>
    },
    {
      header: 'Date & Time',
      accessor: 'start_time',
      render: (reservation) => (
        <div className="text-sm">
          <div>{formatDate(reservation.start_time)}</div>
          {reservation.end_time && (
            <div className="text-xs text-gray-400">→ {formatDate(reservation.end_time)}</div>
          )}
        </div>
      )
    },
    {
      header: 'Status',
      accessor: 'status',
      render: (reservation) => <StatusBadge status={reservation.status} />
    },
    {
      header: 'Notes',
      accessor: 'notes',
      render: (reservation) => (
        <span className="text-sm text-gray-600 max-w-xs truncate">
          {reservation.notes || '—'}
        </span>
      )
    },
    {
      header: 'Created',
      accessor: 'created_at',
      render: (reservation) => (
        <span className="text-xs text-gray-500">
          {formatDate(reservation.created_at)}
        </span>
      )
    }
  ];

  if (loading) {
    return <LoadingSpinner />;
  }

  const content = (
    <>
      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center">
            <div className="bg-blue-500 rounded-lg p-3 text-white mr-4">
              <Calendar className="w-6 h-6" />
            </div>
            <div>
              <p className="text-sm font-medium text-gray-600">Total</p>
              <p className="text-2xl font-bold text-gray-900">{filteredReservations.length}</p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center">
            <div className="bg-yellow-500 rounded-lg p-3 text-white mr-4">
              <Clock className="w-6 h-6" />
            </div>
            <div>
              <p className="text-sm font-medium text-gray-600">Pending</p>
              <p className="text-2xl font-bold text-gray-900">
                {filteredReservations.filter(r => r.status === 'pending').length}
              </p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center">
            <div className="bg-green-500 rounded-lg p-3 text-white mr-4">
              <CheckCircle className="w-6 h-6" />
            </div>
            <div>
              <p className="text-sm font-medium text-gray-600">Confirmed</p>
              <p className="text-2xl font-bold text-gray-900">
                {filteredReservations.filter(r => r.status === 'confirmed').length}
              </p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center">
            <div className="bg-red-500 rounded-lg p-3 text-white mr-4">
              <XCircle className="w-6 h-6" />
            </div>
            <div>
              <p className="text-sm font-medium text-gray-600">Canceled</p>
              <p className="text-2xl font-bold text-gray-900">
                {filteredReservations.filter(r => r.status === 'canceled').length}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Filter */}
      <div className="flex justify-end mb-4">
        <select
          value={selectedBusiness}
          onChange={(e) => setSelectedBusiness(e.target.value)}
          className="px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
        >
          <option value="all">All Businesses</option>
          {businesses.map(business => (
            <option key={business.id} value={business.id}>
              {business.name}
            </option>
          ))}
        </select>
      </div>

      <div className="bg-white rounded-lg shadow overflow-x-auto">
        <Table
          title={`Reservations (${filteredReservations.length})`}
          data={filteredReservations}
          columns={columns}
          emptyMessage="No reservations found"
        />
      </div>
    </>
  );

  if (embedded) {
    return <div>{content}</div>;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-6 py-8">
        <h1 className="text-2xl font-bold text-gray-900 mb-6">All Reservations</h1>
        {content}
      </div>
    </div>
  );
};

export default ReservationsManagement;
