const LoadingSpinner = ({ size = 'md', fullScreen = false }) => {
  const sizeClasses = {
    sm: 'h-6 w-6',
    md: 'h-12 w-12',
    lg: 'h-16 w-16'
  };

  const spinner = (
    <div className={`animate-spin rounded-full border-b-2 border-blue-600 ${sizeClasses[size]}`}></div>
  );

  if (fullScreen) {
    return (
      <div className="min-h-screen bg-gray-50 flex justify-center items-center">
        {spinner}
      </div>
    );
  }

  return spinner;
};

export default LoadingSpinner;