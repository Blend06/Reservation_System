const DateTimeInput = ({ date, time, onDateChange, onTimeChange }) => {
  const handleCalendarClick = () => {
    const input = document.createElement('input');
    input.type = 'date';
    input.style.visibility = 'hidden';
    input.style.position = 'absolute';
    
    if (date) {
      const [day, month, year] = date.split('/');
      if (day && month && year && year.length === 4) {
        input.value = `${year}-${month.padStart(2, '0')}-${day.padStart(2, '0')}`;
      }
    }
    
    input.onchange = (event) => {
      if (event.target.value) {
        const [year, month, day] = event.target.value.split('-');
        const formattedDate = `${day}/${month}/${year}`;
        onDateChange(formattedDate);
      }
      document.body.removeChild(input);
    };
    
    document.body.appendChild(input);
    input.showPicker ? input.showPicker() : input.click();
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Date (DD/MM/YYYY)
        </label>
        <div className="relative">
          <input
            type="text"
            placeholder="DD/MM/YYYY (e.g., 24/12/2025)"
            value={date}
            onChange={(e) => {
              let value = e.target.value.replace(/\D/g, '');
              if (value.length >= 2) value = value.slice(0,2) + '/' + value.slice(2);
              if (value.length >= 5) value = value.slice(0,5) + '/' + value.slice(5,9);
              onDateChange(value);
            }}
            maxLength="10"
            required
            className="w-full px-4 py-3 pr-12 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition duration-200"
          />
          <div 
            onClick={handleCalendarClick}
            className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-blue-500 transition duration-200 cursor-pointer p-1"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
          </div>
        </div>
      </div>
      
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">Time</label>
        <input
          type="time"
          value={time}
          onChange={(e) => onTimeChange(e.target.value)}
          required
          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition duration-200"
        />
      </div>
    </div>
  );
};

export default DateTimeInput;