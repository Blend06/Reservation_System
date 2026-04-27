import { BarChart3, Edit, Power, PowerOff, Trash2 } from 'lucide-react';

const formatTime = (t) => (t ? String(t).slice(0, 5) : '—');
const formatDate = (d) => (d ? new Date(d).toLocaleDateString() : '—');

export const getBusinessColumns = ({
  onViewStats,
  onEdit,
  onToggleStatus,
  onDelete,
}) => [
  {
    header: 'Name',
    accessor: 'name',
    render: (b) => (
      <div>
        <div className="font-medium text-gray-900">{b.name}</div>
        <div className="text-xs text-gray-500">{b.subdomain}</div>
      </div>
    ),
  },
  {
    header: 'Type',
    accessor: 'business_type',
    render: (b) => <span className="text-sm capitalize">{b.business_type || '—'}</span>,
  },
  {
    header: 'Domain',
    accessor: 'full_domain',
    render: (b) => <span className="text-sm">{b.full_domain || '—'}</span>,
  },
  {
    header: 'Email',
    accessor: 'email',
    render: (b) => <span className="text-sm">{b.email}</span>,
  },
  {
    header: 'Owner Login',
    accessor: 'owner_email',
    render: (b) => <span className="text-sm text-blue-700">{b.owner_email || '—'}</span>,
  },
  {
    header: 'Phone',
    accessor: 'phone',
    render: (b) => <span className="text-sm">{b.phone || '—'}</span>,
  },
  {
    header: 'Hours',
    accessor: 'hours',
    render: (b) => (
      <span className="text-sm">
        {formatTime(b.business_hours_start)} – {formatTime(b.business_hours_end)}
      </span>
    ),
  },
  {
    header: 'Timezone',
    accessor: 'timezone',
    render: (b) => <span className="text-sm">{b.timezone || '—'}</span>,
  },
  {
    header: 'Email From',
    accessor: 'email_from_name',
    render: (b) => (
      <div>
        <div className="text-sm">{b.email_from_name || '—'}</div>
        {b.email_from_address && (
          <div className="text-xs text-gray-500">{b.email_from_address}</div>
        )}
      </div>
    ),
  },
  {
    header: 'Brand',
    accessor: 'primary_color',
    render: (b) => (
      <div className="flex items-center gap-2">
        {b.primary_color && (
          <span
            className="inline-block w-5 h-5 rounded border border-gray-300"
            style={{ backgroundColor: b.primary_color }}
            title={b.primary_color}
          />
        )}
        {b.logo_url ? (
          <a
            href={b.logo_url}
            target="_blank"
            rel="noopener noreferrer"
            className="text-blue-600 text-xs truncate max-w-[80px]"
          >
            Logo
          </a>
        ) : (
          <span className="text-gray-400 text-xs">—</span>
        )}
      </div>
    ),
  },
  {
    header: 'Users',
    accessor: 'user_count',
    render: (b) => <span className="text-sm">{b.user_count ?? 0}</span>,
  },
  {
    header: 'Reservations',
    accessor: 'reservation_count',
    render: (b) => <span className="text-sm">{b.reservation_count ?? 0}</span>,
  },
  {
    header: 'Status',
    accessor: 'is_active',
    render: (b) => (
      <span
        className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
          b.is_active ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
        }`}
      >
        {b.is_active ? 'Active' : 'Inactive'}
      </span>
    ),
  },
  {
    header: 'Subscription',
    accessor: 'subscription_status',
    render: (b) => (
      <span
        className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
          b.subscription_status === 'active'
            ? 'bg-blue-100 text-blue-800'
            : b.subscription_status === 'suspended'
            ? 'bg-red-100 text-red-800'
            : 'bg-yellow-100 text-yellow-800'
        }`}
      >
        {b.subscription_status}
      </span>
    ),
  },
  {
    header: 'Sub. expires',
    accessor: 'subscription_expires',
    render: (b) => <span className="text-sm">{formatDate(b.subscription_expires)}</span>,
  },
  {
    header: 'Created',
    accessor: 'created_at',
    render: (b) => <span className="text-sm text-gray-600">{formatDate(b.created_at)}</span>,
  },
  {
    header: 'Updated',
    accessor: 'updated_at',
    render: (b) => <span className="text-sm text-gray-600">{formatDate(b.updated_at)}</span>,
  },
  {
    header: 'Actions',
    accessor: 'actions',
    render: (business) => (
      <div className="flex space-x-2">
        <button
          onClick={() => onViewStats(business)}
          className="text-blue-600 hover:text-blue-800 text-sm font-medium flex items-center space-x-1"
        >
          <BarChart3 className="w-4 h-4" />
          <span>Stats</span>
        </button>
        <button
          onClick={() => onEdit(business)}
          className="text-indigo-600 hover:text-indigo-800 text-sm font-medium flex items-center space-x-1"
        >
          <Edit className="w-4 h-4" />
          <span>Edit</span>
        </button>
        <button
          onClick={() => onToggleStatus(business)}
          className={`text-sm font-medium flex items-center space-x-1 ${
            business.is_active
              ? 'text-red-600 hover:text-red-800'
              : 'text-green-600 hover:text-green-800'
          }`}
        >
          {business.is_active ? (
            <>
              <PowerOff className="w-4 h-4" />
              <span>Deactivate</span>
            </>
          ) : (
            <>
              <Power className="w-4 h-4" />
              <span>Activate</span>
            </>
          )}
        </button>
        <button
          onClick={() => onDelete(business)}
          className="text-red-600 hover:text-red-800 text-sm font-medium flex items-center space-x-1"
        >
          <Trash2 className="w-4 h-4" />
          <span>Delete</span>
        </button>
      </div>
    ),
  },
];
