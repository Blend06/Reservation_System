import { formatReservationDate, formatReservationTime, formatCreatedDate, getStatusColor } from '../../utils/reservationUtils';

const ReservationItem = ({ reservation }) => {
  return (
    <div className="p-6 hover:bg-gray-50 transition duration-200">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <div className="flex-shrink-0">
            <div className="h-12 w-12 rounded-full bg-blue-500 flex items-center justify-center">
              <span className="text-white font-semibold text-lg">
                {reservation.start_time.split('T')[0].split('-')[2]}
              </span>
            </div>
          </div>
          
          <div>
            <div className="text-lg font-semibold text-gray-900">
              {formatReservationDate(reservation.start_time)}
            </div>
            <div className="text-gray-600">
              {formatReservationTime(reservation.start_time)} • ID: {reservation.id}
              {reservation.customer && (
                <span> • Customer ID: {reservation.customer}</span>
              )}
            </div>
          </div>
        </div>
        
        <div className="text-right">
          <span className={`inline-flex px-3 py-1 text-sm font-semibold rounded-full ${getStatusColor(reservation.status)}`}>
            {reservation.status.charAt(0).toUpperCase() + reservation.status.slice(1)}
          </span>
          <div className="text-xs text-gray-500 mt-1">
            Created: {formatCreatedDate(reservation.created_at)}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ReservationItem;