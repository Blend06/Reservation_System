/**
 * Get business subdomain from current host (e.g. companyA from companyA.domain.com or companyA.localhost).
 * Used so the API can assign the reservation to the correct business when API is on a different host.
 */
export const getSubdomainFromHost = () => {
  const host = typeof window !== 'undefined' ? window.location.hostname : '';
  const parts = host.split('.');
  if (parts.length >= 2 && parts[0] !== 'www' && parts[0] !== 'localhost') {
    return parts[0];
  }
  return null;
};

/** Booking length in minutes — must match DateTimeInput overlap + public slot grid (30 min). */
export const DEFAULT_APPOINTMENT_DURATION_MINUTES = 30;

const pad2 = (n) => String(n).padStart(2, '0');

export const createReservationData = (date, time) => {
  const [day, month, year] = date.split('/');
  const y = parseInt(year, 10);
  const mo = parseInt(month, 10) - 1;
  const d = parseInt(day, 10);
  const [h, mi] = time.split(':').map((x) => parseInt(x, 10));
  const formattedDate = `${year}-${month.padStart(2, '0')}-${day.padStart(2, '0')}`;
  const startDateTime = `${formattedDate}T${pad2(h)}:${pad2(mi)}:00`;

  const startTotalMin = h * 60 + mi;
  const endTotalMin = startTotalMin + DEFAULT_APPOINTMENT_DURATION_MINUTES;
  const extraDays = Math.floor(endTotalMin / (24 * 60));
  const t = endTotalMin % (24 * 60);
  const eh = Math.floor(t / 60);
  const em = t % 60;
  const endCal = new Date(y, mo, d + extraDays);
  const endDateStr = `${endCal.getFullYear()}-${pad2(endCal.getMonth() + 1)}-${pad2(endCal.getDate())}`;
  const endDateTime = `${endDateStr}T${pad2(eh)}:${pad2(em)}:00`;

  return {
    start_time: startDateTime,
    end_time: endDateTime,
    status: 'pending',
  };
};

export const getStatusColor = (status) => {
  switch (status) {
    case 'pending': return 'bg-yellow-100 text-yellow-800';
    case 'confirmed': return 'bg-blue-100 text-blue-800';
    case 'completed': return 'bg-green-100 text-green-800';
    case 'canceled': return 'bg-red-100 text-red-800';
    default: return 'bg-gray-100 text-gray-800';
  }
};

const DAYS_SQ = ['e diel', 'e hënë', 'e martë', 'e mërkurë', 'e enjte', 'e premte', 'e shtunë'];
const MONTHS_SQ = ['janar', 'shkurt', 'mars', 'prill', 'maj', 'qershor', 'korrik', 'gusht', 'shtator', 'tetor', 'nëntor', 'dhjetor'];

export const formatReservationDate = (dateTime) => {
  const dateStr = dateTime.split('T')[0];
  const [year, month, day] = dateStr.split('-');
  const date = new Date(parseInt(year), parseInt(month) - 1, parseInt(day));
  return `${DAYS_SQ[date.getDay()]}, ${parseInt(day)} ${MONTHS_SQ[date.getMonth()]} ${year}`;
};

export const formatReservationTime = (dateTime) => {
  if (!dateTime) return '';
  
  // Create a proper Date object to handle timezone conversion
  const date = new Date(dateTime);
  
  // Format using browser's local timezone (which should match Europe/Berlin)
  return date.toLocaleTimeString('en-US', {
    hour: '2-digit',
    minute: '2-digit',
    hour12: true
  });
};

export const formatCreatedDate = (dateTime) => {
  const dateStr = dateTime.split('T')[0];
  const [year, month, day] = dateStr.split('-');
  const date = new Date(parseInt(year), parseInt(month) - 1, parseInt(day));
  return date.toLocaleDateString('en-GB');
};