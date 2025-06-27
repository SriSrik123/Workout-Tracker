import React from 'react';
import { getDaysInMonth, getFirstDayOfMonth } from '../utils/calendarUtils';

const CalendarGrid = ({
  currentMonth,
  currentYear,
  calendarWorkouts,
  selectedDate,
  setSelectedDate,
  goToPreviousMonth,
  goToNextMonth,
  trackerLoading
}) => {
  const daysInMonth = getDaysInMonth(currentYear, currentMonth);
  const firstDayOfMonth = getFirstDayOfMonth(currentYear, currentMonth);
  const monthNames = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
  const dayNames = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

  let blanks = [];
  for (let i = 0; i < firstDayOfMonth; i++) {
    blanks.push(<div key={`blank-${i}`} className="p-2 border border-gray-200 bg-gray-100 aspect-square"></div>);
  }

  let days = [];
  for (let d = 1; d <= daysInMonth; d++) {
    const fullDate = `${currentYear}-${String(currentMonth + 1).padStart(2, '0')}-${String(d).padStart(2, '0')}`;
    const isToday = fullDate === new Date().toISOString().split('T')[0];
    const isSelected = fullDate === selectedDate;
    const dayWorkouts = calendarWorkouts[fullDate] || [];

    const mainSports = dayWorkouts.filter(w => w.type === 'generated_main_sport' || (w.type === 'trackedWorkout' && (w.sport === 'Swimming' || w.sport === 'Running' || w.sport === 'Cycling')));
    const liftingSessions = dayWorkouts.filter(w => w.type === 'generated_lifting' || (w.type === 'trackedWorkout' && w.sport === 'Lifting'));
    const hasJournal = dayWorkouts.some(w => w.type === 'journalEntry');

    days.push(
      <div
        key={`day-${d}`}
        className={`p-2 border border-gray-200 flex flex-col items-center justify-start aspect-square relative cursor-pointer
                    ${isToday ? 'bg-indigo-100 border-indigo-400 font-bold' : 'bg-white'}
                    ${isSelected ? 'ring-2 ring-violet-500 ring-offset-2' : ''}`}
        onClick={() => setSelectedDate(fullDate)}
      >
        <span className="text-sm font-semibold">{d}</span>
        <div className="flex flex-col gap-0.5 mt-1">
          {mainSports.length > 0 && (
            <span className="text-xs bg-blue-600 text-white rounded-full px-2 py-0.5 w-max"> {/* Deeper blue for main sports */}
              {mainSports.length} Main
            </span>
          )}
          {liftingSessions.length > 0 && (
            <span className="text-xs bg-purple-600 text-white rounded-full px-2 py-0.5 w-max"> {/* Deeper purple for lifting */}
              {liftingSessions.length} Lift
            </span>
          )}
          {hasJournal && (
              <span className="text-xs bg-amber-500 text-white rounded-full px-2 py-0.5 w-max flex items-center"> {/* Amber for journal */}
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3 mr-1" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M4 4a2 2 0 012-2h4.586A2 2 0 0113 3.414L16.586 7A2 2 0 0118 8.414V16a2 2 0 01-2 2H6a2 2 0 01-2-2V4zm2 6a1 1 0 011-1h6a1 1 0 110 2H7a1 1 0 01-1-1zm1 3a1 1 0 100 2h6a1 1 0 100-2H7z" clipRule="evenodd" />
                  </svg>
                  Journal
              </span>
          )}
        </div>
      </div>
    );
  }

  const totalSlots = [...blanks, ...days];
  while (totalSlots.length < 42) {
      totalSlots.push(<div key={`empty-${totalSlots.length}`} className="p-2 border border-gray-200 bg-gray-100 aspect-square"></div>);
  }

  return (
    <div className="bg-white p-6 md:p-8 rounded-2xl shadow-lg border border-blue-100 font-inter">
      <h2 className="text-2xl md:text-3xl font-extrabold text-blue-800 mb-4 tracking-tight">Your Workout Calendar</h2>
      <p className="text-gray-700 mb-6 leading-relaxed text-base">View your generated and logged workouts by month. Click a day to see details and add new entries below.</p>

      {/* Calendar Navigation */}
      <div className="flex justify-between items-center mb-6">
        <button onClick={goToPreviousMonth} className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors duration-200">&lt; Prev</button> {/* Changed button color */}
        <h3 className="text-xl font-bold text-gray-800">{monthNames[currentMonth]} {currentYear}</h3>
        <button onClick={goToNextMonth} className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors duration-200">Next &gt;</button> {/* Changed button color */}
      </div>

      {trackerLoading ? (
           <p className="text-blue-600 flex items-center justify-center p-8 text-lg">
              <svg className="animate-spin -ml-1 mr-3 h-6 w-6 text-blue-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              Loading calendar data...
          </p>
      ) : (
          <div className="grid grid-cols-7 gap-px border border-gray-300 rounded-lg overflow-hidden shadow-md">
              {dayNames.map(day => (
                  <div key={day} className="p-2 text-center font-bold text-sm bg-blue-100 text-blue-800 border-b border-gray-300">
                      {day}
                  </div>
              ))}
              {totalSlots}
          </div>
      )}
    </div>
  );
};

export default CalendarGrid;