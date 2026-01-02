import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../auth/authStore';
import { useReservations } from '../../hooks/useReservations';
import { formatDateToDDMMYYYY, formatTime } from '../../utils/dateUtils';
import { Modal, Table, StatusBadge, LoadingSpinner } from '../ui';
import { EditReservationForm } from '../forms';

const ReservationsManagement = () => {
  const [editingReservation, setEditingReservation] = useState(null);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const navigate = useNavigate();
  const { logout } = useAuth();
  
  const {
    reservations,
    loading,
    filterStatus,
    setFilterStatus,
    deleteReservation,
    updateReservationStatus,
    updateReservation
  } = useReservations();

  const handleEditReservation = (reservation) => {
    setEditingReservation(reservation);
    setIsEditModalOpen(true);
  };

  const handleCloseEditModal = () => {
    setIsEditModalOpen(false);
    setEditingReservation(null);
  };

  const handleSaveReservation = async (updateData) => {
    await updateReservation(editingReservation.id, updateData);
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
              <h1 className="text-3xl font-bold text-gray-800">Reservations Management</h1>
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
          <p className="text-gray-600 mt-2">Manage all system reservations</p>
        </div>

        {/* Filter Bar */}
        <div className="bg-white rounded-lg shadow p-4 mb-6">
          <div className="flex items-center space-x-4">
            <span className="text-sm font-medium text-gray-700">Filter by status:</span>
            <select 
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="border border-gray-300 rounded-md px-3 py-1 text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="all">All Reservations</option>
              <option value="pending">Pending</option>
              <option value="confirmed">Confirmed</option>
              <option value="completed">Completed</option>
              <option value="cancelled">Cancelled</option>
            </select>
            <span className="text-sm text-gray-500">
              Showing {reservations.length} reservations
            </span>
          </div>
        </div>

        <Table
          headers={['Customer', 'Date & Time', 'Status', 'Notes', 'Actions']}
          title={`Reservations (${reservations.length})`}
        >
          {reservations.map(reservation => (
            <tr key={reservation.id} className="hover:bg-gray-50">
              <td className="px-6 py-4 whitespace-nowrap">
                <div className="flex items-center">
                  <div className="flex-shrink-0 h-8 w-8">
                    <div className="h-8 w-8 rounded-full bg-indigo-500 flex items-center justify-center">
                      <span className="text-white text-sm font-medium">
                        {String(reservation.customer_name || 'U').charAt(0).toUpperCase()}
                      </span>
                    </div>
                  </div>
                  <div className="ml-3">
                    <div className="text-sm font-medium text-gray-900">
                      {reservation.customer_name || `Customer ID: ${reservation.customer}`}
                    </div>
                    <div className="text-sm text-gray-500">ID: {reservation.id}</div>
                  </div>
                </div>
              </td>
              <td className="px-6 py-4 whitespace-nowrap">
                <div className="text-sm text-gray-900">
                  {formatDateToDDMMYYYY(reservation.start_time)}
                </div>
                <div className="text-sm text-gray-500">
                  {formatTime(reservation.start_time)}
                </div>
              </td>
              <td className="px-6 py-4 whitespace-nowrap">
                <StatusBadge
                  status={reservation.status}
                  isEditable={true}
                  onChange={(newStatus) => updateReservationStatus(reservation.id, newStatus)}
                />
              </td>
              <td className="px-6 py-4">
                <div className="text-sm text-gray-900 max-w-xs truncate">
                  {reservation.notes || 'No notes available'}
                </div>
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm font-medium space-x-2">
                <button 
                  onClick={() => handleEditReservation(reservation)}
                  className="bg-blue-600 hover:bg-blue-700 text-white px-3 py-1 rounded-md text-sm transition duration-200"
                >
                  Edit
                </button>
                <button 
                  onClick={() => deleteReservation(reservation.id)}
                  className="bg-red-600 hover:bg-red-700 text-white px-3 py-1 rounded-md text-sm transition duration-200"
                >
                  Delete
                </button>
              </td>
            </tr>
          ))}
        </Table>
        
        {reservations.length === 0 && (
          <div className="text-center py-12">
            <div className="text-gray-500">
              {filterStatus === 'all' ? 'No reservations found' : `No ${filterStatus} reservations found`}
            </div>
          </div>
        )}
      </div>

      <Modal
        isOpen={isEditModalOpen}
        onClose={handleCloseEditModal}
        title="Edit Reservation"
        size="lg"
      >
        <EditReservationForm
          reservation={editingReservation}
          onSubmit={handleSaveReservation}
          onCancel={handleCloseEditModal}
        />
      </Modal>
    </div>
  );
};

export default ReservationsManagement;