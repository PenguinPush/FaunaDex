import React from 'react';

const Description = ({ title, timesCaught, description, image, onBack }) => {
  return (
    <div className="flex flex-col items-center p-4 h-screen bg-gray-100">
      <button
        className="text-lg font-bold text-blue-500 hover:text-blue-700 mb-4"
        onClick={onBack}
      >
        ← Back
      </button>
      <div className="flex flex-col items-center bg-white shadow-lg rounded-lg p-6">
        <div className="relative w-full h-64 mb-4">
          <img
            src={image}
            alt={title}
            className="w-full h-full object-cover rounded-lg"
          />
        </div>
        <div className="text-gray-700 text-sm mb-2">
          Caught: {timesCaught} time{timesCaught !== 1 ? 's' : ''}
        </div>
        <div className="w-full h-2 bg-gray-300 rounded-lg mb-2"></div>
        <div className="w-full h-2 bg-gray-400 rounded-lg mb-4"></div>
        <div className="text-center">
          <p className="text-xl font-bold text-gray-800 mb-2">{title}</p>
          <p className="text-base text-gray-600">{description}</p>
        </div>
      </div>
    </div>
  );
};

export default Description;
