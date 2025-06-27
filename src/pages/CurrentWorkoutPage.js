import React from 'react';
import { marked } from 'marked';

const CurrentWorkoutPage = ({
  generatedWorkout,
  saveCurrentWorkoutToHistory,
  loading,
  isAuthReady,
  userQuestion,
  setUserQuestion,
  askAiAboutWorkout,
  aiQALoading,
  aiAnswer
}) => {
  return (
    <section className="bg-white p-6 md:p-8 rounded-2xl shadow-lg border border-blue-100 font-inter">
      <h2 className="text-2xl md:text-3xl font-extrabold text-blue-800 mb-4 tracking-tight">Current Workout</h2>
      {!generatedWorkout ? (
        <p className="text-gray-700 p-4 rounded-lg bg-yellow-50 border border-yellow-200 text-base">No workout generated yet. Please go to the <span className="font-semibold">"Workout Designer"</span> tab to create a new workout plan!</p>
      ) : (
        <div>
          <h3 className="text-xl md:text-2xl font-bold text-violet-700 mb-3 pb-2 border-b-2 border-violet-200">Your Latest Workout Plan:</h3>
          <div
            className="prose prose-blue max-w-none text-gray-800 leading-relaxed bg-blue-50 p-4 md:p-6 rounded-lg shadow-inner border border-blue-200 overflow-x-auto text-base" // Reverted to prose-blue
            dangerouslySetInnerHTML={{ __html: marked.parse(generatedWorkout) }}
          />

          <div className="mt-8 flex justify-center">
            <button
              onClick={saveCurrentWorkoutToHistory}
              disabled={loading || !isAuthReady}
              className={`py-3.5 px-8 rounded-xl text-white font-bold text-lg shadow-md transform transition-all duration-300 hover:scale-105 active:scale-95 focus:outline-none focus:ring-4 focus:ring-emerald-300
                         ${loading || !isAuthReady ? 'bg-gray-400 cursor-not-allowed' : 'bg-emerald-600 hover:bg-emerald-700'}`}
            >
              {loading ? 'Saving...' : 'Mark as Done & Save to Calendar'}
            </button>
          </div>

          <div className="mt-12 pt-8 border-t-2 border-gray-200">
            <h3 className="text-xl md:text-2xl font-bold text-violet-700 mb-4">Request New Workout or Adjustment:</h3>
            <textarea
              className="w-full p-3 md:p-4 border-2 border-gray-300 rounded-lg focus:ring-indigo-500 focus:border-indigo-500 mb-4 resize-y shadow-sm transition duration-150 ease-in-out placeholder-gray-500 text-base"
              rows="4"
              placeholder="e.g., 'Make this workout shorter, I have less time today', 'Can you make this more focused on speed?', 'I feel tired, suggest an easier alternative for the main set', 'Include more core exercises', 'Adjust for bodyweight only'"
              value={userQuestion}
              onChange={(e) => setUserQuestion(e.target.value)}
            ></textarea>
            <button
              onClick={askAiAboutWorkout}
              disabled={aiQALoading || !userQuestion.trim()}
              className={`py-2.5 px-6 rounded-lg text-white font-semibold shadow-md transform transition-all duration-300 hover:scale-105 active:scale-95 focus:outline-none focus:ring-4 focus:ring-indigo-300 flex items-center justify-center
                         ${aiQALoading || !userQuestion.trim() ? 'bg-gray-400 cursor-not-allowed' : 'bg-indigo-600 hover:bg-indigo-700'}`}
            >
              {aiQALoading ? (
                  <span className="flex items-center">
                      <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      Regenerating Workout...
                  </span>
              ) : 'Regenerate Workout with Feedback'}
            </button>

            {aiAnswer && (
              <div className="mt-6 p-4 md:p-6 bg-violet-50 rounded-lg shadow-md border border-violet-200">
                <h4 className="font-bold text-violet-800 mb-3 text-lg">AI's Response:</h4>
                <div className="prose prose-blue max-w-none text-gray-800 leading-relaxed text-base" // Reverted to prose-blue
                     dangerouslySetInnerHTML={{ __html: marked.parse(aiAnswer) }}
                />
              </div>
            )}
          </div>
        </div>
      )}
    </section>
  );
};

export default CurrentWorkoutPage;