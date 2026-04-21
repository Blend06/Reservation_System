import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import api from '../../api/axios';
import DateTimeInput from '../forms/DateTimeInput';
import { createReservationData, getSubdomainFromHost } from '../../utils/reservationUtils';

const PublicBooking = () => {
  const { subdomain: subdomainFromUrl } = useParams();
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');
  const [showLookup, setShowLookup] = useState(false);
  const [lookupPhone, setLookupPhone] = useState('');
  const [lookupResults, setLookupResults] = useState(null);
  const [business, setBusiness] = useState(null);
  const [staffList, setStaffList] = useState([]);
  const [bookedSlots, setBookedSlots] = useState([]);
  const [businessHours, setBusinessHours] = useState({ start: '08:00', end: '22:00' });
  const [formData, setFormData] = useState({
    customer_name: '', customer_phone: '', date: '', time: '', notes: '', staff: ''
  });

  useEffect(() => {
    const fetchBusiness = async () => {
      try {
        const subdomain = subdomainFromUrl || getSubdomainFromHost();
        if (subdomain) {
          const res = await api.get('businesses/?subdomain=' + subdomain);
          if (res.data && res.data.length > 0) {
            setBusiness(res.data[0]);
            if (res.data[0].business_hours_start && res.data[0].business_hours_end) {
              setBusinessHours({
                start: res.data[0].business_hours_start.substring(0, 5),
                end: res.data[0].business_hours_end.substring(0, 5)
              });
            }
          }
          const staffRes = await api.get('staff/?subdomain=' + subdomain);
          setStaffList(staffRes.data || []);
        }
      } catch (err) { console.error('Error fetching business:', err); }
    };
    fetchBusiness();
  }, [subdomainFromUrl]);

  useEffect(() => {
    const fetchBookedSlots = async () => {
      console.log('FETCH BOOKED SLOTS - date:', formData.date);
      
      if (!formData.date) {
        setBookedSlots([]);
        return;
      }
      
      try {
        const parts = formData.date.split('/');
        const day = parts[0];
        const month = parts[1];
        const year = parts[2];
        
        if (!day || !month || !year || day.length !== 2 || month.length !== 2 || year.length !== 4) {
          return;
        }
        
        const isoDate = year + '-' + month + '-' + day;
        const subdomain = subdomainFromUrl || getSubdomainFromHost();
        
        if (!subdomain) return;
        
        console.log('API CALL:', 'reservations/booked_slots/?date=' + isoDate + '&subdomain=' + subdomain);
        const res = await api.get('reservations/booked_slots/?date=' + isoDate + '&subdomain=' + subdomain);
        console.log('API RESPONSE:', res.data);
        setBookedSlots(res.data.booked_slots || []);
      } catch (err) {
        console.error('ERROR fetching booked slots:', err);
        setBookedSlots([]);
      }
    };
    
    fetchBookedSlots();
  }, [formData.date, subdomainFromUrl]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setError('');
    try {
      const reservationData = createReservationData(formData.date, formData.time);
      const subdomain = subdomainFromUrl || getSubdomainFromHost();
      await api.post('reservations/', {
        ...reservationData,
        customer_name: formData.customer_name,
        customer_phone: '+383' + formData.customer_phone,
        notes: formData.notes,
        ...(subdomain && { subdomain }),
        ...(formData.staff && { staff: formData.staff }),
      });
      setSuccess(true);
      setFormData({ customer_name: '', customer_phone: '', date: '', time: '', notes: '', staff: '' });
    } catch (err) {
      setError(err.response?.data?.detail || 'Failed to create reservation. Please try again.');
    }
    setSubmitting(false);
  };

  const handleLookup = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      const res = await api.post('reservations/lookup/', { phone: lookupPhone });
      setLookupResults(res.data);
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to lookup reservations');
    }
    setLoading(false);
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const isOffDay = (s) => {
    if (!formData.date) return false;
    const day = new Date(formData.date).getDay();
    const adj = day === 0 ? 6 : day - 1;
    return s.rest_days.includes(adj);
  };

  if (success) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-black flex items-center justify-center px-4">
        <div className="max-w-md w-full bg-white/10 backdrop-blur-lg rounded-2xl shadow-2xl p-8 text-center border border-white/20">
          <div className="text-6xl mb-4">✅</div>
          <h1 className="text-2xl font-bold text-white mb-4">Booking Confirmed!</h1>
          <p className="text-gray-300 mb-6">Thank you for your reservation. The business owner has been notified and will contact you to confirm your appointment.</p>
          <div className="space-y-3">
            <button onClick={() => setSuccess(false)} className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-semibold py-3 px-6 rounded-lg transition duration-200">Book Another Appointment</button>
            <button onClick={() => { setSuccess(false); setShowLookup(true); }} className="w-full bg-white/10 hover:bg-white/20 text-white font-semibold py-3 px-6 rounded-lg transition duration-200 border border-white/20">View My Reservations</button>
          </div>
        </div>
      </div>
    );
  }

  if (showLookup) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-black">
        <div className="container mx-auto px-4 py-8">
          <div className="max-w-2xl mx-auto">
            <div className="bg-white/10 backdrop-blur-lg rounded-2xl shadow-2xl p-8 border border-white/20">
              <div className="flex justify-between items-center mb-6">
                <h1 className="text-2xl font-bold text-white">My Reservations</h1>
                <button onClick={() => { setShowLookup(false); setLookupResults(null); setLookupPhone(''); setError(''); }} className="text-gray-400 hover:text-white font-medium">Back to Booking</button>
              </div>
              <form onSubmit={handleLookup} className="mb-6">
                <div className="flex gap-4">
                  <input type="tel" placeholder="Enter your phone number" value={lookupPhone} onChange={(e) => setLookupPhone(e.target.value)} required className="flex-1 px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder-gray-400 focus:ring-2 focus:ring-blue-500 outline-none" />
                  <button type="submit" disabled={loading} className="bg-gradient-to-r from-blue-600 to-purple-600 disabled:opacity-50 text-white font-semibold py-3 px-6 rounded-lg">{loading ? 'Searching...' : 'Find'}</button>
                </div>
              </form>
              {error && <div className="mb-6 p-4 bg-red-500/20 border border-red-500/30 rounded-lg text-red-400">{error}</div>}
              {lookupResults && (
                <div>
                  <h2 className="text-lg font-semibold text-white mb-4">Reservations for {lookupResults.business_name || 'this business'}</h2>
                  {lookupResults.reservations?.length === 0 ? (
                    <p className="text-center py-8 text-gray-400">No reservations found for this phone number.</p>
                  ) : (
                    <div className="space-y-4">
                      {lookupResults.reservations?.map((r) => (
                        <div key={r.id} className="border border-white/20 rounded-lg p-4">
                          <div className="flex justify-between items-start">
                            <div>
                              <h3 className="font-semibold text-white">{r.customer_name}</h3>
                              <p className="text-gray-300">{new Date(r.start_time).toLocaleDateString()} at {new Date(r.start_time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</p>
                              {r.notes && <p className="text-gray-400 mt-1">Notes: {r.notes}</p>}
                            </div>
                            <span className={'px-3 py-1 rounded-full text-sm font-medium ' + (r.status === 'confirmed' ? 'bg-green-500/20 text-green-400' : r.status === 'pending' ? 'bg-yellow-500/20 text-yellow-400' : r.status === 'canceled' ? 'bg-red-500/20 text-red-400' : 'bg-gray-500/20 text-gray-400')}>{r.status.charAt(0).toUpperCase() + r.status.slice(1)}</span>
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
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-black">
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-2xl mx-auto">
          <div className="text-center mb-8">
            <h1 className="text-4xl font-bold text-white mb-4">{business?.name ? 'Book at ' + business.name : 'Book Your Appointment'}</h1>
            <p className="text-xl text-gray-400">Schedule your appointment with us. We will contact you to confirm your booking.</p>
          </div>
          <div className="bg-white/10 backdrop-blur-lg rounded-2xl shadow-2xl p-8 border border-white/20">
            {error && <div className="bg-red-500/20 border border-red-500/30 text-red-400 px-4 py-3 rounded-lg mb-6">{error}</div>}
            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <h2 className="text-xl font-semibold text-white mb-4">Your Information</h2>
                <div className="grid grid-cols-1 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">Full Name *</label>
                    <input type="text" name="customer_name" value={formData.customer_name} onChange={handleChange} required className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder-gray-400 focus:ring-2 focus:ring-blue-500 outline-none transition duration-200" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">Phone Number *</label>
                    <div className="flex">
                      <span className="flex items-center px-4 bg-white/20 border border-white/20 border-r-0 rounded-l-lg text-white font-medium text-sm">+383</span>
                      <input type="tel" name="customer_phone" value={formData.customer_phone} onChange={e => { const val = e.target.value.replace(/^\+?383/, '').replace(/^0/, ''); setFormData(prev => ({ ...prev, customer_phone: val })); }} className="flex-1 px-4 py-3 bg-white/10 border border-white/20 rounded-r-lg text-white placeholder-gray-400 focus:ring-2 focus:ring-blue-500 outline-none transition duration-200" placeholder="4X XXX XXX" required />
                    </div>
                  </div>
                </div>
              </div>
              <div>
                <h2 className="text-xl font-semibold text-white mb-4">Appointment Details</h2>
                <DateTimeInput 
                  date={formData.date} 
                  time={formData.time} 
                  onDateChange={(date) => setFormData(prev => ({ ...prev, date }))} 
                  onTimeChange={(time) => setFormData(prev => ({ ...prev, time }))}
                  bookedSlots={bookedSlots}
                  businessHours={businessHours}
                />
              </div>
              {staffList.length > 0 && (
                <div>
                  <h2 className="text-xl font-semibold text-white mb-4">Zgjidhni Stafin</h2>
                  <select name="staff" value={formData.staff} onChange={handleChange} className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white focus:ring-2 focus:ring-blue-500 outline-none transition duration-200">
                    <option value="" className="bg-gray-800">Pa preference</option>
                    {staffList.filter(s => !isOffDay(s)).map(s => (
                      <option key={s.id} value={s.id} className="bg-gray-800">{s.name}</option>
                    ))}
                  </select>
                  {formData.date && staffList.some(isOffDay) && (
                    <p className="text-xs text-gray-400 mt-1">Disa anetare te stafit nuk punojne ne kete dite dhe jane fshehur.</p>
                  )}
                </div>
              )}
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Special Requests or Notes</label>
                <textarea name="notes" value={formData.notes} onChange={handleChange} rows="4" className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder-gray-400 focus:ring-2 focus:ring-blue-500 outline-none transition duration-200" placeholder="Any special requests or additional information..." />
              </div>
              <div className="pt-4">
                <button type="submit" disabled={submitting} className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 disabled:opacity-50 text-white font-semibold py-4 px-8 rounded-lg transition duration-200 transform hover:scale-105 disabled:transform-none text-lg shadow-lg">
                  {submitting ? 'Booking Your Appointment...' : 'Book Appointment'}
                </button>
              </div>
            </form>
            <div className="mt-8 pt-6 border-t border-white/20 text-center text-sm text-gray-400">
              <p>By booking an appointment, you agree to be contacted via phone. Your appointment will be confirmed within 24 hours.</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PublicBooking;
