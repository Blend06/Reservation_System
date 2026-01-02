import { useState, useEffect } from 'react';
import api from '../api/axios';

export const useReservations = () => {
  const [reservations, setReservations] = useState([]);
  const [loading, setLoading] = useState(false);
  const [filterStatus, setFilterStatus] = useState('all');

  const fetchReservations = async () => {
    setLoading(true);
    try {
      const response = await api.get('reservations/');
      setReservations(response.data);
    } catch (error) {
      console.error('Error fetching reservations:', error);
    } finally {
      setLoading(false);
    }
  };

  const deleteReservation = async (reservationId) => {
    if (window.confirm('Are you sure you want to delete this reservation?')) {
      try {
        await api.delete(`reservations/${reservationId}/`);
        await fetchReservations();
        return true;
      } catch (error) {
        console.error('Error deleting reservation:', error);
        return false;
      }
    }
    return false;
  };

  const updateReservationStatus = async (reservationId, newStatus) => {
    try {
      await api.patch(`reservations/${reservationId}/`, { status: newStatus });
      await fetchReservations();
      return true;
    } catch (error) {
      console.error('Error updating reservation:', error);
      return false;
    }
  };

  const updateReservation = async (reservationId, updateData) => {
    try {
      await api.patch(`reservations/${reservationId}/`, updateData);
      await fetchReservations();
      return true;
    } catch (error) {
      console.error('Error updating reservation:', error);
      return false;
    }
  };

  const filteredReservations = filterStatus === 'all' 
    ? reservations 
    : reservations.filter(r => r.status === filterStatus);

  useEffect(() => {
    fetchReservations();
  }, []);

  return {
    reservations: filteredReservations,
    allReservations: reservations,
    loading,
    filterStatus,
    setFilterStatus,
    fetchReservations,
    deleteReservation,
    updateReservationStatus,
    updateReservation
  };
};