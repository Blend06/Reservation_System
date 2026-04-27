const BusinessStatsModal = ({ stats }) => {
  if (!stats) return null;

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 gap-4">
        <div className="bg-gray-50 p-4 rounded-lg">
          <h3 className="font-medium text-gray-900">Total Users</h3>
          <p className="text-2xl font-bold text-blue-600">{stats.total_users}</p>
        </div>
        <div className="bg-gray-50 p-4 rounded-lg">
          <h3 className="font-medium text-gray-900">Total Reservations</h3>
          <p className="text-2xl font-bold text-green-600">{stats.total_reservations}</p>
        </div>
        <div className="bg-gray-50 p-4 rounded-lg">
          <h3 className="font-medium text-gray-900">Pending</h3>
          <p className="text-2xl font-bold text-yellow-600">{stats.pending_reservations}</p>
        </div>
        <div className="bg-gray-50 p-4 rounded-lg">
          <h3 className="font-medium text-gray-900">Confirmed</h3>
          <p className="text-2xl font-bold text-purple-600">{stats.confirmed_reservations}</p>
        </div>
      </div>
      <div className="grid grid-cols-2 gap-4">
        <div className="bg-gray-50 p-4 rounded-lg">
          <h3 className="font-medium text-gray-900">Last 7 Days</h3>
          <p className="text-2xl font-bold text-indigo-600">{stats.reservations_last_7_days}</p>
        </div>
        <div className="bg-gray-50 p-4 rounded-lg">
          <h3 className="font-medium text-gray-900">Last 30 Days</h3>
          <p className="text-2xl font-bold text-pink-600">{stats.reservations_last_30_days}</p>
        </div>
      </div>
    </div>
  );
};

export default BusinessStatsModal;
