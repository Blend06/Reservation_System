import { AlertTriangle, X, Trash2 } from 'lucide-react';

const DeleteConfirmModal = ({ business, onConfirm, onCancel }) => {
  if (!business) return null;

  return (
    <div className="space-y-4">
      <div className="bg-red-50 border border-red-200 rounded-lg p-4">
        <div className="flex">
          <div className="flex-shrink-0">
            <AlertTriangle className="w-5 h-5 text-red-400" />
          </div>
          <div className="ml-3">
            <h3 className="text-sm font-medium text-red-800">
              Are you sure you want to delete this business?
            </h3>
            <div className="mt-2 text-sm text-red-700">
              <p>
                This will permanently delete <strong>{business.name}</strong> and all
                associated data including:
              </p>
              <ul className="list-disc list-inside mt-2 space-y-1">
                <li>All business users and their accounts</li>
                <li>All reservations and booking history</li>
                <li>All business settings and customizations</li>
                <li>
                  The subdomain <strong>{business.subdomain}</strong> will become
                  available again
                </li>
              </ul>
              <p className="mt-2 font-medium">This action cannot be undone.</p>
            </div>
          </div>
        </div>
      </div>

      <div className="flex justify-end space-x-3">
        <button
          onClick={onCancel}
          className="px-4 py-2 text-gray-600 border border-gray-300 rounded-md hover:bg-gray-50 flex items-center space-x-2"
        >
          <X className="w-4 h-4" />
          <span>Cancel</span>
        </button>
        <button
          onClick={onConfirm}
          className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 flex items-center space-x-2"
        >
          <Trash2 className="w-4 h-4" />
          <span>Delete Business</span>
        </button>
      </div>
    </div>
  );
};

export default DeleteConfirmModal;
