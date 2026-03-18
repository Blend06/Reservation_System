import { useState, useEffect } from 'react';
import api from '../../api/axios';
import { LoadingSpinner, Table, Modal } from '../ui';
import { Users, Plus } from 'lucide-react';

const DAYS = [
  { value: 0, label: 'Mon' },
  { value: 1, label: 'Tue' },
  { value: 2, label: 'Wed' },
  { value: 3, label: 'Thu' },
  { value: 4, label: 'Fri' },
  { value: 5, label: 'Sat' },
  { value: 6, label: 'Sun' },
];

const StaffOverview = () => {
  const [businesses, setBusinesses] = useState([]);
  const [staff, setStaff] = useState([]);
  const [selectedBusiness, setSelectedBusiness] = useState('all');
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [form, setForm] = useState({ name: '', rest_days: [], is_active: true, business_id: '' });
  const [saving, setSaving] = useState(false);

  useEffect(() => { fetchData(); }, []);

  const fetchData = async () => {
    try {
      const bizRes = await api.get('businesses/');
      const bizList = Array.isArray(bizRes.data) ? bizRes.data : (bizRes.data.results || []);
      setBusinesses(bizList);
      const staffResults = await Promise.all(
        bizList.map(b => api.get(`staff/?business_id=${b.id}`).then(r => r.data).catch(() => []))
      );
      setStaff(staffResults.flat());
    } catch (err) {
      console.error('Error fetching staff:', err);
    }
    setLoading(false);
  };

  const filtered = selectedBusiness === 'all'
    ? staff
    : staff.filter(s => {
        const biz = businesses.find(b => String(b.id) === String(selectedBusiness));
        return s.business_name === biz?.name;
      });

  const toggleDay = (day) => {
    setForm(prev => ({
      ...prev,
      rest_days: prev.rest_days.includes(day)
        ? prev.rest_days.filter(d => d !== day)
        : [...prev.rest_days, day]
    }));
  };

  const openAdd = () => {
    setForm({
      name: '',
      rest_days: [],
      is_active: true,
      business_id: selectedBusiness !== 'all' ? selectedBusiness : ''
    });
    setShowModal(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.business_id) { alert('Please select a business'); return; }
    setSaving(true);
    try {
      await api.post('staff/', { ...form, business_id: form.business_id });
      setShowModal(false);
      await fetchData();
    } catch (err) {
      alert(err.response?.data ? JSON.stringify(err.response.data) : 'Error saving staff');
    }
    setSaving(false);
  };

  const columns = [
    {
      header: 'Name',
      accessor: 'name',
      render: (s) => <span className="font-medium text-gray-900">{s.name}</span>
    },
    {
      header: 'Business',
      accessor: 'business_name',
      render: (s) => <span className="text-sm text-gray-700">{s.business_name || '—'}</span>
    },
    {
      header: 'Rest Days',
      accessor: 'rest_days',
      render: (s) => (
        <div className="flex gap-1 flex-wrap">
          {s.rest_days?.length > 0
            ? s.rest_days.map(d => (
                <span key={d} className="px-2 py-0.5 bg-gray-100 text-gray-600 text-xs rounded">
                  {DAYS.find(x => x.value === d)?.label}
                </span>
              ))
            : <span className="text-gray-400 text-sm">None</span>
          }
        </div>
      )
    },
    {
      header: 'Status',
      accessor: 'is_active',
      render: (s) => (
        <span className={`px-2 py-1 text-xs font-semibold rounded-full ${s.is_active ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
          {s.is_active ? 'Active' : 'Inactive'}
        </span>
      )
    },
    {
      header: 'Added',
      accessor: 'created_at',
      render: (s) => (
        <span className="text-sm text-gray-500">
          {new Date(s.created_at).toLocaleDateString()}
        </span>
      )
    }
  ];

  if (loading) return <LoadingSpinner />;

  return (
    <div>
      {/* Summary cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="bg-white rounded-lg shadow p-6 flex items-center">
          <div className="bg-purple-500 rounded-lg p-3 text-white mr-4">
            <Users className="w-6 h-6" />
          </div>
          <div>
            <p className="text-sm font-medium text-gray-600">Total Staff</p>
            <p className="text-2xl font-bold text-gray-900">{staff.length}</p>
          </div>
        </div>
        <div className="bg-white rounded-lg shadow p-6 flex items-center">
          <div className="bg-green-500 rounded-lg p-3 text-white mr-4">
            <Users className="w-6 h-6" />
          </div>
          <div>
            <p className="text-sm font-medium text-gray-600">Active Staff</p>
            <p className="text-2xl font-bold text-gray-900">{staff.filter(s => s.is_active).length}</p>
          </div>
        </div>
        <div className="bg-white rounded-lg shadow p-6 flex items-center">
          <div className="bg-blue-500 rounded-lg p-3 text-white mr-4">
            <Users className="w-6 h-6" />
          </div>
          <div>
            <p className="text-sm font-medium text-gray-600">Businesses with Staff</p>
            <p className="text-2xl font-bold text-gray-900">
              {new Set(staff.map(s => s.business_name)).size}
            </p>
          </div>
        </div>
      </div>

      {/* Filter + Add button */}
      <div className="flex justify-end items-center gap-3 mb-4">
        <select
          value={selectedBusiness}
          onChange={(e) => setSelectedBusiness(e.target.value)}
          className="px-4 py-2.5 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 text-base min-w-[200px]"
        >
          <option value="all">All Businesses</option>
          {businesses.map(b => (
            <option key={b.id} value={b.id}>{b.name}</option>
          ))}
        </select>
        <button
          onClick={openAdd}
          className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2.5 rounded-lg flex items-center gap-2 text-base"
        >
          <Plus className="w-5 h-5" />
          <span>Add Staff</span>
        </button>
      </div>

      <div className="bg-white rounded-lg shadow overflow-x-auto">
        <Table
          title={`Staff Members (${filtered.length})`}
          data={filtered}
          columns={columns}
          emptyMessage="No staff members found"
        />
      </div>

      {/* Add Staff Modal */}
      <Modal isOpen={showModal} onClose={() => setShowModal(false)} title="Add Staff Member">
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Business</label>
            <select
              value={form.business_id}
              onChange={e => setForm(prev => ({ ...prev, business_id: e.target.value }))}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 text-sm"
              required
            >
              <option value="">Select a business...</option>
              {businesses.map(b => (
                <option key={b.id} value={b.id}>{b.name}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Name</label>
            <input
              type="text"
              value={form.name}
              onChange={e => setForm(prev => ({ ...prev, name: e.target.value }))}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 text-sm"
              placeholder="Staff member name"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Rest Days (days off)</label>
            <div className="flex flex-wrap gap-2">
              {DAYS.map(day => (
                <button
                  key={day.value}
                  type="button"
                  onClick={() => toggleDay(day.value)}
                  className={`px-3 py-1.5 text-sm rounded-full border transition ${
                    form.rest_days.includes(day.value)
                      ? 'bg-red-100 border-red-400 text-red-700'
                      : 'bg-white border-gray-300 text-gray-600 hover:bg-gray-100'
                  }`}
                >
                  {day.label}
                </button>
              ))}
            </div>
          </div>

          <div className="flex items-center gap-2">
            <input
              type="checkbox"
              id="staff_active"
              checked={form.is_active}
              onChange={e => setForm(prev => ({ ...prev, is_active: e.target.checked }))}
              className="w-4 h-4"
            />
            <label htmlFor="staff_active" className="text-sm text-gray-700">Active</label>
          </div>

          <div className="flex justify-end gap-3 pt-2">
            <button
              type="button"
              onClick={() => setShowModal(false)}
              className="px-4 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50 text-sm"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={saving}
              className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 text-sm disabled:opacity-50"
            >
              {saving ? 'Saving...' : 'Add Staff'}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default StaffOverview;
