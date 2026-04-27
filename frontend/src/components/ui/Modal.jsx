const Modal = ({ isOpen, onClose, title, children, size = 'md' }) => {
  if (!isOpen) return null;

  const sizeClasses = {
    sm: 'max-w-sm',
    md: 'max-w-md',
    lg: 'max-w-lg',
    xl: 'max-w-xl',
    /** Pothuajse e gjithë ekrani — forma të gjera (p.sh. krijim biznesi) */
    screen: 'max-w-[min(96vw,1920px)] w-full'
  };

  const panelMaxHeight = size === 'screen' ? 'max-h-[95vh]' : 'max-h-[90vh]';

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-3 sm:p-4">
      <div className={`bg-white rounded-lg w-full ${sizeClasses[size] ?? sizeClasses.md} mx-2 sm:mx-4 flex flex-col ${panelMaxHeight}`}>
        <div className="flex justify-between items-center p-6 pb-4 flex-shrink-0">
          <h3 className="text-lg font-semibold text-gray-800">{title}</h3>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 text-xl font-bold"
          >
            ×
          </button>
        </div>
        <div className="overflow-y-auto px-6 pb-6">
          {children}
        </div>
      </div>
    </div>
  );
};

export default Modal;