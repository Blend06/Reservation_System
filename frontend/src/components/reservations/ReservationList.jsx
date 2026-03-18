import ReservationItem from './ReservationItem';

const ReservationList = ({ reservations, onStatusChange }) => {
  return (
    <div className="bg-white rounded-lg shadow overflow-hidden">
      <div className="px-6 py-4 border-b border-gray-200 bg-gray-50">
        <h2 className="text-xl font-semibold text-gray-800">
          Your Reservations ({reservations.length})
        </h2>
      </div>

      {reservations.length === 0 ? (
        <div className="text-center py-12">
          <div className="text-gray-500 text-lg">No reservations yet</div>
          <p className="text-gray-400 mt-2">Create your first reservation above!</p>
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                {['Customer', 'Phone', 'Date', 'Time', 'Notes', 'Staff', 'Status', 'Actions'].map(h => (
                  <th key={h} className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {reservations.map((reservation) => (
                <ReservationItem
                  key={reservation.id}
                  reservation={reservation}
                  onStatusChange={onStatusChange}
                />
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default ReservationList;
