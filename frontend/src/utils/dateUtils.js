/**
 * Format date to DD/MM/YYYY format
 */
export const formatDateToDDMMYYYY = (date) => {
  if (!date) return '';
  const dateObj = new Date(date);
  
  // Let the browser use its local timezone since Django now matches
  return dateObj.toLocaleDateString('en-GB');
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
  const dateObj = new Date(backendDate);
  const day = dateObj.getDate().toString().padStart(2, '0');
  const month = (dateObj.getMonth() + 1).toString().padStart(2, '0');
  const year = dateObj.getFullYear();
  return `${day}/${month}/${year}`;
};