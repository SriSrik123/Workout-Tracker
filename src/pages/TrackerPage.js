import React from 'react';
import CalendarGrid from '../components/CalendarGrid';
import DailyWorkoutLogForm from '../components/DailyWorkoutLogForm';
import JournalEntry from '../components/JournalEntry';
import { marked } from 'marked';

const TrackerPage = ({
  currentMonth, setCurrentMonth,
  currentYear, setCurrentYear,
  calendarWorkouts,
  selectedDate, setSelectedDate,
  goToPreviousMonth, goToNextMonth,
  dailyWorkouts,
  journalEntry, setJournalEntry,
  trackerLoading,
  isAuthReady,
  trackerSport, setTrackerSport,
  trackerDuration, setTrackerDuration,
  trackerDistance, setTrackerDistance,
  trackerNotes, setTrackerNotes,
  trackerEffort, setTrackerEffort,
  handleAddWorkoutToTracker,
  handleSaveJournalEntry,
  handleDeleteTrackedWorkout,
  currentPrimarySportType
}) => {
  return (
    <section className="font-inter">
      {/* Calendar Grid component remains the same for its direct styling */}
      <CalendarGrid
        currentMonth={currentMonth}
        currentYear={currentYear}
        calendarWorkouts={calendarWorkouts}
        selectedDate={selectedDate}
        setSelectedDate={setSelectedDate}
        goToPreviousMonth={goToPreviousMonth}
        goToNextMonth={goToNextMonth}
        trackerLoading={trackerLoading}
      />

      {/* Daily log and journal section */}
      <div className="mt-12 pt-8 border-t-2 border-gray-200">
          <h3 className="text-xl md:text-2xl font-bold text-indigo-800 mb-4">Details for {selectedDate}:</h3> {/* Changed blue to indigo */}
          
          <DailyWorkoutLogForm
              selectedDate={selectedDate}
              trackerSport={trackerSport} setTrackerSport={setTrackerSport}
              trackerDuration={trackerDuration} setTrackerDuration={setTrackerDuration}
              trackerDistance={trackerDistance} setTrackerDistance={setTrackerDistance}
              trackerNotes={trackerNotes} setTrackerNotes={setTrackerNotes}
              trackerEffort={trackerEffort} setTrackerEffort={setTrackerEffort}
              handleAddWorkoutToTracker={handleAddWorkoutToTracker}
              trackerLoading={trackerLoading}
              isAuthReady={isAuthReady}
              currentPrimarySportType={currentPrimarySportType}
          />

          {/* Daily Workouts List */}
          <div className="mb-10">
              <h3 className="text-xl font-bold text-indigo-800 mb-4 border-b-2 pb-2 border-gray-200">Workouts for {selectedDate}:</h3> {/* Changed blue to indigo */}
              {dailyWorkouts.length === 0 ? (
                  <p className="text-gray-600">No workouts logged for this date yet.</p>
              ) : (
                  <div className="space-y-4">
                      {dailyWorkouts.map(workout => (
                          <div key={workout.id} className="p-3 bg-gray-50 rounded-lg border border-gray-200 flex justify-between items-center">
                              <div>
                                  <p className="font-semibold text-gray-800 text-base">
                                      {workout.type === 'generated_lifting' ? 'Lifting (AI)' :
                                       workout.type === 'generated_main_sport' ? `${workout.sport} (AI)` :
                                       `${workout.sport} (Logged)`}
                                      : {workout.duration} mins
                                  </p>
                                  {workout.distance_weight_reps && <p className="text-sm text-gray-700">Details: {workout.distance_weight_reps}</p>}
                                  {workout.perceivedEffort && <p className="text-sm text-gray-700">Effort: {workout.perceivedEffort}/10</p>}
                                  {workout.notes && <p className="text-sm text-gray-700 italic">"{workout.notes}"</p>}
                                  {workout.workoutPlan && (
                                      <div
                                          className="prose prose-sm max-w-none text-gray-700 leading-relaxed mt-2 p-2 bg-blue-100 rounded-md overflow-x-auto"
                                          dangerouslySetInnerHTML={{ __html: marked.parse(workout.workoutPlan) }}
                                      />
                                  )}
                                  <p className="text-xs text-gray-500 mt-1">{new Date(workout.timestamp).toLocaleTimeString()}</p>
                              </div>
                              <button
                                  onClick={() => handleDeleteTrackedWorkout(workout.id)}
                                  className="text-red-500 hover:text-red-700 text-xl font-bold p-1 leading-none"
                                  title="Delete Workout"
                              >
                                  &times;
                              </button>
                          </div>
                      ))}
                  </div>
              )}
          </div>

          <JournalEntry
              selectedDate={selectedDate}
              journalEntry={journalEntry}
              setJournalEntry={setJournalEntry}
              handleSaveJournalEntry={handleSaveJournalEntry}
              trackerLoading={trackerLoading}
              isAuthReady={isAuthReady}
          />
      </div>
    </section>
  );
};

export default TrackerPage;