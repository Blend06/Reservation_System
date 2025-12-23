import React, { useState, useEffect } from 'react';
import api from '../api/axios';

const Reservations = () => {
  const [reservations, setReservations] = useState([]);
  const [newReservation, setNewReservation] = useState({
    date: '',
    time: '',
    notes: ''
  });

  useEffect(() => {
    fetchReservations();
  }, []);

  const fetchReservations = async () => {
    try {
      const response = await api.get('reservations/');
      setReservations(response.data);
    } catch (error) {
      console.error('Error fetching reservations:', error);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await api.post('reservations/', newReservation);
      setNewReservation({ date: '', time: '', notes: '' });
      fetchReservations();
    } catch (error) {
      console.error('Error creating reservation:', error);
    }
  };

  const handleChange = (e) => {
    setNewReservation({
      ...newReservation,
      [e.target.name]: e.target.value
    });
  };

  return (
    <div>
      <h2>Reservations</h2>
      
      <form onSubmit={handleSubmit}>
        <h3>New Reservation</h3>
        <input
          type="date"
          name="date"
          value={newReservation.date}
          onChange={handleChange}
          required
        />
        <input
          type="time"
          name="time"
          value={newReservation.time}
          onChange={handleChange}
          required
        />
        <textarea
          name="notes"
          placeholder="Notes (optional)"
          value={newReservation.notes}
          onChange={handleChange}
        />
        <button type="submit">Create Reservation</button>
      </form>

      <div>
        <h3>Your Reservations</h3>
        {reservations.map((reservation) => (
          <div key={reservation.id} style={{ border: '1px solid #ccc', margin: '10px', padding: '10px' }}>
            <p>Date: {reservation.date}</p>
            <p>Time: {reservation.time}</p>
            <p>Status: {reservation.status}</p>
            {reservation.notes && <p>Notes: {reservation.notes}</p>}
          </div>
        ))}
      </div>
    </div>
  );
};

export default Reservations;