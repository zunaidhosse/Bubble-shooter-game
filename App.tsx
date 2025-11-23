
import React, { useState, useEffect } from 'react';
import GameBoard from './components/GameBoard';
import StartScreen from './components/StartScreen';
import GameOverModal from './components/GameOverModal';
import { GameState } from './types';
import { useGameLogic } from './hooks/useGameLogic';

const App: React.FC = () => {
  const [dimensions, setDimensions] = useState({ width: window.innerWidth, height: window.innerHeight });

  useEffect(() => {
    const handleResize = () => {
      setDimensions({ width: window.innerWidth, height: window.innerHeight });
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const {
    gameState,
    score,
    startGame,
    bubbles,
    shooter,
    projectile,
    aimLine,
    handleMouseMove,
    handleClick,
    bubbleRadius,
    getBubblePixelPos,
  } = useGameLogic(dimensions.width, dimensions.height);

  const renderGameState = () => {
    const gameBoardProps = {
      width: dimensions.width,
      height: dimensions.height,
      bubbles,
      shooter,
      projectile,
      aimLine,
      score,
      gameState,
      bubbleRadius,
      getBubblePixelPos,
    };

    switch (gameState) {
      case GameState.READY:
        return <StartScreen onStart={startGame} />;
      case GameState.GAME_OVER:
        return (
          <>
            <GameBoard
              {...gameBoardProps}
              handleMouseMove={() => {}}
              handleClick={() => {}}
            />
            <GameOverModal score={score} onRestart={startGame} />
          </>
        );
      case GameState.PLAYING:
      default:
        return (
          <GameBoard
            {...gameBoardProps}
            handleMouseMove={handleMouseMove}
            handleClick={handleClick}
          />
        );
    }
  };

  return (
    <div className="w-screen h-screen flex flex-col items-center bg-gradient-to-br from-gray-900 to-slate-800 text-white font-mono overflow-hidden">
      <div className="absolute top-0 left-0 right-0 z-20 pt-4 text-center bg-black bg-opacity-20 backdrop-blur-sm">
        <h1 className="text-3xl md:text-4xl font-bold text-cyan-300 tracking-wider" style={{ textShadow: '0 0 10px #22d3ee, 0 0 20px #22d3ee' }}>
          Bubble Shooter
        </h1>
        <p className="text-xs text-gray-400 mb-2">রঙ মিলিয়ে বাবল ফাটান!</p>
      </div>
      <div className="relative w-full h-full">
        {renderGameState()}
      </div>
    </div>
  );
};

export default App;
