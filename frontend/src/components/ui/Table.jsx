const Table = ({ headers, children, title, subtitle }) => {
  return (
    <div className="bg-white rounded-lg shadow overflow-hidden">
      {(title || subtitle) && (
        <div className="px-6 py-4 border-b border-gray-200 bg-gray-50">
          <div className="flex justify-between items-center">
            {title && (
              <h2 className="text-xl font-semibold text-gray-800">{title}</h2>
            )}
            {subtitle && (
              <div className="text-sm text-gray-500">{subtitle}</div>
            )}
          </div>
        </div>
      )}
      
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              {headers.map((header, index) => (
                <th
                  key={index}
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                >
                  {header}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {children}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default Table;