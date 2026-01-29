import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../auth/authStore';
import { useUsers } from '../../hooks/useUsers';
import { getUserRoleColor, getUserRoleText, getActiveStatusColor } from '../../utils/statusUtils';
import { Modal, Table, LoadingSpinner } from '../ui';
import { EditUserForm } from '../forms';

const formatDate = (d) => (d ? new Date(d).toLocaleString() : '—');

const UsersManagement = () => {
  const [editingUser, setEditingUser] = useState(null);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const navigate = useNavigate();
  const { logout } = useAuth();

  const { users, loading, deleteUser, updateUser } = useUsers();

  const handleEditUser = (user) => {
    setEditingUser(user);
    setIsEditModalOpen(true);
  };

  const handleCloseEditModal = () => {
    setIsEditModalOpen(false);
    setEditingUser(null);
  };

  const handleSaveUser = async (formData) => {
    await updateUser(editingUser.id, formData);
    handleCloseEditModal();
  };

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const columns = [
    {
      header: 'Name',
      accessor: 'first_name',
      render: (user) => (
        <div>
          <div className="font-medium text-gray-900">{user.first_name} {user.last_name}</div>
          <div className="text-xs text-gray-500">{(user.username || user.email)?.toLowerCase()}</div>
        </div>
      )
    },
    {
      header: 'Email',
      accessor: 'email',
      render: (user) => <span className="text-sm">{user.email}</span>
    },
    {
      header: 'Phone',
      accessor: 'phone',
      render: (user) => <span className="text-sm">{user.phone || '—'}</span>
    },
    {
      header: 'User type',
      accessor: 'user_type',
      render: (user) => (
        <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
          user.user_type === 'super_admin' ? 'bg-red-100 text-red-800' : 'bg-blue-100 text-blue-800'
        }`}>
          {user.user_type === 'super_admin' ? 'Super Admin' : 'Business Owner'}
        </span>
      )
    },
    {
      header: 'Business',
      accessor: 'business_details',
      render: (user) => (
        <span className="text-sm">
          {user.business_details
            ? `${user.business_details.name} (${user.business_details.subdomain})`
            : '—'}
        </span>
      )
    },
    {
      header: 'Active',
      accessor: 'is_active',
      render: (user) => (
        <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getActiveStatusColor(user.is_active)}`}>
          {user.is_active ? 'Yes' : 'No'}
        </span>
      )
    },
    {
      header: 'Staff',
      accessor: 'is_staff_member',
      render: (user) => (
        <span className="text-sm">{user.is_staff_member ? 'Yes' : 'No'}</span>
      )
    },
    {
      header: 'Last login',
      accessor: 'last_login',
      render: (user) => <span className="text-sm text-gray-600">{formatDate(user.last_login)}</span>
    },
    {
      header: 'Created',
      accessor: 'created_at',
      render: (user) => <span className="text-sm text-gray-600">{formatDate(user.created_at)}</span>
    },
    {
      header: 'Updated',
      accessor: 'updated_at',
      render: (user) => <span className="text-sm text-gray-600">{formatDate(user.updated_at)}</span>
    },
    {
      header: 'Actions',
      accessor: 'actions',
      render: (user) => (
        <div className="flex space-x-2">
          <button
            onClick={() => handleEditUser(user)}
            className="bg-blue-600 hover:bg-blue-700 text-white px-3 py-1 rounded-md text-sm transition duration-200"
          >
            Edit
          </button>
          <button
            onClick={() => deleteUser(user.id)}
            className="bg-red-600 hover:bg-red-700 text-white px-3 py-1 rounded-md text-sm transition duration-200"
          >
            Delete
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
            <div className="flex items-center space-x-4">
              <button
                onClick={() => navigate('/superadmin')}
                className="text-blue-600 hover:text-blue-700 font-medium"
              >
                ← Back to My Dashboard
              </button>
              <h1 className="text-3xl font-bold text-gray-800">Users Management</h1>
            </div>
            <button
              onClick={handleLogout}
              className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg transition duration-200"
            >
              Logout
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto p-6">
        <div className="mb-4">
          <p className="text-gray-600 mt-2">Manage all system users – all attributes shown below</p>
        </div>

        <div className="bg-white rounded-lg shadow overflow-hidden">
          <Table
            title={`All Users (${users.length})`}
            subtitle="Total registered users in the system"
            data={users}
            columns={columns}
            emptyMessage="No users found"
          />
        </div>
      </div>

      <Modal
        isOpen={isEditModalOpen}
        onClose={handleCloseEditModal}
        title="Edit User"
      >
        <EditUserForm
          user={editingUser}
          onSubmit={handleSaveUser}
          onCancel={handleCloseEditModal}
        />
      </Modal>
    </div>
  );
};

export default UsersManagement;