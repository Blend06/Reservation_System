import { useState } from 'react';
import DateTimeInput from '../forms/DateTimeInput';
import { createReservationData } from '../../utils/reservationUtils';

const ReservationForm = ({ onSubmit, loading }) => {
  const [formData, setFormData] = useState({
    date: '',
    time: '',
    notes: ''
  });

  const handleSubmit = async (e) => {
    e.preventDefault();
    const reservationData = createReservationData(formData.date, formData.time);
    const success = await onSubmit(reservationData);
    if (success) {
      setFormData({ date: '', time: '', notes: '' });
    }
  };

  return (
    <div className="bg-white rounded-lg shadow p-6 mb-8">
      <h2 className="text-2xl font-semibold text-gray-800 mb-6">Book New Reservation</h2>
      
      <form onSubmit={handleSubmit} className="space-y-4">
        <DateTimeInput
          date={formData.date}
          time={formData.time}
          onDateChange={(date) => setFormData(prev => ({ ...prev, date }))}
          onTimeChange={(time) => setFormData(prev => ({ ...prev, time }))}
        />
        
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Notes (Optional)
          </label>
          <input
            type="text"
            placeholder="Any special requests..."
            value={formData.notes}
            onChange={(e) => setFormData(prev => ({ ...prev, notes: e.target.value }))}
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition duration-200"
          />
        </div>
        
        <button 
          type="submit"
          disabled={loading}
          className="bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white font-semibold py-3 px-8 rounded-lg transition duration-200 transform hover:scale-105 disabled:transform-none"
        >
          {loading ? 'Creating...' : 'Create Reservation'}
        </button>
      </form>
    </div>
  );
};

export default ReservationForm;