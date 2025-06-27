import React from 'react';

const DesignerPage = ({
  desiredWorkoutDistance, setDesiredWorkoutDistance,
  workoutFocus, setWorkoutFocus,
  performanceMetric, setPerformanceMetric,
  heartRateResting, setHeartRateResting,
  sleepHours, setSleepHours,
  sleepScore, setSleepScore,
  energyScore, setEnergyScore,
  generateWorkout,
  loading,
  isAuthReady,
  sportType,
  trackerBrand // NEW PROP: trackerBrand
}) => {

  // Helper to determine if a metric input should be shown
  const showMetric = (metricKey) => {
    switch (trackerBrand) {
      case 'No Watch': return false;
      case 'Other': return metricKey === 'heartRateResting'; // Only Resting HR for 'Other'
      case 'Fitbit': return metricKey === 'heartRateResting' || metricKey === 'sleepHours' || metricKey === 'sleepScore' || metricKey === 'energyScore';
      case 'Garmin': return metricKey === 'heartRateResting' || metricKey === 'sleepHours' || metricKey === 'sleepScore' || metricKey === 'energyScore'; // Body Battery for energy
      case 'Apple Watch': return metricKey === 'heartRateResting' || metricKey === 'sleepHours'; // Apple provides activity, but direct "score" less common
      case 'Samsung': return metricKey === 'heartRateResting' || metricKey === 'sleepHours' || metricKey === 'sleepScore'; // Samsung has sleep score
      case 'Google': return metricKey === 'heartRateResting' || metricKey === 'sleepHours'; // Basic HR and sleep duration
      default: return true; // Show all by default if trackerBrand is not recognized
    }
  };


  const renderDesiredWorkoutDistanceInput = () => {
    let label = "";
    let options = [];

    switch (sportType) {
      case 'Swimming':
        label = "Desired Workout Distance (Swim):";
        options = [
          "< 1000 yards",
          "1000 - 2000 yards",
          "2000 - 3000 yards",
          "3000 - 4000 yards",
          "4000 - 5000 yards",
          "5000 - 6000 yards",
          "> 6000 yards"
        ];
        break;
      case 'Running':
        label = "Desired Workout Distance (Run):";
        options = [
          "< 2 miles",
          "2 - 4 miles",
          "4 - 6 miles",
          "6 - 8 miles",
          "8 - 10 miles",
          "> 10 miles"
        ];
        break;
      case 'Cycling':
        label = "Desired Workout Distance (Bike):";
        options = [
          "< 10 miles",
          "10 - 25 miles",
          "25 - 50 miles",
          "50 - 75 miles",
          "75 - 100 miles",
          "> 100 miles"
        ];
        break;
      default:
        label = "Desired Workout Distance:";
        options = ["N/A"];
    }

    return (
      <div>
        <label htmlFor="desiredWorkoutDistance" className="block text-gray-700 font-medium mb-1.5 text-sm">{label}</label>
        <select
          id="desiredWorkoutDistance"
          value={desiredWorkoutDistance}
          onChange={(e) => setDesiredWorkoutDistance(e.target.value)}
          className="w-full p-3 border border-gray-300 rounded-lg focus:ring-indigo-500 focus:border-indigo-500 shadow-sm transition duration-150 ease-in-out text-base appearance-none bg-white pr-8 cursor-pointer"
          aria-label={label}
        >
          <option value="">Select a distance range...</option>
          {options.map((option, index) => (
            <option key={index} value={option}>{option}</option>
          ))}
        </select>
      </div>
    );
  };

  const renderPerformanceMetricInput = () => {
    let label = "";
    let options = [];

    switch (sportType) {
      case 'Swimming':
        label = "Recent 10x100s Pace:";
        options = [
          "<1:00", "1:00-1:05", "1:05-1:10", "1:10-1:15", "1:15-1:20",
          "1:20-1:25", "1:25-1:30", "1:30-1:35", "1:35-1:40", ">1:40"
        ];
        break;
      case 'Running':
        label = "Recent Average Mile Pace (2-3 miles):";
        options = [
          "<5:00 min/mile", "5:00-6:00 min/mile", "6:00-7:00 min/mile",
          "7:00-8:00 min/mile", "8:00-9:00 min/mile", "9:00-10:00 min/mile",
          ">10:00 min/mile"
        ];
        break;
      case 'Cycling':
        label = "Recent Average Mile Pace (10 miles):";
        options = [
          "<3:00 min/mile",
          "3:00-3:30 min/mile",
          "3:30-4:00 min/mile",
          "4:00-4:30 min/mile",
          "4:30-5:00 min/mile",
          ">5:00 min/mile"
        ];
        break;
      default:
        label = "Recent Performance Metric:";
        options = ["N/A"];
    }

    return (
      <div>
        <label htmlFor="performanceMetric" className="block text-gray-700 font-medium mb-1.5 text-sm">{label}</label>
        <select
          id="performanceMetric"
          value={performanceMetric}
          onChange={(e) => setPerformanceMetric(e.target.value)}
          className="w-full p-3 border border-gray-300 rounded-lg focus:ring-indigo-500 focus:border-indigo-500 shadow-sm transition duration-150 ease-in-out text-base appearance-none bg-white pr-8 cursor-pointer"
          aria-label={label}
        >
          <option value="">Select a pace...</option>
          {options.map((option, index) => (
            <option key={index} value={option}>{option}</option>
          ))}
        </select>
      </div>
    );
  };


  return (
    <section className="bg-white p-6 md:p-8 rounded-2xl shadow-lg border border-blue-100 mb-8 font-inter">
      <h2 className="text-2xl md:text-3xl font-extrabold text-indigo-800 mb-4 tracking-tight">Daily Data & Workout Generation</h2>
      <p className="text-gray-700 mb-6 leading-relaxed text-base">Enter your daily metrics below. The AI will consider these inputs along with your profile settings (configured in <span className="font-semibold text-violet-700">Settings</span>) to craft your personalized sport workout, potentially including a complimentary lifting session.</p>

      {/* Day-to-day Health Data Inputs */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-5 mb-8">
          {renderDesiredWorkoutDistanceInput()}

          {/* Workout Focus (Always visible) */}
          <div>
            <label htmlFor="workoutFocus" className="block text-gray-700 font-medium mb-1.5 text-sm">Primary Workout Focus:</label>
            <select
              id="workoutFocus"
              value={workoutFocus}
              onChange={(e) => setWorkoutFocus(e.target.value)}
              className="w-full p-3 border border-gray-300 rounded-lg focus:ring-indigo-500 focus:border-indigo-500 shadow-sm transition duration-150 ease-in-out text-base appearance-none bg-white pr-8 cursor-pointer"
              aria-label="Primary Workout Focus"
            >
              <option value="">Select a focus...</option>
              <option value="Endurance">Endurance</option>
              <option value="Speed">Speed</option>
              <option value="Threshold">Threshold</option>
              <option value="Technique">Technique</option>
              <option value="Recovery">Recovery</option>
              <option value="Strength/Power">Strength/Power</option>
              <option value="Mixed">Mixed</option>
            </select>
          </div>

          {renderPerformanceMetricInput()}

          {/* Conditional Inputs based on trackerBrand */}
          {showMetric('heartRateResting') && (
              <div>
                <label htmlFor="heartRateResting" className="block text-gray-700 font-medium mb-1.5 text-sm">Resting Heart Rate (bpm):</label>
                <input
                  type="number"
                  id="heartRateResting"
                  value={heartRateResting}
                  onChange={(e) => setHeartRateResting(Number(e.target.value))}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-indigo-500 focus:border-indigo-500 shadow-sm transition duration-150 ease-in-out text-base"
                  aria-label="Resting Heart Rate"
                  min="0"
                />
              </div>
          )}
          {showMetric('sleepHours') && (
              <div>
                <label htmlFor="sleepHours" className="block text-gray-700 font-medium mb-1.5 text-sm">Sleep Hours (last night):</label>
                <input
                  type="number"
                  id="sleepHours"
                  step="0.1"
                  value={sleepHours}
                  onChange={(e) => setSleepHours(Number(e.target.value))}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-indigo-500 focus:border-indigo-500 shadow-sm transition duration-150 ease-in-out text-base"
                  aria-label="Sleep Hours"
                  min="0"
                  max="24"
                />
              </div>
          )}
          {showMetric('sleepScore') && (
              <div>
                <label htmlFor="sleepScore" className="block text-gray-700 font-medium mb-1.5 text-sm">Sleep Score (1-100):</label>
                <input
                  type="number"
                  id="sleepScore"
                  value={sleepScore}
                  onChange={(e) => setSleepScore(Math.max(1, Math.min(100, Number(e.target.value))))}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-indigo-500 focus:border-indigo-500 shadow-sm transition duration-150 ease-in-out text-base"
                  aria-label="Sleep Score"
                  min="1"
                  max="100"
                />
              </div>
          )}
          {showMetric('energyScore') && ( // Garmin Body Battery, Fitbit Readiness Score
              <div>
                <label htmlFor="energyScore" className="block text-gray-700 font-medium mb-1.5 text-sm">Energy/Readiness Score (1-100):</label>
                <input
                  type="number"
                  id="energyScore"
                  value={energyScore}
                  onChange={(e) => setEnergyScore(Math.max(1, Math.min(100, Number(e.target.value))))}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-indigo-500 focus:border-indigo-500 shadow-sm transition duration-150 ease-in-out text-base"
                  aria-label="Energy Score"
                  min="1"
                  max="100"
                />
              </div>
          )}
      </div>

      <button
        onClick={generateWorkout}
        disabled={loading || !isAuthReady}
        className={`w-full py-4 px-6 rounded-xl text-white font-bold text-xl shadow-lg transform transition-all duration-300 hover:scale-105 active:scale-95 flex items-center justify-center
                   ${loading || !isAuthReady ? 'bg-gray-400 cursor-not-allowed' : 'bg-gradient-to-r from-violet-700 to-indigo-600 hover:from-violet-800 hover:to-indigo-700 focus:outline-none focus:ring-4 focus:ring-indigo-300'}`}
      >
        {loading ? (
            <span className="flex items-center">
                <svg className="animate-spin -ml-1 mr-3 h-6 w-6 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Designing Workout...
            </span>
        ) : (isAuthReady ? 'Design My Sport Workout!' : 'Loading App...')}
      </button>
    </section>
  );
};

export default DesignerPage;