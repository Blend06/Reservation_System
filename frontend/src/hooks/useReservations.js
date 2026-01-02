import { useState, useEffect } from 'react';
import api from '../api/axios';

export const useReservations = () => {
  const [reservations, setReservations] = useState([]);
  const [allReservations, setAllReservations] = useState([]);
  const [loading, setLoading] = useState(false);
  const [filterStatus, setFilterStatus] = useState('all');

  const fetchReservations = async () => {
    setLoading(true);
    try {
      console.log('Fetching reservations...');
      const response = await api.get('reservations/');
      console.log('Reservations response:', response.data);
      setAllReservations(response.data);
      filterReservations(response.data, filterStatus);
    } catch (error) {
      console.error('Error fetching reservations:', error);
      console.error('Error response:', error.response?.data);
    }
    setLoading(false);
  };

  const filterReservations = (reservationList, status) => {
    if (status === 'all') {
      setReservations(reservationList);
    } else {
      const filtered = reservationList.filter(reservation => reservation.status === status);
      setReservations(filtered);
    }
  };

  const createReservation = async (reservationData) => {
    try {
      await api.post('reservations/', reservationData);
      await fetchReservations(); // Refresh list
      return true;
    } catch (error) {
      console.error('Error creating reservation:', error);
      return false;
    }
  };

  const updateReservationStatus = async (reservationId, newStatus) => {
    try {
      await api.patch(`reservations/${reservationId}/`, { status: newStatus });
      await fetchReservations(); // Refresh list
      return true;
    } catch (error) {
      console.error('Error updating reservation status:', error);
      return false;
    }
  };

  const updateReservation = async (reservationId, updateData) => {
    try {
      await api.patch(`reservations/${reservationId}/`, updateData);
      await fetchReservations(); // Refresh list
      return true;
    } catch (error) {
      console.error('Error updating reservation:', error);
      return false;
    }
  };

  const deleteReservation = async (reservationId) => {
    try {
      await api.delete(`reservations/${reservationId}/`);
      await fetchReservations(); // Refresh list
      return true;
    } catch (error) {
      console.error('Error deleting reservation:', error);
      return false;
    }
  };

  // Update filter when filterStatus changes
  useEffect(() => {
    filterReservations(allReservations, filterStatus);
  }, [filterStatus, allReservations]);

  useEffect(() => {
    fetchReservations();
  }, []);

  return {
    reservations,
    loading,
    filterStatus,
    setFilterStatus,
    createReservation,
    updateReservationStatus,
    updateReservation,
    deleteReservation,
    refreshReservations: fetchReservations
  };
};