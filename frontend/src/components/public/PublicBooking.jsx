import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import api from '../../api/axios';
import DateTimeInput from '../forms/DateTimeInput';
import { createReservationData, getSubdomainFromHost } from '../../utils/reservationUtils';

const PublicBooking = () => {
  const { subdomain: subdomainFromUrl } = useParams();
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');
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

        const res = await api.get('reservations/booked_slots/?date=' + isoDate + '&subdomain=' + subdomain);
        setBookedSlots(res.data.booked_slots || []);
      } catch (err) {
        setBookedSlots([]);
      }
    };

    fetchBookedSlots();
  }, [formData.date, subdomainFromUrl]);

  useEffect(() => {
    if (!successMessage) return;
    const t = setTimeout(() => setSuccessMessage(''), 12000);
    return () => clearTimeout(t);
  }, [successMessage]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setError('');
    setSuccessMessage('');
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
      setFormData({ customer_name: '', customer_phone: '', date: '', time: '', notes: '', staff: '' });
      setSuccessMessage(
        'Rezervimi u krijua me sukses. Pronari do t\'ju kontaktojë për ta konfirmuar.',
      );
      if (typeof window !== 'undefined') {
        requestAnimationFrame(() => {
          window.scrollTo({ top: 0, behavior: 'smooth' });
        });
      }
    } catch (err) {
      const d = err.response?.data;
      let msg = 'Nuk u krijua rezervimi. Provo përsëri.';
      if (typeof d === 'string') msg = d;
      else if (d?.detail) msg = Array.isArray(d.detail) ? d.detail[0] : d.detail;
      else if (d && typeof d === 'object') {
        const flat = Object.values(d).flat().filter(Boolean);
        if (flat.length) msg = String(flat[0]);
      }
      setError(msg);
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
      setError(err.response?.data?.error || 'Nuk u arrit të lexohen rezervimet.');
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

  const statusLabelSq = (st) => {
    const m = {
      pending: 'Në pritje',
      confirmed: 'Konfirmuar',
      canceled: 'Anuluar',
      completed: 'Përfunduar',
    };
    return m[st] || st;
  };

  if (showLookup) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-black">
        <div className="container mx-auto px-4 py-8">
          <div className="max-w-2xl mx-auto">
            <div className="bg-white/10 backdrop-blur-lg rounded-2xl shadow-2xl p-8 border border-white/20">
              <div className="flex justify-between items-center mb-6">
                <h1 className="text-2xl font-bold text-white">Rezervimet e mia</h1>
                <button type="button" onClick={() => { setShowLookup(false); setLookupResults(null); setLookupPhone(''); setError(''); }} className="text-gray-400 hover:text-white font-medium">Kthehu te rezervimi</button>
              </div>
              <form onSubmit={handleLookup} className="mb-6">
                <div className="flex gap-4">
                  <input type="tel" placeholder="Numri i telefonit" value={lookupPhone} onChange={(e) => setLookupPhone(e.target.value)} required className="flex-1 px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder-gray-400 focus:ring-2 focus:ring-blue-500 outline-none" />
                  <button type="submit" disabled={loading} className="bg-gradient-to-r from-blue-600 to-purple-600 disabled:opacity-50 text-white font-semibold py-3 px-6 rounded-lg">{loading ? 'Duke kërkuar…' : 'Kërko'}</button>
                </div>
              </form>
              {error && <div className="mb-6 p-4 bg-red-500/20 border border-red-500/30 rounded-lg text-red-400">{error}</div>}
              {lookupResults && (
                <div>
                  <h2 className="text-lg font-semibold text-white mb-4">
                    Rezervimet për {lookupResults.business_name || 'këtë biznes'}
                  </h2>
                  {lookupResults.reservations?.length === 0 ? (
                    <p className="text-center py-8 text-gray-400">Nuk u gjet asnjë rezervim për këtë numër.</p>
                  ) : (
                    <div className="space-y-4">
                      {lookupResults.reservations?.map((r) => (
                        <div key={r.id} className="border border-white/20 rounded-lg p-4">
                          <div className="flex justify-between items-start">
                            <div>
                              <h3 className="font-semibold text-white">{r.customer_name}</h3>
                              <p className="text-gray-300">
                                {new Date(r.start_time).toLocaleDateString('sq-AL')}{' '}
                                në {new Date(r.start_time).toLocaleTimeString('sq-AL', { hour: '2-digit', minute: '2-digit' })}
                              </p>
                              {r.notes && <p className="text-gray-400 mt-1">Shënime: {r.notes}</p>}
                            </div>
                            <span className={'px-3 py-1 rounded-full text-sm font-medium ' + (r.status === 'confirmed' ? 'bg-green-500/20 text-green-400' : r.status === 'pending' ? 'bg-yellow-500/20 text-yellow-400' : r.status === 'canceled' ? 'bg-red-500/20 text-red-400' : 'bg-gray-500/20 text-gray-400')}>{statusLabelSq(r.status)}</span>
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
          {successMessage && (
            <div
              className="mb-6 p-4 rounded-xl border border-emerald-500/40 bg-emerald-500/15 text-emerald-100 text-center text-sm sm:text-base leading-relaxed shadow-lg"
              role="status"
            >
              {successMessage}
            </div>
          )}
          <div className="text-center mb-8">
            <h1 className="text-4xl font-bold text-white mb-4">
              {business?.name ? `Rezervo në ${business.name}` : 'Rezervo terminin tënd'}
            </h1>
            <p className="text-xl text-gray-400">
              Rezervo terminin tënd. Do të të kontaktojmë për konfirmim.
            </p>
          </div>
          <div className="bg-white/10 backdrop-blur-lg rounded-2xl shadow-2xl p-8 border border-white/20">
            {error && <div className="bg-red-500/20 border border-red-500/30 text-red-400 px-4 py-3 rounded-lg mb-6">{error}</div>}
            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <h2 className="text-xl font-semibold text-white mb-4">Të dhënat tuaja</h2>
                <div className="grid grid-cols-1 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">Emri dhe mbiemri *</label>
                    <input type="text" name="customer_name" value={formData.customer_name} onChange={handleChange} required className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder-gray-400 focus:ring-2 focus:ring-blue-500 outline-none transition duration-200" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">Numri i telefonit *</label>
                    <div className="flex">
                      <span className="flex items-center px-4 bg-white/20 border border-white/20 border-r-0 rounded-l-lg text-white font-medium text-sm">+383</span>
                      <input type="tel" name="customer_phone" value={formData.customer_phone} onChange={e => { const val = e.target.value.replace(/^\+?383/, '').replace(/^0/, ''); setFormData(prev => ({ ...prev, customer_phone: val })); }} className="flex-1 px-4 py-3 bg-white/10 border border-white/20 rounded-r-lg text-white placeholder-gray-400 focus:ring-2 focus:ring-blue-500 outline-none transition duration-200" placeholder="4X XXX XXX" required />
                    </div>
                  </div>
                </div>
              </div>
              <div>
                <h2 className="text-xl font-semibold text-white mb-4">Detajet e terminit</h2>
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
                    <option value="" className="bg-gray-800">Pa preferencë stafi</option>
                    {staffList.filter(s => !isOffDay(s)).map(s => (
                      <option key={s.id} value={s.id} className="bg-gray-800">{s.name}</option>
                    ))}
                  </select>
                  {formData.date && staffList.some(isOffDay) && (
                    <p className="text-xs text-gray-400 mt-1">Disa anëtarë stafi nuk janë në dispozicion këtë ditë dhe nuk shfaqen.</p>
                  )}
                </div>
              )}
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Kërkesa të veçanta ose shënime</label>
                <textarea name="notes" value={formData.notes} onChange={handleChange} rows="4" className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder-gray-400 focus:ring-2 focus:ring-blue-500 outline-none transition duration-200" placeholder="Çfarëdo kërkesë ose informacioni shtesë…" />
              </div>
              <div className="pt-4">
                <button type="submit" disabled={submitting} className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 disabled:opacity-50 text-white font-semibold py-4 px-8 rounded-lg transition duration-200 transform hover:scale-105 disabled:transform-none text-lg shadow-lg">
                  {submitting ? 'Duke dërguar…' : 'Rezervo terminin'}
                </button>
              </div>
            </form>
            <div className="mt-8 pt-6 border-t border-white/20 text-center text-sm text-gray-400">
              <p>
                Me rezervim, pranoni të kontaktoheni me telefon. Pronari do t’ju njoftojë për
                konfirmimin e terminit.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PublicBooking;
