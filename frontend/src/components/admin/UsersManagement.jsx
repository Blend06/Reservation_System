import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../auth/authStore';
import { useUsers } from '../../hooks/useUsers';
import { getUserRoleColor, getUserRoleText, getActiveStatusColor } from '../../utils/statusUtils';
import { Modal, Table, LoadingSpinner } from '../ui';
import { EditUserForm } from '../forms';

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
                onClick={() => navigate('/dashboard')}
                className="text-blue-600 hover:text-blue-700 font-medium"
              >
                ← Back to Dashboard
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
        <div className="mb-8">
          <p className="text-gray-600 mt-2">Manage all system users</p>
        </div>

        <Table
          headers={['User Info', 'Contact', 'Status', 'Actions']}
          title={`All Users (${users.length})`}
          subtitle="Total registered users in the system"
        >
          {users.map(user => (
            <tr key={user.id} className="hover:bg-gray-50">
              <td className="px-6 py-4 whitespace-nowrap">
                <div className="flex items-center">
                  <div className="flex-shrink-0 h-10 w-10">
                    <div className="h-10 w-10 rounded-full bg-blue-500 flex items-center justify-center">
                      <span className="text-white font-medium">
                        {user.username.charAt(0).toUpperCase()}
                      </span>
                    </div>
                  </div>
                  <div className="ml-4">
                    <div className="text-sm font-medium text-gray-900">
                      {user.first_name} {user.last_name}
                    </div>
                    <div className="text-sm text-gray-500">@{user.username}</div>
                  </div>
                </div>
              </td>
              <td className="px-6 py-4 whitespace-nowrap">
                <div className="text-sm text-gray-900">{user.email}</div>
                <div className="text-sm text-gray-500">{user.phone || 'No phone'}</div>
              </td>
              <td className="px-6 py-4 whitespace-nowrap">
                <div className="flex flex-col space-y-1">
                  <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getUserRoleColor(user)}`}>
                    {getUserRoleText(user)}
                  </span>
                  <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getActiveStatusColor(user.is_active)}`}>
                    {user.is_active ? 'Active' : 'Inactive'}
                  </span>
                </div>
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm font-medium space-x-2">
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
              </td>
            </tr>
          ))}
        </Table>
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