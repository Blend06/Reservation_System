import { useState } from 'react';
import { useParams } from 'react-router-dom';
import api from '../../api/axios';
import { LoadingSpinner } from '../ui';
import DateTimeInput from '../forms/DateTimeInput';
import { createReservationData, getSubdomainFromHost } from '../../utils/reservationUtils';

const PublicBooking = () => {
  const { subdomain: subdomainFromUrl } = useParams();
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');
  const [showLookup, setShowLookup] = useState(false);
  const [lookupEmail, setLookupEmail] = useState('');
  const [lookupResults, setLookupResults] = useState(null);

  const [formData, setFormData] = useState({
    customer_name: '',
    customer_phone: '',
    date: '',
    time: '',
    notes: ''
  });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setError('');

    try {
      // Create reservation data with timezone
      const reservationData = createReservationData(formData.date, formData.time);
      const subdomain = subdomainFromUrl || getSubdomainFromHost();

      // Add customer information and subdomain (so backend can assign business without login)
      const fullReservationData = {
        ...reservationData,
        customer_name: formData.customer_name,
        customer_phone: formData.customer_phone,
        notes: formData.notes,
        ...(subdomain && { subdomain }),
      };

      await api.post('reservations/', fullReservationData);
      
      setSuccess(true);
      setFormData({
        customer_name: '',
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

  const handleLookup = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const response = await api.post('reservations/lookup/', {
        phone: lookupEmail // Using lookupEmail variable for phone lookup
      });
      setLookupResults(response.data);
    } catch (error) {
      console.error('Error looking up reservations:', error);
      setError(error.response?.data?.error || 'Failed to lookup reservations');
    }
    setLoading(false);
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  if (success) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center px-4">
        <div className="max-w-md w-full bg-white rounded-lg shadow-lg p-8 text-center">
          <div className="text-6xl mb-4">✅</div>
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Booking Confirmed!</h1>
          <p className="text-gray-600 mb-6">
            Thank you for your reservation. The business owner has been notified and will contact you to confirm your appointment.
          </p>
          <div className="space-y-3">
            <button
              onClick={() => setSuccess(false)}
              className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 px-6 rounded-lg transition duration-200"
            >
              Book Another Appointment
            </button>
            <button
              onClick={() => {
                setSuccess(false);
                setShowLookup(true);
              }}
              className="w-full bg-gray-100 hover:bg-gray-200 text-gray-700 font-semibold py-3 px-6 rounded-lg transition duration-200"
            >
              View My Reservations
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (showLookup) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
        <div className="container mx-auto px-4 py-8">
          <div className="max-w-2xl mx-auto">
            <div className="bg-white rounded-lg shadow-lg p-8">
              <div className="flex justify-between items-center mb-6">
                <h1 className="text-2xl font-bold text-gray-900">My Reservations</h1>
                <button
                  onClick={() => {
                    setShowLookup(false);
                    setLookupResults(null);
                    setLookupEmail('');
                    setError('');
                  }}
                  className="text-gray-500 hover:text-gray-700 font-medium"
                >
                  ← Back to Booking
                </button>
              </div>

              <form onSubmit={handleLookup} className="mb-6">
                <div className="flex gap-4">
                  <input
                    type="tel"
                    placeholder="Enter your phone number"
                    value={lookupEmail}
                    onChange={(e) => setLookupEmail(e.target.value)}
                    required
                    className="flex-1 px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                  />
                  <button
                    type="submit"
                    disabled={loading}
                    className="bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white font-semibold py-3 px-6 rounded-lg transition duration-200"
                  >
                    {loading ? 'Searching...' : 'Find Reservations'}
                  </button>
                </div>
              </form>

              {error && (
                <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg text-red-700">
                  {error}
                </div>
              )}

              {lookupResults && (
                <div>
                  <h2 className="text-lg font-semibold mb-4">
                    Reservations for {lookupResults.business_name || 'this business'}
                  </h2>
                  {lookupResults.reservations?.length === 0 ? (
                    <div className="text-center py-8 text-gray-500">
                      <p>No reservations found for this phone number.</p>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {lookupResults.reservations?.map((reservation) => (
                        <div key={reservation.id} className="border border-gray-200 rounded-lg p-4">
                          <div className="flex justify-between items-start">
                            <div>
                              <h3 className="font-semibold text-gray-800">{reservation.customer_name}</h3>
                              <p className="text-gray-600">
                                {new Date(reservation.start_time).toLocaleDateString()} at{' '}
                                {new Date(reservation.start_time).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                              </p>
                              {reservation.notes && (
                                <p className="text-gray-600 mt-1">
                                  <span className="font-medium">Notes:</span> {reservation.notes}
                                </p>
                              )}
                              <p className="text-sm text-gray-500 mt-1">
                                Booked on {new Date(reservation.created_at).toLocaleDateString()}
                              </p>
                            </div>
                            <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                              reservation.status === 'confirmed' ? 'bg-green-100 text-green-800' :
                              reservation.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                              reservation.status === 'canceled' ? 'bg-red-100 text-red-800' :
                              'bg-gray-100 text-gray-800'
                            }`}>
                              {reservation.status.charAt(0).toUpperCase() + reservation.status.slice(1)}
                            </span>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
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
              Schedule your appointment with us. We'll contact you to confirm your booking.
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
                <div className="grid grid-cols-1 gap-4">
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
                      Phone Number *
                    </label>
                    <input
                      type="tel"
                      name="customer_phone"
                      value={formData.customer_phone}
                      onChange={handleChange}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition duration-200"
                      required
                    />
                  </div>
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
            <div className="mt-8 pt-6 border-t border-gray-200">
              <div className="text-center mb-4">
                <button
                  type="button"
                  onClick={() => setShowLookup(true)}
                  className="text-blue-600 hover:text-blue-700 font-semibold"
                >
                  View My Existing Reservations
                </button>
              </div>
              <div className="text-center text-sm text-gray-600">
                <p>
                  By booking an appointment, you agree to be contacted via phone.
                  Your appointment will be confirmed within 24 hours.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PublicBooking;