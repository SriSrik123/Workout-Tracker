import React from 'react';
import { marked } from 'marked';

const HistoryPage = ({
  workoutHistory,
  historyLoading,
  isAuthReady,
  clearGeneratedHistory
}) => {
  return (
    <section className="bg-white p-6 md:p-8 rounded-2xl shadow-lg border border-blue-100 font-inter">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-4">
        <h2 className="text-2xl md:text-3xl font-extrabold text-indigo-800 tracking-tight mb-2 sm:mb-0">
          Your Generated Workout History
        </h2>
        {/* Clear History Button */}
        {workoutHistory.length > 0 && !historyLoading && (
          <button
            onClick={clearGeneratedHistory}
            disabled={historyLoading || !isAuthReady}
            className={`py-2 px-5 rounded-full font-semibold text-sm shadow-md transform transition-all duration-300 hover:scale-105 active:scale-95 focus:outline-none focus:ring-4 focus:ring-red-300
                       ${historyLoading || !isAuthReady ? 'bg-gray-400 cursor-not-allowed' : 'bg-red-600 text-white hover:bg-red-700'}`}
          >
            Clear Generated History
          </button>
        )}
      </div>
      {historyLoading ? (
           <p className="text-blue-600 flex items-center justify-center p-8 text-lg">
              <svg className="animate-spin -ml-1 mr-3 h-6 w-6 text-blue-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              Loading your workout history...
          </p>
      ) : workoutHistory.length === 0 ? (
        <p className="text-gray-700 p-4 rounded-lg bg-amber-50 border border-amber-200 text-base">No generated workout history found. Design a workout on the <span className="font-semibold">"Workout Designer"</span> tab and mark it as done to see it here!</p>
      ) : (
        <div className="space-y-6">
          {workoutHistory.map((workout) => (
            <div key={workout.id} className="bg-blue-50 p-4 md:p-6 rounded-xl shadow-md border border-blue-200 transition-all duration-300 hover:shadow-lg hover:border-blue-300">
              <p className="text-sm text-gray-600 mb-2 font-medium">
                Generated on: <span className="font-normal text-gray-700">{new Date(workout.timestamp).toLocaleString()}</span>
              </p>
              <p className="font-semibold text-violet-700 text-base">Sport: <span className="font-normal text-gray-800">{workout.sport || workout.preferences?.sportType || 'N/A'}</span></p>
              <p className="font-semibold text-violet-700 text-base">Goal: <span className="font-normal text-gray-800">{workout.preferences?.sportGoal || workout.preferences?.swimGoal || 'N/A'}</span></p>
              <p className="font-semibold text-violet-700 text-base">Duration: <span className="font-normal text-gray-800">{workout.preferences?.workoutDuration || 'N/A'} mins</span></p>
              {workout.preferences?.liftingGoal && workout.preferences.liftingGoal !== 'None' && (
                  <p className="font-semibold text-violet-700 text-base">Lifting Goal: <span className="font-normal text-gray-800">{workout.preferences.liftingGoal}</span></p>
              )}
              <p className="text-sm text-gray-600 mb-3">Equipment: <span className="font-normal text-gray-700">{
                  workout.preferences?.equipment
                    ? Object.keys(workout.preferences.equipment)
                        .filter(key => workout.preferences.equipment[key])
                        .map(key => key.replace(/([A-Z])/g, ' $1').toLowerCase())
                        .join(', ') || 'None'
                    : 'None'
              }</span></p>
              <div
                className="prose prose-blue max-w-none text-gray-800 leading-relaxed mt-3 pt-3 border-t border-blue-100 text-base" // Reverted to prose-blue
                dangerouslySetInnerHTML={{ __html: marked.parse(workout.workoutPlan) }}
              />
            </div>
          ))}
        </div>
      )}
    </section>
  );
};

export default HistoryPage;