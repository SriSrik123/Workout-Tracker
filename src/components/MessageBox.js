import React from 'react';

const MessageBox = ({ text, type, onClose }) => {
  if (!text) return null;

  // Use more refined shades for semantic messages
  const bgColor = type === 'error' ? 'bg-red-600' : 'bg-emerald-500'; // Changed green
  const icon = type === 'error' ? (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 14l2-2m0 0l2-2m-2 2l2 2m7-2A9 9 0 1112 3a9 9 0 017 9z" />
    </svg>
  ) : (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
    </svg>
  );

  return (
    <div className={`fixed top-6 left-1/2 -translate-x-1/2 p-4 pr-10 rounded-xl shadow-2xl z-50 transform transition-all duration-300 ease-out-back flex items-center
                    ${bgColor} text-white font-inter animate-slideInDown`}>
      <button
        onClick={onClose}
        className="absolute top-2 right-2 text-3xl font-bold text-white hover:text-gray-200 transition-colors duration-200 p-1 rounded-full"
        aria-label="Close message"
      >
        &times;
      </button>
      {icon}
      <p className="font-semibold text-lg">{text}</p>
    </div>
  );
};

export default MessageBox;