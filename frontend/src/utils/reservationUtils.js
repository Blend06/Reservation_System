export const createReservationData = (date, time) => {
  const [day, month, year] = date.split('/');
  const formattedDate = `${year}-${month.padStart(2, '0')}-${day.padStart(2, '0')}`;
  
  // Create timezone-aware datetime strings for Europe/Berlin timezone
  // This ensures the backend receives the exact time the user intended
  const startDateTime = `${formattedDate}T${time}:00+01:00`;
  
  const [hours, minutes] = time.split(':');
  const endHour = (parseInt(hours) + 1).toString().padStart(2, '0');
  const endDateTime = `${formattedDate}T${endHour}:${minutes}:00+01:00`;
  
  return {
    start_time: startDateTime,
    end_time: endDateTime,
    status: 'pending'
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

export const formatReservationDate = (dateTime) => {
  const dateStr = dateTime.split('T')[0];
  const [year, month, day] = dateStr.split('-');
  const date = new Date(parseInt(year), parseInt(month) - 1, parseInt(day));
  return date.toLocaleDateString('en-GB', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });
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