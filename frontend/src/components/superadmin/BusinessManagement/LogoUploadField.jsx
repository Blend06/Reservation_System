import { MAX_LOGO_BYTES, MAX_LOGO_LABEL } from './constants';

const LogoUploadField = ({
  logoOption,
  setLogoOption,
  logoUrl,
  onUrlChange,
  onFileChange,
  selectedFile,
  currentLogo,
}) => {
  const handleFileSelect = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      alert('Please select an image file');
      return;
    }
    if (file.size > MAX_LOGO_BYTES) {
      alert(`File size must be less than ${MAX_LOGO_LABEL}`);
      return;
    }
    onFileChange(file);
  };

  return (
    <div>
      <label className="block text-sm font-medium text-gray-700 mb-2">Business Logo</label>
      <div className="flex gap-4 mb-3">
        <button
          type="button"
          onClick={() => setLogoOption('url')}
          className={`px-4 py-2 rounded-md ${
            logoOption === 'url'
              ? 'bg-blue-600 text-white'
              : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
          }`}
        >
          URL
        </button>
        <button
          type="button"
          onClick={() => setLogoOption('file')}
          className={`px-4 py-2 rounded-md ${
            logoOption === 'file'
              ? 'bg-blue-600 text-white'
              : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
          }`}
        >
          Upload PNG
        </button>
      </div>

      {logoOption === 'url' ? (
        <div>
          <p className="text-xs text-gray-500 mb-1">Direct link to business logo image</p>
          <input
            type="url"
            name="logo_url"
            value={logoUrl}
            onChange={(e) => onUrlChange(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            placeholder="https://example.com/logo.png"
          />
          {logoUrl && (
            <div className="mt-2">
              <img
                src={logoUrl}
                alt="Logo preview"
                className="h-16 w-auto border border-gray-200 rounded p-2"
                onError={(e) => {
                  e.target.style.display = 'none';
                }}
              />
            </div>
          )}
        </div>
      ) : (
        <div>
          <input
            type="file"
            accept="image/png,image/jpeg,image/jpg"
            onChange={handleFileSelect}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
          <p className="text-xs text-gray-500 mt-1">PNG, JPG or JPEG. Max {MAX_LOGO_LABEL}.</p>
          {selectedFile && (
            <div className="mt-2">
              <p className="text-sm text-green-600">✓ File selected: {selectedFile.name}</p>
            </div>
          )}
          {!selectedFile && currentLogo && (
            <div className="mt-2">
              <p className="text-xs text-gray-600 mb-1">Current logo:</p>
              <img
                src={currentLogo}
                alt="Current business logo"
                className="h-16 w-auto border border-gray-200 rounded p-2 max-h-24 object-contain"
                onError={(e) => {
                  e.target.style.display = 'none';
                }}
              />
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default LogoUploadField;
