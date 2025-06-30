import React, { useState, useEffect } from 'react';

// Import Components
import MessageBox from './components/MessageBox';
import Settings from './Settings';
import DesignerPage from './pages/DesignerPage';
import CurrentWorkoutPage from './pages/CurrentWorkoutPage';
import HistoryPage from './pages/HistoryPage';
import TrackerPage from './pages/TrackerPage';

// Import Hooks
import useFirebase from './hooks/useFirebase';
import useGeminiAI from './hooks/useGeminiAI';
import useWorkoutData from './hooks/useWorkoutData';

const App = () => {
  // Global State (Managed by App or passed from hooks)
  const [message, setMessage] = useState({ text: '', type: '' });
  const [currentPage, setCurrentPage] = useState('designer');

  // Firebase Hooks
  const { db, userId, isAuthReady, currentAppId } = useFirebase(setMessage); // NEW: Destructure currentAppId here

  // Profile Settings States (Managed here and passed to Settings component)
  const [sportType, setSportType] = useState('Swimming');
  const [sportGoal, setSportGoal] = useState('Improve Endurance');
  const [sportLevel, setSportLevel] = useState('Intermediate');
  const [daysPerWeek, setDaysPerWeek] = useState(3);
  const [workoutDuration, setWorkoutDuration] = useState(45);
  const [liftingGoal, setLiftingGoal] = useState('None');
  const [trackerBrand, setTrackerBrand] = useState('No Watch');
  const [equipment, setEquipment] = useState({
    swimGoggles: false, swimCap: false, kickboard: false, shortFins: false, longFins: false, paddle: false, buoy: false, snorkel: false, parachutes: false,
    runningShoes: false, gpsWatch: false, hydrationVest: false,
    bike: false, helmet: false, cyclingShoes: false, indoorTrainer: false,
    resistanceBands: false, dumbbells: false, kettlebell: false, yogaMat: false, foamRoller: false, pullUpBar: false,
  });

  // Daily Health Data States (Managed here and passed to DesignerPage)
  const [desiredWorkoutDistance, setDesiredWorkoutDistance] = useState('');
  const [workoutFocus, setWorkoutFocus] = useState('');
  const [performanceMetric, setPerformanceMetric] = useState('');
  const [heartRateResting, setHeartRateResting] = useState(60);
  const [sleepHours, setSleepHours] = useState(7.0);
  const [sleepScore, setSleepScore] = useState(70);
  const [energyScore, setEnergyScore] = useState(80);

  // Initial fetch for Calendar data when month/year changes (still in App.js for calendar controls)
  const [currentMonth, setCurrentMonth] = useState(new Date().getMonth());
  const [currentYear, setCurrentYear] = useState(new Date().getFullYear());

  // --- ORDER OF HOOK CALLS MATTERS HERE ---
  // Workout Data Hook is called FIRST because useGeminiAI needs its output (lastGeneratedMainSportWorkoutDetails)
  const {
    workoutHistory, historyLoading,
    calendarWorkouts, dailyWorkouts,
    journalEntry, setJournalEntry,
    trackerLoading,
    selectedDate, setSelectedDate,
    lastGeneratedMainSportWorkoutDetails, // Destructure here
    fetchCalendarData,
    saveGeneratedWorkout, addTrackedWorkout, saveJournalEntry, deleteWorkout,
    clearGeneratedHistory
  } = useWorkoutData(
    db,
    userId,
    isAuthReady,
    setMessage,
    sportType,
    desiredWorkoutDistance,
    workoutFocus,
    performanceMetric, // Pass performanceMetric to useWorkoutData
    heartRateResting,
    sleepHours,
    sleepScore,
    energyScore,
    { // preferencesFromApp object
        sportType, sportGoal, sportLevel, daysPerWeek, workoutDuration, liftingGoal, equipment,
        desiredWorkoutDistance, workoutFocus, trackerBrand
    },
    currentAppId // NEW: Pass currentAppId to useWorkoutData
  );


  // Gemini AI Hook is called SECOND, using output from useWorkoutData
  const {
    generatedWorkout, setGeneratedWorkout, loading, generateWorkout,
    userQuestion, setUserQuestion, aiAnswer, aiQALoading, askAiAboutWorkout,
  } = useGeminiAI(
    sportType, sportGoal, sportLevel, daysPerWeek, workoutDuration, liftingGoal, equipment,
    desiredWorkoutDistance, workoutFocus, performanceMetric, heartRateResting, sleepHours, sleepScore, energyScore,
    lastGeneratedMainSportWorkoutDetails, // NEW: Pass last workout details to AI hook
    setMessage
  );


  useEffect(() => {
    fetchCalendarData(currentMonth, currentYear);
  }, [currentMonth, currentYear, fetchCalendarData]);


  // Calendar Navigation Handlers
  const goToPreviousMonth = () => {
    if (currentMonth === 0) {
      setCurrentMonth(11);
      setCurrentYear(prevYear => prevYear - 1);
    } else {
      setCurrentMonth(prevMonth => prevMonth - 1);
    }
  };

  const goToNextMonth = () => {
    if (currentMonth === 11) {
      setCurrentMonth(0);
      setCurrentYear(prevYear => prevYear + 1);
    } else {
      setCurrentMonth(prevMonth => prevMonth + 1);
    }
  };

  // Tracker Daily Log Form States and Handlers
  const [trackerSport, setTrackerSport] = useState(sportType);
  const [trackerDuration, setTrackerDuration] = useState('');
  const [trackerDistance, setTrackerDistance] = useState('');
  const [trackerNotes, setTrackerNotes] = useState('');
  const [trackerEffort, setTrackerEffort] = useState('5');

  const handleAddWorkoutToTracker = async () => {
    const workoutLogData = {
      date: selectedDate,
      sport: trackerSport,
      duration: Number(trackerDuration),
      distance_weight_reps: trackerDistance,
      notes: trackerNotes,
      perceivedEffort: Number(trackerEffort)
    };
    await addTrackedWorkout(workoutLogData);
    setTrackerSport(sportType);
    setTrackerDuration('');
    setTrackerDistance('');
    setTrackerNotes('');
    setTrackerEffort('5');
  };

  const handleSaveJournalEntry = async () => {
    await saveJournalEntry(journalEntry);
  };

  const handleDeleteTrackedWorkout = async (id) => {
    await deleteWorkout(id);
  };

  // Function to save the current (generated) workout to Firestore History & Calendar
  const handleSaveCurrentGeneratedWorkout = async () => {
    await saveGeneratedWorkout(generatedWorkout);
    setGeneratedWorkout('');
    setCurrentPage('tracker');
  };


  // Render based on currentPage state
  const renderContent = () => {
    switch (currentPage) {
      case 'designer':
        return (
          <DesignerPage
            desiredWorkoutDistance={desiredWorkoutDistance} setDesiredWorkoutDistance={setDesiredWorkoutDistance}
            workoutFocus={workoutFocus} setWorkoutFocus={setWorkoutFocus}
            performanceMetric={performanceMetric} setPerformanceMetric={setPerformanceMetric}
            heartRateResting={heartRateResting} setHeartRateResting={setHeartRateResting}
            sleepHours={sleepHours} setSleepHours={setSleepHours}
            sleepScore={sleepScore} setSleepScore={setSleepScore}
            energyScore={energyScore} setEnergyScore={setEnergyScore}
            generateWorkout={generateWorkout}
            loading={loading}
            isAuthReady={isAuthReady}
            sportType={sportType}
            trackerBrand={trackerBrand}
          />
        );
      case 'currentWorkout':
        return (
          <CurrentWorkoutPage
            generatedWorkout={generatedWorkout}
            saveCurrentWorkoutToHistory={handleSaveCurrentGeneratedWorkout}
            loading={loading}
            isAuthReady={isAuthReady}
            userQuestion={userQuestion}
            setUserQuestion={setUserQuestion}
            askAiAboutWorkout={askAiAboutWorkout}
            aiQALoading={aiQALoading}
            aiAnswer={aiAnswer}
          />
        );
      case 'history':
        return (
          <HistoryPage
            workoutHistory={workoutHistory}
            historyLoading={historyLoading}
            isAuthReady={isAuthReady}
            clearGeneratedHistory={clearGeneratedHistory}
          />
        );
      case 'tracker':
        return (
          <TrackerPage
            currentMonth={currentMonth} setCurrentMonth={setCurrentMonth}
            currentYear={currentYear} setCurrentYear={currentYear}
            calendarWorkouts={calendarWorkouts}
            selectedDate={selectedDate} setSelectedDate={setSelectedDate}
            goToPreviousMonth={goToPreviousMonth} goToNextMonth={goToNextMonth}
            dailyWorkouts={dailyWorkouts}
            journalEntry={journalEntry} setJournalEntry={setJournalEntry}
            trackerLoading={trackerLoading}
            isAuthReady={isAuthReady}
            trackerSport={trackerSport} setTrackerSport={setTrackerSport}
            trackerDuration={trackerDuration} setTrackerDuration={setTrackerDuration}
            trackerDistance={trackerDistance} setTrackerDistance={setTrackerDistance}
            trackerNotes={trackerNotes} setTrackerNotes={setTrackerNotes}
            trackerEffort={trackerEffort} setTrackerEffort={setTrackerEffort}
            handleAddWorkoutToTracker={handleAddWorkoutToTracker}
            handleSaveJournalEntry={handleSaveJournalEntry}
            handleDeleteTrackedWorkout={handleDeleteTrackedWorkout}
            currentPrimarySportType={sportType}
          />
        );
      case 'settings':
        return (
          <Settings
            sportType={sportType} setSportType={setSportType}
            sportGoal={sportGoal} setSportGoal={setSportGoal}
            sportLevel={sportLevel} setSportLevel={setSportLevel}
            daysPerWeek={daysPerWeek} setDaysPerWeek={setDaysPerWeek}
            workoutDuration={workoutDuration} setWorkoutDuration={setWorkoutDuration}
            liftingGoal={liftingGoal} setLiftingGoal={setLiftingGoal}
            trackerBrand={trackerBrand} setTrackerBrand={setTrackerBrand}
            equipment={equipment} setEquipment={setEquipment}
          />
        );
      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-violet-100 p-4 sm:p-8 font-inter antialiased flex flex-col items-center">
      <MessageBox text={message.text} type={message.type} onClose={() => setMessage({ text: '', type: '' })} />

      <header className="text-center mb-8 sm:mb-12 w-full max-w-5xl">
        <h1 className="text-4xl sm:text-5xl font-extrabold text-indigo-800 tracking-tight mb-2 drop-shadow-md">AI Sport Workout Designer</h1>
        <p className="text-lg sm:text-xl text-blue-700 font-medium">Your personal coach for custom sport sessions & tracking.</p>
      </header>

      <main className="w-full max-w-5xl bg-gray-50 p-4 sm:p-8 rounded-3xl shadow-xl border border-gray-100">
        {/* Navigation Tabs */}
        <nav className="mb-8 flex flex-wrap justify-center gap-3 sm:gap-4 px-2">
          <button
            onClick={() => setCurrentPage('designer')}
            className={`py-2.5 px-6 rounded-full font-semibold text-base sm:text-lg shadow-md transform transition-all duration-300 hover:scale-105 active:scale-95 focus:outline-none focus:ring-4 focus:ring-indigo-300
                       ${currentPage === 'designer' ? 'bg-indigo-600 text-white' : 'bg-gray-200 text-gray-800 hover:bg-indigo-100'}`}
            aria-current={currentPage === 'designer' ? 'page' : undefined}
          >
            Workout Designer
          </button>
          <button
            onClick={() => setCurrentPage('currentWorkout')}
            disabled={!generatedWorkout && currentPage !== 'currentWorkout'}
            className={`py-2.5 px-6 rounded-full font-semibold text-base sm:text-lg shadow-md transform transition-all duration-300 hover:scale-105 active:scale-95 focus:outline-none focus:ring-4 focus:ring-indigo-300
                       ${currentPage === 'currentWorkout' ? 'bg-indigo-600 text-white' : 'bg-gray-200 text-gray-800 hover:bg-indigo-100'}
                       ${!generatedWorkout && currentPage !== 'currentWorkout' ? 'opacity-60 cursor-not-allowed' : ''}`}
            aria-current={currentPage === 'currentWorkout' ? 'page' : undefined}
          >
            Current Workout
          </button>
          <button
            onClick={() => setCurrentPage('history')}
            className={`py-2.5 px-6 rounded-full font-semibold text-base sm:text-lg shadow-md transform transition-all duration-300 hover:scale-105 active:scale-95 focus:outline-none focus:ring-4 focus:ring-indigo-300
                       ${currentPage === 'history' ? 'bg-indigo-600 text-white' : 'bg-gray-200 text-gray-800 hover:bg-indigo-100'}`}
            aria-current={currentPage === 'history' ? 'page' : undefined}
          >
            Generated History
          </button>
          <button
            onClick={() => setCurrentPage('tracker')}
            className={`py-2.5 px-6 rounded-full font-semibold text-base sm:text-lg shadow-md transform transition-all duration-300 hover:scale-105 active:scale-95 focus:outline-none focus:ring-4 focus:ring-indigo-300
                       ${currentPage === 'tracker' ? 'bg-indigo-600 text-white' : 'bg-gray-200 text-gray-800 hover:bg-indigo-100'}`}
            aria-current={currentPage === 'tracker' ? 'page' : undefined}
          >
            Workout Calendar
          </button>
          <button
            onClick={() => setCurrentPage('settings')}
            className={`py-2.5 px-6 rounded-full font-semibold text-base sm:text-lg shadow-md transform transition-all duration-300 hover:scale-105 active:scale-95 focus:outline-none focus:ring-4 focus:ring-indigo-300
                       ${currentPage === 'settings' ? 'bg-indigo-600 text-white' : 'bg-gray-200 text-gray-800 hover:bg-indigo-100'}`}
            aria-current={currentPage === 'settings' ? 'page' : undefined}
          >
            Settings
          </button>
        </nav>

        {renderContent()}
      </main>
    </div>
  );
};

export default App;