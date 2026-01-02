import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../api/axios';
import { useAuth } from '../auth/authStore';

const Reservations = () => {
  const [reservations, setReservations] = useState([]);
  const [newReservation, setNewReservation] = useState({
    date: '',
    time: '',
    notes: ''
  });
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    fetchReservations();
  }, []);

  const fetchReservations = async () => {
    setLoading(true);
    try {
      console.log('Fetching reservations...');
      const response = await api.get('reservations/');
      console.log('Reservations response:', response.data);
      setReservations(response.data);
    } catch (error) {
      console.error('Error fetching reservations:', error);
      console.error('Error response:', error.response?.data);
    }
    setLoading(false);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      // Convert DD/MM/YYYY to YYYY-MM-DD format for backend
      const [day, month, year] = newReservation.date.split('/');
      const formattedDate = `${year}-${month.padStart(2, '0')}-${day.padStart(2, '0')}`;
      
      // Create datetime string without timezone conversion
      // This will be interpreted as local time by the backend
      const startDateTime = `${formattedDate}T${newReservation.time}:00`;
      
      // For end time, add 1 hour to the time string directly
      const [hours, minutes] = newReservation.time.split(':');
      const endHour = (parseInt(hours) + 1).toString().padStart(2, '0');
      const endDateTime = `${formattedDate}T${endHour}:${minutes}:00`;
      
      const reservationData = {
        start_time: startDateTime,
        end_time: endDateTime,
        status: 'pending'
      };
      
      await api.post('reservations/', reservationData);
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

  const { logout } = useAuth();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      case 'confirmed': return 'bg-blue-100 text-blue-800';
      case 'completed': return 'bg-green-100 text-green-800';
      case 'cancelled': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex justify-center items-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex justify-between items-center">
            <h1 className="text-3xl font-bold text-gray-800">My Reservations</h1>
            <button 
              onClick={handleLogout}
              className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg transition duration-200"
            >
              Logout
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 py-8">
        {/* Create New Reservation */}
        <div className="bg-white rounded-lg shadow p-6 mb-8">
          <h2 className="text-2xl font-semibold text-gray-800 mb-6">Book New Reservation</h2>
          
          <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Date (DD/MM/YYYY)</label>
              <div className="relative">
                <input
                  type="text"
                  name="date"
                  placeholder="DD/MM/YYYY (e.g., 24/12/2025)"
                  value={newReservation.date}
                  onChange={(e) => {
                    let value = e.target.value.replace(/\D/g, ''); // Remove non-digits
                    if (value.length >= 2) value = value.slice(0,2) + '/' + value.slice(2);
                    if (value.length >= 5) value = value.slice(0,5) + '/' + value.slice(5,9);
                    setNewReservation({...newReservation, date: value});
                  }}
                  maxLength="10"
                  required
                  className="w-full px-4 py-3 pr-12 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition duration-200"
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
                    if (newReservation.date) {
                      const [day, month, year] = newReservation.date.split('/');
                      if (day && month && year && year.length === 4) {
                        input.value = `${year}-${month.padStart(2, '0')}-${day.padStart(2, '0')}`;
                      }
                    }
                    
                    input.onchange = (event) => {
                      if (event.target.value) {
                        const [year, month, day] = event.target.value.split('-');
                        const formattedDate = `${day}/${month}/${year}`;
                        setNewReservation({...newReservation, date: formattedDate});
                      }
                      document.body.removeChild(input);
                    };
                    
                    document.body.appendChild(input);
                    input.showPicker ? input.showPicker() : input.click();
                  }}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-blue-500 transition duration-200 cursor-pointer p-1"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                </div>
              </div>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Time</label>
              <input
                type="time"
                name="time"
                value={newReservation.time}
                onChange={handleChange}
                required
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition duration-200"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Notes (Optional)</label>
              <input
                type="text"
                name="notes"
                placeholder="Any special requests..."
                value={newReservation.notes}
                onChange={handleChange}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition duration-200"
              />
            </div>
            
            <div className="md:col-span-3">
              <button 
                type="submit"
                className="bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 px-8 rounded-lg transition duration-200 transform hover:scale-105"
              >
                Create Reservation
              </button>
            </div>
          </form>
        </div>

        {/* Reservations List */}
        <div className="bg-white rounded-lg shadow overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-200 bg-gray-50">
            <h2 className="text-xl font-semibold text-gray-800">
              Your Reservations ({reservations.length})
            </h2>
          </div>
          
          {reservations.length === 0 ? (
            <div className="text-center py-12">
              <div className="text-gray-500 text-lg">No reservations yet</div>
              <p className="text-gray-400 mt-2">Create your first reservation above!</p>
            </div>
          ) : (
            <div className="divide-y divide-gray-200">
              {reservations.map((reservation) => (
                <div key={reservation.id} className="p-6 hover:bg-gray-50 transition duration-200">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-4">
                      <div className="flex-shrink-0">
                        <div className="h-12 w-12 rounded-full bg-blue-500 flex items-center justify-center">
                          <span className="text-white font-semibold text-lg">
                            {new Date(reservation.start_time).getDate()}
                          </span>
                        </div>
                      </div>
                      
                      <div>
                        <div className="text-lg font-semibold text-gray-900">
                          {new Date(reservation.start_time).toLocaleDateString('en-GB', {
                            weekday: 'long',
                            year: 'numeric',
                            month: 'long',
                            day: 'numeric'
                          })}
                        </div>
                        <div className="text-gray-600">
                          {new Date(reservation.start_time).toLocaleTimeString('en-US', {
                            hour: '2-digit',
                            minute: '2-digit'
                          })} • ID: {reservation.id}
                          {reservation.customer && (
                            <span> • Customer ID: {reservation.customer}</span>
                          )}
                        </div>
                      </div>
                    </div>
                    
                    <div className="text-right">
                      <span className={`inline-flex px-3 py-1 text-sm font-semibold rounded-full ${getStatusColor(reservation.status)}`}>
                        {reservation.status.charAt(0).toUpperCase() + reservation.status.slice(1)}
                      </span>
                      <div className="text-xs text-gray-500 mt-1">
                        Created: {new Date(reservation.created_at).toLocaleDateString('en-GB')}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Reservations;