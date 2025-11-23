import React from 'react';

interface ScoreboardProps {
  score: number;
}

const Scoreboard: React.FC<ScoreboardProps> = ({ score }) => {
  return (
    <div className="flex justify-center items-center p-3 bg-slate-900/50 border-b border-slate-700">
      <div className="text-center">
        <span className="text-sm text-gray-400">Score</span>
        <p className="text-2xl font-bold text-cyan-300">{score}</p>
      </div>
    </div>
  );
};

export default Scoreboard;