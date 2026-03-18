import { useState, useEffect } from 'react';
import api from '../../api/axios';

const DAYS = [
  { value: 0, label: 'E Hënë' },
  { value: 1, label: 'E Martë' },
  { value: 2, label: 'E Mërkurë' },
  { value: 3, label: 'E Enjte' },
  { value: 4, label: 'E Premte' },
  { value: 5, label: 'E Shtunë' },
  { value: 6, label: 'E Diel' },
];

// businessId prop: when passed (superadmin context), fetches/creates staff for that business
const StaffManagement = ({ businessId = null }) => {
  const [staffList, setStaffList] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState({ name: '', rest_days: [], is_active: true });

  const fetchStaff = async () => {
    setLoading(true);
    try {
      const params = businessId ? `?business_id=${businessId}` : '';
      const res = await api.get(`staff/${params}`);
      setStaffList(res.data);
    } catch (e) {
      console.error('Failed to fetch staff:', e);
    }
    setLoading(false);
  };

  useEffect(() => { fetchStaff(); }, [businessId]);

  const openAdd = () => {
    setEditing(null);
    setForm({ name: '', rest_days: [], is_active: true });
    setShowForm(true);
  };

  const openEdit = (member) => {
    setEditing(member.id);
    setForm({ name: member.name, rest_days: member.rest_days, is_active: member.is_active });
    setShowForm(true);
  };

  const toggleDay = (day) => {
    setForm(prev => ({
      ...prev,
      rest_days: prev.rest_days.includes(day)
        ? prev.rest_days.filter(d => d !== day)
        : [...prev.rest_days, day]
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const payload = businessId ? { ...form, business_id: businessId } : form;
      if (editing) {
        await api.patch(`staff/${editing}/`, payload);
      } else {
        await api.post('staff/', payload);
      }
      setShowForm(false);
      fetchStaff();
    } catch (e) {
      console.error('Failed to save staff:', e);
      alert(e.response?.data ? JSON.stringify(e.response.data) : 'Error saving staff');
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this staff member?')) return;
    try {
      await api.delete(`staff/${id}/`);
      fetchStaff();
    } catch (e) {
      console.error('Failed to delete staff:', e);
    }
  };

  return (
    <div className={businessId ? '' : 'bg-white rounded-lg shadow p-6'}>
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-semibold text-gray-900">Staff Members</h2>
        <button
          onClick={openAdd}
          className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm rounded-lg"
        >
          + Add Staff
        </button>
      </div>

      {showForm && (
        <form onSubmit={handleSubmit} className="mb-6 p-4 border border-gray-200 rounded-lg bg-gray-50">
          <h3 className="font-medium text-gray-800 mb-3">{editing ? 'Edit Staff' : 'New Staff Member'}</h3>
          <div className="mb-3">
            <label className="block text-sm font-medium text-gray-700 mb-1">Name</label>
            <input
              type="text"
              value={form.name}
              onChange={e => setForm(prev => ({ ...prev, name: e.target.value }))}
              className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm"
              required
            />
          </div>
          <div className="mb-3">
            <label className="block text-sm font-medium text-gray-700 mb-2">Rest Days (days off)</label>
            <div className="flex flex-wrap gap-2">
              {DAYS.map(day => (
                <button
                  key={day.value}
                  type="button"
                  onClick={() => toggleDay(day.value)}
                  className={`px-3 py-1 text-sm rounded-full border transition ${
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
          <div className="mb-4 flex items-center gap-2">
            <input
              type="checkbox"
              id="is_active_staff"
              checked={form.is_active}
              onChange={e => setForm(prev => ({ ...prev, is_active: e.target.checked }))}
            />
            <label htmlFor="is_active_staff" className="text-sm text-gray-700">Active</label>
          </div>
          <div className="flex gap-2">
            <button type="submit" className="px-4 py-2 bg-blue-600 text-white text-sm rounded-md hover:bg-blue-700">
              {editing ? 'Save Changes' : 'Add Staff'}
            </button>
            <button type="button" onClick={() => setShowForm(false)} className="px-4 py-2 bg-gray-200 text-gray-700 text-sm rounded-md hover:bg-gray-300">
              Cancel
            </button>
          </div>
        </form>
      )}

      {loading ? (
        <p className="text-gray-500 text-sm">Loading...</p>
      ) : staffList.length === 0 ? (
        <p className="text-gray-500 text-sm text-center py-6">No staff members yet. Add your first one.</p>
      ) : (
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                {['Name', 'Rest Days', 'Status', 'Actions'].map(h => (
                  <th key={h} className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {staffList.map(member => (
                <tr key={member.id} className="hover:bg-gray-50">
                  <td className="px-4 py-3 text-sm font-medium text-gray-900">{member.name}</td>
                  <td className="px-4 py-3 text-sm text-gray-600">
                    {member.rest_days.length === 0
                      ? '—'
                      : member.rest_days.map(d => DAYS.find(x => x.value === d)?.label).join(', ')}
                  </td>
                  <td className="px-4 py-3">
                    <span className={`px-2 py-1 text-xs rounded-full font-medium ${member.is_active ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'}`}>
                      {member.is_active ? 'Active' : 'Inactive'}
                    </span>
                  </td>
                  <td className="px-4 py-3 flex gap-2">
                    <button onClick={() => openEdit(member)} className="text-xs px-3 py-1 bg-blue-50 text-blue-600 rounded hover:bg-blue-100">Edit</button>
                    <button onClick={() => handleDelete(member.id)} className="text-xs px-3 py-1 bg-red-50 text-red-600 rounded hover:bg-red-100">Delete</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default StaffManagement;
