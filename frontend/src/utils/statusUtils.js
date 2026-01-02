/**
 * Get status color classes for badges
 */
export const getStatusColor = (status) => {
  switch (status) {
    case 'pending': return 'bg-yellow-100 text-yellow-800';
    case 'confirmed': return 'bg-blue-100 text-blue-800';
    case 'completed': return 'bg-green-100 text-green-800';
    case 'cancelled': return 'bg-red-100 text-red-800';
    default: return 'bg-gray-100 text-gray-800';
  }
};

/**
 * Get user role color classes
 */
export const getUserRoleColor = (user) => {
  if (user.is_admin) return 'bg-red-100 text-red-800';
  if (user.is_staff_member) return 'bg-green-100 text-green-800';
  return 'bg-gray-100 text-gray-800';
};

/**
 * Get user role text
 */
export const getUserRoleText = (user) => {
  if (user.is_admin) return 'Admin';
  if (user.is_staff_member) return 'Staff';
  return 'User';
};

/**
 * Get active status color
 */
export const getActiveStatusColor = (isActive) => {
  return isActive ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800';
};

/**
 * Capitalize first letter of status
 */
export const capitalizeStatus = (status) => {
  return status.charAt(0).toUpperCase() + status.slice(1);
};