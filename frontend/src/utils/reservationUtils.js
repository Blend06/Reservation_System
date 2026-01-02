export const createReservationData = (date, time) => {
  const [day, month, year] = date.split('/');
  const formattedDate = `${year}-${month.padStart(2, '0')}-${day.padStart(2, '0')}`;
  
  const startDateTime = `${formattedDate}T${time}:00`;
  
  const [hours, minutes] = time.split(':');
  const endHour = (parseInt(hours) + 1).toString().padStart(2, '0');
  const endDateTime = `${formattedDate}T${endHour}:${minutes}:00`;
  
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
  const timeStr = dateTime.split('T')[1];
  const [hours, minutes] = timeStr.split(':');
  const hour12 = parseInt(hours) % 12 || 12;
  const ampm = parseInt(hours) >= 12 ? 'PM' : 'AM';
  return `${hour12.toString().padStart(2, '0')}:${minutes} ${ampm}`;
};

export const formatCreatedDate = (dateTime) => {
  const dateStr = dateTime.split('T')[0];
  const [year, month, day] = dateStr.split('-');
  const date = new Date(parseInt(year), parseInt(month) - 1, parseInt(day));
  return date.toLocaleDateString('en-GB');
};