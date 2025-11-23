
import React from 'react';

interface GameOverModalProps {
  score: number;
  onRestart: () => void;
}

const GameOverModal: React.FC<GameOverModalProps> = ({ score, onRestart }) => {
  return (
    <div className="absolute inset-0 bg-black bg-opacity-70 flex flex-col items-center justify-center z-10">
      <div className="bg-slate-800 p-8 rounded-lg shadow-2xl text-center border border-slate-600">
        <h2 className="text-4xl font-bold text-red-500 mb-2">Game Over</h2>
        <p className="text-xl text-gray-300 mb-4">Your final score is:</p>
        <p className="text-5xl font-bold text-cyan-300 mb-8">{score}</p>
        <button
          onClick={onRestart}
          className="px-8 py-3 bg-cyan-500 text-gray-900 font-bold rounded-lg hover:bg-cyan-400 transition-colors duration-300 text-xl shadow-lg hover:shadow-cyan-500/50"
        >
          Play Again
        </button>
      </div>
    </div>
  );
};

export default GameOverModal;
