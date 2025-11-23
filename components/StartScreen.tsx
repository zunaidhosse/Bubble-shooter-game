
import React from 'react';

interface StartScreenProps {
  onStart: () => void;
}

const StartScreen: React.FC<StartScreenProps> = ({ onStart }) => {
  return (
    <div className="absolute inset-0 bg-black bg-opacity-70 flex flex-col items-center justify-center z-10 p-4">
      <div className="text-center">
        <h2 className="text-5xl font-bold text-cyan-300 mb-4 animate-pulse">Welcome!</h2>
        <p className="text-lg text-gray-300 mb-8">Match 3 or more bubbles of the same color to pop them.</p>
        <button
          onClick={onStart}
          className="px-10 py-4 bg-green-500 text-white font-bold rounded-lg hover:bg-green-400 transition-colors duration-300 text-2xl shadow-lg hover:shadow-green-500/50"
        >
          Start Game
        </button>
      </div>
    </div>
  );
};

export default StartScreen;
