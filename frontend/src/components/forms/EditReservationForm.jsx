import { useState, useEffect } from 'react';
import { formatDateInput, convertToBackendDate, convertFromBackendDate } from '../../utils/dateUtils';

const EditReservationForm = ({ reservation, onSubmit, onCancel }) => {
  const [formData, setFormData] = useState({
    date: '',
    time: '',
    status: 'pending',
    notes: ''
  });

  useEffect(() => {
    if (reservation) {
      const startTime = new Date(reservation.start_time);
      const formattedDate = convertFromBackendDate(reservation.start_time);
      const time = startTime.toTimeString().slice(0, 5);
      
      setFormData({
        date: formattedDate,
        time: time,
        status: reservation.status || 'pending',
        notes: reservation.notes || ''
      });
    }
  }, [reservation]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const backendDate = convertToBackendDate(formData.date);
      
      // Create datetime string without timezone conversion
      const startDateTime = `${backendDate}T${formData.time}:00`;
      
      // For end time, add 1 hour to the time string directly
      const [hours, minutes] = formData.time.split(':');
      const endHour = (parseInt(hours) + 1).toString().padStart(2, '0');
      const endDateTime = `${backendDate}T${endHour}:${minutes}:00`;
      
      const updateData = {
        start_time: startDateTime,
        end_time: endDateTime,
        status: formData.status,
        notes: formData.notes
      };
      
      await onSubmit(updateData);
    } catch (error) {
      console.error('Error updating reservation:', error);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleDateChange = (e) => {
    const formattedValue = formatDateInput(e.target.value);
    setFormData(prev => ({
      ...prev,
      date: formattedValue
    }));
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Date (DD/MM/YYYY)</label>
        <div className="relative">
          <input
            type="text"
            name="date"
            placeholder="DD/MM/YYYY (e.g., 24/12/2025)"
            value={formData.date}
            onChange={handleDateChange}
            maxLength="10"
            className="w-full px-3 py-2 pr-10 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            required
          />
          <div
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              
              // Create a temporary date input
              const input = document.createElement('input');
              input.type = 'date';
              input.style.visibility = 'hidden';
              input.style.position = 'absolute';
              
              // Set current value if exists
              if (formData.date) {
                const [day, month, year] = formData.date.split('/');
                if (day && month && year && year.length === 4) {
                  input.value = `${year}-${month.padStart(2, '0')}-${day.padStart(2, '0')}`;
                }
              }
              
              input.onchange = (event) => {
                if (event.target.value) {
                  const [year, month, day] = event.target.value.split('-');
                  const formattedDate = `${day}/${month}/${year}`;
                  setFormData(prev => ({
                    ...prev,
                    date: formattedDate
                  }));
                }
                document.body.removeChild(input);
              };
              
              document.body.appendChild(input);
              input.showPicker ? input.showPicker() : input.click();
            }}
            className="absolute right-2 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-blue-500 transition duration-200 cursor-pointer p-1"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
          </div>
        </div>
      </div>
      
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Time</label>
        <input
          type="time"
          name="time"
          value={formData.time}
          onChange={handleChange}
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          required
        />
      </div>
      
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
        <select
          name="status"
          value={formData.status}
          onChange={handleChange}
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        >
          <option value="pending">Pending</option>
          <option value="confirmed">Confirmed</option>
          <option value="completed">Completed</option>
          <option value="cancelled">Cancelled</option>
        </select>
      </div>
      
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Notes</label>
        <textarea
          name="notes"
          value={formData.notes}
          onChange={handleChange}
          rows="3"
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          placeholder="Add any notes about this reservation..."
        />
      </div>
      
      <div className="flex justify-end space-x-3 pt-4">
        <button
          type="button"
          onClick={onCancel}
          className="px-4 py-2 text-gray-600 border border-gray-300 rounded-md hover:bg-gray-50"
        >
          Cancel
        </button>
        <button
          type="submit"
          className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
        >
          Save Changes
        </button>
      </div>
    </form>
  );
};

export default EditReservationForm;