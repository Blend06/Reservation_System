import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../../auth/authStore';
import api from '../../../api/axios';
import { LoadingSpinner, Modal, Table } from '../../ui';
import { ArrowLeft, Plus } from 'lucide-react';

import { getBusinessColumns } from './BusinessTableColumns';
import CreateBusinessForm from './CreateBusinessForm';
import EditBusinessForm from './EditBusinessForm';
import DeleteConfirmModal from './DeleteConfirmModal';
import BusinessStatsModal from './BusinessStatsModal';

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

  const columns = getBusinessColumns({
    onViewStats: handleViewStats,
    onEdit: handleEditBusiness,
    onToggleStatus: handleToggleStatus,
    onDelete: handleDeleteBusiness,
  });

  if (loading) {
    return <LoadingSpinner fullScreen />;
  }

  return (
    <div className={embedded ? '' : 'min-h-screen bg-gray-50'}>
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

      <Modal
        isOpen={showCreateModal}
        onClose={() => setShowCreateModal(false)}
        title="Create New Business"
        size="screen"
      >
        <CreateBusinessForm
          onSuccess={() => {
            setShowCreateModal(false);
            fetchBusinesses();
          }}
          onCancel={() => setShowCreateModal(false)}
        />
      </Modal>

      <Modal
        isOpen={showEditModal}
        onClose={() => {
          setShowEditModal(false);
          setSelectedBusiness(null);
        }}
        title="Edit Business"
        size="screen"
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

      <Modal
        isOpen={showDeleteModal}
        onClose={() => {
          setShowDeleteModal(false);
          setSelectedBusiness(null);
        }}
        title="Delete Business"
      >
        <DeleteConfirmModal
          business={selectedBusiness}
          onConfirm={confirmDeleteBusiness}
          onCancel={() => {
            setShowDeleteModal(false);
            setSelectedBusiness(null);
          }}
        />
      </Modal>

      <Modal
        isOpen={showStatsModal}
        onClose={() => setShowStatsModal(false)}
        title={`${selectedBusiness?.name} Statistics`}
      >
        <BusinessStatsModal stats={businessStats} />
      </Modal>
    </div>
  );
};

export default BusinessManagement;
