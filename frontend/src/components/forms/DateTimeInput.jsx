import { useState, useRef, useEffect } from 'react';
import { Calendar, Clock, ChevronLeft, ChevronRight } from 'lucide-react';
import { DEFAULT_APPOINTMENT_DURATION_MINUTES } from '../../utils/reservationUtils';

const parseMinutes = (hm) => {
  if (!hm || typeof hm !== 'string') return null;
  const [h, m] = hm.split(':').map(Number);
  if (Number.isNaN(h) || Number.isNaN(m)) return null;
  return h * 60 + m;
};

const DateTimeInput = ({
  date,
  time,
  onDateChange,
  onTimeChange,
  bookedSlots = [],
  businessHours = { start: '08:00', end: '22:00' },
  appointmentDurationMinutes = DEFAULT_APPOINTMENT_DURATION_MINUTES,
}) => {
  
  const [showCalendar, setShowCalendar] = useState(false);
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const calendarRef = useRef(null);
  const inputRef = useRef(null);

  // Close calendar when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (calendarRef.current && !calendarRef.current.contains(event.target) &&
          inputRef.current && !inputRef.current.contains(event.target)) {
        setShowCalendar(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const getDaysInMonth = (date) => {
    const year = date.getFullYear();
    const month = date.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const daysInMonth = lastDay.getDate();
    const startingDayOfWeek = firstDay.getDay();

    const days = [];
    
    // Add empty cells for days before the first day of the month
    for (let i = 0; i < startingDayOfWeek; i++) {
      days.push(null);
    }
    
    // Add all days of the month
    for (let day = 1; day <= daysInMonth; day++) {
      days.push(new Date(year, month, day));
    }
    
    return days;
  };

  const handleDateSelect = (selectedDate) => {
    if (!selectedDate) return;
    
    const day = String(selectedDate.getDate()).padStart(2, '0');
    const month = String(selectedDate.getMonth() + 1).padStart(2, '0');
    const year = selectedDate.getFullYear();
    const formattedDate = `${day}/${month}/${year}`;
    
    onDateChange(formattedDate);
    setShowCalendar(false);
  };

  const handlePreviousMonth = () => {
    setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1));
  };

  const handleNextMonth = () => {
    setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1));
  };

  const isToday = (date) => {
    if (!date) return false;
    const today = new Date();
    return date.getDate() === today.getDate() &&
           date.getMonth() === today.getMonth() &&
           date.getFullYear() === today.getFullYear();
  };

  const isSelected = (checkDate) => {
    if (!checkDate || !date) return false;
    const [day, month, year] = date.split('/');
    if (!day || !month || !year) return false;
    
    return checkDate.getDate() === parseInt(day) &&
           checkDate.getMonth() === parseInt(month) - 1 &&
           checkDate.getFullYear() === parseInt(year);
  };

  const monthNames = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];

  const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

  const days = getDaysInMonth(currentMonth);

  /** Hide slot if a pending/confirmed booking overlaps this start + appointment length. */
  const isTimeBooked = (timeValue) => {
    if (!timeValue || bookedSlots.length === 0) return false;
    const slotStart = parseMinutes(timeValue);
    if (slotStart === null) return false;
    const slotEnd = slotStart + appointmentDurationMinutes;

    return bookedSlots.some((slot) => {
      const resStart = parseMinutes(slot.start);
      if (resStart === null) return false;
      const resEnd = slot.end != null && slot.end !== ''
        ? parseMinutes(slot.end)
        : resStart + appointmentDurationMinutes;
      if (resEnd === null) return false;
      return slotStart < resEnd && slotEnd > resStart;
    });
  };

  /** 30-minute grid; only starts where visit ends by closing (e.g. 09–18 & 30 min visit → last start 17:30). */
  const SLOT_INTERVAL_MINUTES = 30;

  const generateTimeSlots = () => {
    const slots = [];
    const [startHour, startMin] = businessHours.start.split(':').map(Number);
    const [endHour, endMin] = businessHours.end.split(':').map(Number);
    const openM = startHour * 60 + startMin;
    const closeM = endHour * 60 + endMin;

    for (let t = openM; t + appointmentDurationMinutes <= closeM; t += SLOT_INTERVAL_MINUTES) {
      const hh = Math.floor(t / 60);
      const mm = t % 60;
      slots.push(`${String(hh).padStart(2, '0')}:${String(mm).padStart(2, '0')}`);
    }

    return slots;
  };

  const timeSlots = generateTimeSlots();

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      <div>
        <label className="block text-sm font-medium text-gray-300 mb-2">
          Date (DD/MM/YYYY)
        </label>
        <div className="relative" ref={inputRef}>
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
            onFocus={() => setShowCalendar(true)}
            maxLength="10"
            required
            className="w-full px-4 py-3 pr-12 bg-white/10 border border-white/20 rounded-lg text-white placeholder-gray-400 focus:ring-2 focus:ring-blue-500 outline-none transition duration-200"
          />
          <button
            type="button"
            onClick={() => setShowCalendar(!showCalendar)}
            className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-white transition duration-200 cursor-pointer p-1"
          >
            <Calendar className="w-5 h-5" />
          </button>

          {/* Custom Calendar Popup */}
          {showCalendar && (
            <div
              ref={calendarRef}
              className="absolute z-50 mt-2 bg-white rounded-xl shadow-2xl border border-gray-200 p-4 w-80"
              style={{ top: '100%', left: 0 }}
            >
              {/* Calendar Header */}
              <div className="flex items-center justify-between mb-4">
                <button
                  type="button"
                  onClick={handlePreviousMonth}
                  className="p-2 hover:bg-gray-100 rounded-lg transition duration-200"
                >
                  <ChevronLeft className="w-5 h-5 text-gray-600" />
                </button>
                <h3 className="text-lg font-semibold text-gray-800">
                  {monthNames[currentMonth.getMonth()]} {currentMonth.getFullYear()}
                </h3>
                <button
                  type="button"
                  onClick={handleNextMonth}
                  className="p-2 hover:bg-gray-100 rounded-lg transition duration-200"
                >
                  <ChevronRight className="w-5 h-5 text-gray-600" />
                </button>
              </div>

              {/* Day Names */}
              <div className="grid grid-cols-7 gap-1 mb-2">
                {dayNames.map((day) => (
                  <div
                    key={day}
                    className="text-center text-xs font-semibold text-gray-500 py-2"
                  >
                    {day}
                  </div>
                ))}
              </div>

              {/* Calendar Days */}
              <div className="grid grid-cols-7 gap-1">
                {days.map((day, index) => (
                  <button
                    key={index}
                    type="button"
                    onClick={() => handleDateSelect(day)}
                    disabled={!day}
                    className={`
                      p-2 text-sm rounded-lg transition duration-200
                      ${!day ? 'invisible' : ''}
                      ${isToday(day) ? 'bg-blue-50 text-blue-600 font-semibold' : ''}
                      ${isSelected(day) ? 'bg-blue-600 text-white font-semibold hover:bg-blue-700' : 'hover:bg-gray-100 text-gray-700'}
                      ${day && !isSelected(day) && !isToday(day) ? 'hover:bg-gray-100' : ''}
                    `}
                  >
                    {day ? day.getDate() : ''}
                  </button>
                ))}
              </div>

              {/* Today Button */}
              <div className="mt-4 pt-4 border-t border-gray-200">
                <button
                  type="button"
                  onClick={() => handleDateSelect(new Date())}
                  className="w-full py-2 px-4 bg-blue-50 text-blue-600 rounded-lg hover:bg-blue-100 transition duration-200 font-medium text-sm"
                >
                  Today
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
      
      <div>
        <label className="block text-sm font-medium text-gray-300 mb-2 flex items-center">
          <Clock className="w-4 h-4 mr-1" />
          Time
        </label>
        {!date ? (
          <div className="p-6 bg-white/10 backdrop-blur-lg rounded-lg border border-white/20 text-center">
            <p className="text-white text-sm">⚠️ Zgjidhni datën në fillim</p>
          </div>
        ) : (
          <>
            <div className="grid grid-cols-4 gap-2 max-h-64 overflow-y-auto p-3 bg-white/10 backdrop-blur-lg rounded-lg border border-white/20">
              {timeSlots.filter(slot => !isTimeBooked(slot)).map((slot) => {
                const selected = time === slot;
                return (
                  <button
                    key={slot}
                    type="button"
                    onClick={() => onTimeChange(slot)}
                    className={`
                      px-4 py-3 rounded-lg text-base font-semibold transition-all duration-200 cursor-pointer
                      flex items-center justify-center
                      ${selected ? 'bg-blue-600 text-white shadow-lg scale-105' : 'bg-white/10 hover:bg-purple-600 text-white border border-white/20'}
                    `}
                  >
                    {slot}
                  </button>
                );
              })}
            </div>
            <p className="mt-2 text-xs text-gray-400">
              {appointmentDurationMinutes}-minute visits must finish by closing ({businessHours.end}). Last start:{' '}
              {(() => {
                const [eh, em] = businessHours.end.split(':').map(Number);
                const closeM = eh * 60 + em;
                const last = closeM - appointmentDurationMinutes;
                if (last < 0) return '—';
                return `${String(Math.floor(last / 60)).padStart(2, '0')}:${String(last % 60).padStart(2, '0')}`;
              })()}
              .
            </p>
            {bookedSlots.length > 0 && (
              <p className="mt-2 text-xs text-gray-400">
                {bookedSlots.length} time slot(s) unavailable (hidden from list)
              </p>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default DateTimeInput;