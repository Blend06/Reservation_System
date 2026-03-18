const Table = ({ headers, children, title, subtitle, data, columns, emptyMessage }) => {
  const useColumns = data != null && columns?.length > 0;
  const tableHeaders = useColumns ? columns.map((c) => c.header) : headers;
  const isEmpty = useColumns && data.length === 0;

  return (
    <div className="bg-white rounded-lg shadow overflow-hidden w-full">
      {(title || subtitle) && (
        <div className="px-8 py-5 border-b border-gray-200 bg-gray-50">
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

      <div className="overflow-x-auto w-full">
        <table className="w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              {tableHeaders?.map((header, index) => (
                <th
                  key={index}
                  className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider"
                >
                  {header}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {useColumns ? (
              isEmpty ? (
                <tr>
                  <td colSpan={columns.length} className="px-8 py-12 text-center text-gray-500 text-base">
                    {emptyMessage || 'No data'}
                  </td>
                </tr>
              ) : (
                data.map((row, rowIndex) => (
                  <tr key={row.id ?? rowIndex} className="hover:bg-gray-50 transition-colors">
                    {columns.map((col, colIndex) => (
                      <td
                        key={colIndex}
                        className="px-6 py-4 text-sm text-gray-900"
                      >
                        {col.render ? col.render(row) : row[col.accessor]}
                      </td>
                    ))}
                  </tr>
                ))
              )
            ) : (
              children
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default Table;
