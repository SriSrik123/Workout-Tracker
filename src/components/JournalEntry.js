import React from 'react';

const JournalEntry = ({
  selectedDate,
  journalEntry,
  setJournalEntry,
  handleSaveJournalEntry,
  trackerLoading,
  isAuthReady,
}) => {
  return (
    <div className="p-5 bg-purple-50 rounded-xl border border-purple-200">
      <h3 className="text-xl font-bold text-purple-800 mb-4">Journal for {selectedDate}:</h3>
      <textarea
        value={journalEntry}
        onChange={(e) => setJournalEntry(e.target.value)}
        rows="6"
        className="w-full p-3 border-2 border-gray-300 rounded-lg focus:ring-purple-500 focus:border-purple-500 mb-4 resize-y shadow-sm transition duration-150 ease-in-out placeholder-gray-500 text-base"
        placeholder="Reflect on your day, how you feel, goals for tomorrow, etc."
      ></textarea>
      <button
        onClick={handleSaveJournalEntry}
        disabled={trackerLoading || !isAuthReady}
        className={`w-full py-3 px-6 rounded-lg text-white font-bold text-lg shadow-md transform transition-all duration-300 hover:scale-105 active:scale-95 focus:outline-none focus:ring-4 focus:ring-purple-300
                   ${trackerLoading || !isAuthReady ? 'bg-gray-400 cursor-not-allowed' : 'bg-purple-600 hover:bg-purple-700'}`}
      >
        {trackerLoading ? 'Saving Journal...' : 'Save Journal Entry'}
      </button>
    </div>
  );
};

export default JournalEntry;