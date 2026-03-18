import { formatReservationDate, formatReservationTime, getStatusColor } from '../../utils/reservationUtils';
import api from '../../api/axios';
import { useState } from 'react';

const ReservationItem = ({ reservation, onStatusChange }) => {
  const [loading, setLoading] = useState(false);

  const handleStatus = async (newStatus) => {
    setLoading(true);
    try {
      await api.post(`reservations/${reservation.id}/update_status/`, { status: newStatus });
      if (onStatusChange) onStatusChange();
    } catch (e) {
      console.error('Status update failed:', e);
    }
    setLoading(false);
  };

  return (
    <tr className="hover:bg-gray-50 transition duration-150">
      <td className="px-4 py-3 text-sm text-gray-900 font-medium">
        {reservation.customer_name || '—'}
      </td>
      <td className="px-4 py-3 text-sm text-gray-600">
        {reservation.customer_phone || '—'}
      </td>
      <td className="px-4 py-3 text-sm text-gray-900">
        {formatReservationDate(reservation.start_time)}
      </td>
      <td className="px-4 py-3 text-sm text-gray-600">
        {formatReservationTime(reservation.start_time)}
      </td>
      <td className="px-4 py-3 text-sm text-gray-500 max-w-xs truncate">
        {reservation.notes || '—'}
      </td>
      <td className="px-4 py-3 text-sm text-gray-600">
        {reservation.staff_name || '—'}
      </td>
      <td className="px-4 py-3">
        <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(reservation.status)}`}>
          {reservation.status.charAt(0).toUpperCase() + reservation.status.slice(1)}
        </span>
      </td>
      <td className="px-4 py-3">
        {reservation.status === 'pending' && (
          <div className="flex gap-2">
            <button
              onClick={() => handleStatus('confirmed')}
              disabled={loading}
              className="px-3 py-1 text-xs bg-green-600 hover:bg-green-700 text-white rounded disabled:opacity-50"
            >
              Confirm
            </button>
            <button
              onClick={() => handleStatus('rejected')}
              disabled={loading}
              className="px-3 py-1 text-xs bg-red-600 hover:bg-red-700 text-white rounded disabled:opacity-50"
            >
              Reject
            </button>
          </div>
        )}
      </td>
    </tr>
  );
};

export default ReservationItem;
