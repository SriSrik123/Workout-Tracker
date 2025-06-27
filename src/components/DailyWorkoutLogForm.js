import React from 'react';

const DailyWorkoutLogForm = ({
  selectedDate,
  trackerSport, setTrackerSport,
  trackerDuration, setTrackerDuration,
  trackerDistance, setTrackerDistance,
  trackerNotes, setTrackerNotes,
  trackerEffort, setTrackerEffort,
  handleAddWorkoutToTracker,
  trackerLoading,
  isAuthReady,
  currentPrimarySportType // Passed from App.js to reset trackerSport
}) => {
  return (
    <div className="mb-10 p-5 bg-blue-50 rounded-xl border border-blue-200">
      <h3 className="text-xl font-bold text-blue-800 mb-4">Log a New Workout for {selectedDate}:</h3>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-4">
        <div>
          <label htmlFor="trackerSport" className="block text-gray-700 font-medium mb-1 text-sm">Sport/Activity:</label>
          <select
            id="trackerSport"
            value={trackerSport}
            onChange={(e) => setTrackerSport(e.target.value)}
            className="w-full p-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500 text-base"
          >
            <option value="Swimming">Swimming</option>
            <option value="Running">Running</option>
            <option value="Cycling">Cycling</option>
            <option value="Lifting">Lifting</option>
            <option value="Other">Other</option>
          </select>
        </div>
        <div>
          <label htmlFor="trackerDuration" className="block text-gray-700 font-medium mb-1 text-sm">Duration (minutes):</label>
          <input
            type="number"
            id="trackerDuration"
            value={trackerDuration}
            onChange={(e) => setTrackerDuration(e.target.value)}
            className="w-full p-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500 text-base"
            min="0"
          />
        </div>
        <div>
          <label htmlFor="trackerDistance" className="block text-gray-700 font-medium mb-1 text-sm">Distance/Weight/Reps (Optional):</label>
          <input
            type="text"
            id="trackerDistance"
            value={trackerDistance}
            onChange={(e) => setTrackerDistance(e.target.value)}
            className="w-full p-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500 text-base"
            placeholder="e.g., 5k, 100kg bench, 3x10 reps"
          />
        </div>
        <div>
          <label htmlFor="trackerEffort" className="block text-gray-700 font-medium mb-1 text-sm">Perceived Effort (1-10):</label>
          <input
            type="range"
            id="trackerEffort"
            value={trackerEffort}
            onChange={(e) => setTrackerEffort(e.target.value)}
            className="w-full"
            min="1"
            max="10"
          />
          <span className="block text-right text-gray-600 text-sm">{trackerEffort}</span>
        </div>
        <div className="md:col-span-2">
          <label htmlFor="trackerNotes" className="block text-gray-700 font-medium mb-1 text-sm">Notes:</label>
          <textarea
            id="trackerNotes"
            value={trackerNotes}
            onChange={(e) => setTrackerNotes(e.target.value)}
            rows="3"
            className="w-full p-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500 resize-y text-base"
            placeholder="Any specific drills, feelings, achievements, or challenges..."
          ></textarea>
        </div>
      </div>
      <button
        onClick={handleAddWorkoutToTracker}
        disabled={trackerLoading || !isAuthReady || !trackerSport || !trackerDuration}
        className={`mt-4 w-full py-3 px-6 rounded-lg text-white font-bold text-lg shadow-md transform transition-all duration-300 hover:scale-105 active:scale-95 focus:outline-none focus:ring-4 focus:ring-blue-300
                   ${trackerLoading || !isAuthReady || !trackerSport || !trackerDuration ? 'bg-gray-400 cursor-not-allowed' : 'bg-blue-600 hover:bg-blue-700'}`}
      >
        {trackerLoading ? 'Logging Workout...' : 'Log Workout'}
      </button>
    </div>
  );
};

export default DailyWorkoutLogForm;