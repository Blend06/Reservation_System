import { useState, useEffect } from 'react';
import api from '../../api/axios';
import { LoadingSpinner } from '../ui';
import DateTimeInput from '../forms/DateTimeInput';
import { createReservationData } from '../../utils/reservationUtils';

const PublicBooking = () => {
  const [business, setBusiness] = useState(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');
  
  const [formData, setFormData] = useState({
    customer_name: '',
    customer_email: '',
    customer_phone: '',
    date: '',
    time: '',
    notes: ''
  });

  useEffect(() => {
    // Get business info from subdomain context
    fetchBusinessInfo();
  }, []);

  const fetchBusinessInfo = async () => {
    try {
      // The backend will automatically detect the business from subdomain
      // We can get business info from a reservation endpoint or create a specific endpoint
      setLoading(false);
    } catch (error) {
      console.error('Error fetching business info:', error);
      setError('Business not found');
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setError('');

    try {
      // Create reservation data with timezone
      const reservationData = createReservationData(formData.date, formData.time);
      
      // Add customer information
      const fullReservationData = {
        ...reservationData,
        customer_name: formData.customer_name,
        customer_email: formData.customer_email,
        customer_phone: formData.customer_phone,
        notes: formData.notes
      };

      await api.post('reservations/', fullReservationData);
      
      setSuccess(true);
      setFormData({
        customer_name: '',
        customer_email: '',
        customer_phone: '',
        date: '',
        time: '',
        notes: ''
      });
    } catch (error) {
      console.error('Error creating reservation:', error);
      setError(error.response?.data?.detail || 'Failed to create reservation. Please try again.');
    }
    setSubmitting(false);
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  if (loading) {
    return <LoadingSpinner fullScreen />;
  }

  if (success) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center px-4">
        <div className="max-w-md w-full bg-white rounded-lg shadow-lg p-8 text-center">
          <div className="text-6xl mb-4">✅</div>
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Booking Confirmed!</h1>
          <p className="text-gray-600 mb-6">
            Thank you for your reservation. You will receive a confirmation email shortly with all the details.
          </p>
          <button
            onClick={() => setSuccess(false)}
            className="bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 px-6 rounded-lg transition duration-200"
          >
            Book Another Appointment
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-2xl mx-auto">
          {/* Header */}
          <div className="text-center mb-8">
            <h1 className="text-4xl font-bold text-gray-900 mb-4">Book Your Appointment</h1>
            <p className="text-xl text-gray-600">
              Schedule your appointment with us. We'll confirm your booking via email.
            </p>
          </div>

          {/* Booking Form */}
          <div className="bg-white rounded-lg shadow-lg p-8">
            {error && (
              <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-6">
                {error}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Customer Information */}
              <div>
                <h2 className="text-xl font-semibold text-gray-900 mb-4">Your Information</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Full Name *
                    </label>
                    <input
                      type="text"
                      name="customer_name"
                      value={formData.customer_name}
                      onChange={handleChange}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition duration-200"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Email Address *
                    </label>
                    <input
                      type="email"
                      name="customer_email"
                      value={formData.customer_email}
                      onChange={handleChange}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition duration-200"
                      required
                    />
                  </div>
                </div>
                <div className="mt-4">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Phone Number
                  </label>
                  <input
                    type="tel"
                    name="customer_phone"
                    value={formData.customer_phone}
                    onChange={handleChange}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition duration-200"
                  />
                </div>
              </div>

              {/* Appointment Details */}
              <div>
                <h2 className="text-xl font-semibold text-gray-900 mb-4">Appointment Details</h2>
                <DateTimeInput
                  date={formData.date}
                  time={formData.time}
                  onDateChange={(date) => setFormData(prev => ({ ...prev, date }))}
                  onTimeChange={(time) => setFormData(prev => ({ ...prev, time }))}
                />
              </div>

              {/* Special Requests */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Special Requests or Notes
                </label>
                <textarea
                  name="notes"
                  value={formData.notes}
                  onChange={handleChange}
                  rows="4"
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition duration-200"
                  placeholder="Any special requests or additional information..."
                />
              </div>

              {/* Submit Button */}
              <div className="pt-4">
                <button
                  type="submit"
                  disabled={submitting}
                  className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white font-semibold py-4 px-8 rounded-lg transition duration-200 transform hover:scale-105 disabled:transform-none text-lg"
                >
                  {submitting ? 'Booking Your Appointment...' : 'Book Appointment'}
                </button>
              </div>
            </form>

            {/* Footer Info */}
            <div className="mt-8 pt-6 border-t border-gray-200 text-center text-sm text-gray-600">
              <p>
                By booking an appointment, you agree to receive confirmation and reminder emails.
                Your appointment will be confirmed within 24 hours.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PublicBooking;