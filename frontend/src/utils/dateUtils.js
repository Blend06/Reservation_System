/**
 * Format date to DD/MM/YYYY format
 */
export const formatDateToDDMMYYYY = (date) => {
  if (!date) return '';
  
  // Parse the ISO date string directly to avoid timezone issues
  const dateStr = date.split('T')[0]; // Get just the date part
  const [year, month, day] = dateStr.split('-');
  
  return `${day}/${month}/${year}`;
};

/**
 * Format time to HH:MM format
 */
export const formatTime = (date) => {
  if (!date) return '';
  const dateObj = new Date(date);
  
  // Let the browser use its local timezone since Django now matches
  return dateObj.toLocaleTimeString('en-US', {
    hour: '2-digit',
    minute: '2-digit'
  });
};

/**
 * Auto-format date input as user types (DD/MM/YYYY)
 */
export const formatDateInput = (value) => {
  let formattedValue = value.replace(/\D/g, ''); // Remove non-digits
  if (formattedValue.length >= 2) formattedValue = formattedValue.slice(0,2) + '/' + formattedValue.slice(2);
  if (formattedValue.length >= 5) formattedValue = formattedValue.slice(0,5) + '/' + formattedValue.slice(5,9);
  return formattedValue;
};

/**
 * Convert DD/MM/YYYY to YYYY-MM-DD format for backend
 */
export const convertToBackendDate = (ddmmyyyy) => {
  if (!ddmmyyyy) return '';
  const [day, month, year] = ddmmyyyy.split('/');
  return `${year}-${month.padStart(2, '0')}-${day.padStart(2, '0')}`;
};

/**
 * Convert backend date to DD/MM/YYYY format
 */
export const convertFromBackendDate = (backendDate) => {
  if (!backendDate) return '';
  
  // Parse the ISO date string directly to avoid timezone issues
  // Expected format: "2026-01-02T03:44:00" or "2026-01-02T03:44:00.000Z"
  const dateStr = backendDate.split('T')[0]; // Get just the date part
  const [year, month, day] = dateStr.split('-');
  
  return `${day}/${month}/${year}`;
};