
import React, { useState, useEffect } from 'react';
import { Bubble as BubbleType, Shooter, Projectile, AimLine, GameState } from '../types';
import { COLOR_MAP } from '../constants';
import Bubble from './Bubble';
import Scoreboard from './Scoreboard';

interface GameBoardProps {
  width: number;
  height: number;
  bubbles: BubbleType[];
  shooter: Shooter;
  projectile: Projectile | null;
  aimLine: AimLine;
  handleMouseMove: (e: React.MouseEvent<SVGSVGElement>) => void;
  handleClick: (e: React.MouseEvent<SVGSVGElement>) => void;
  score: number;
  gameState: GameState;
  bubbleRadius: number;
  getBubblePixelPos: (row: number, col: number) => { x: number; y: number };
}

const GameBoard: React.FC<GameBoardProps> = ({
  width,
  height,
  bubbles,
  shooter,
  projectile,
  aimLine,
  handleMouseMove,
  handleClick,
  score,
  gameState,
  bubbleRadius,
  getBubblePixelPos,
}) => {
  const [isShooting, setIsShooting] = useState(false);

  useEffect(() => {
    // When a projectile is created, trigger the shooting animation
    if (projectile) {
      setIsShooting(true);
      // Reset the animation state after it finishes
      const timer = setTimeout(() => setIsShooting(false), 150); // Corresponds to animation duration
      return () => clearTimeout(timer);
    }
  }, [projectile]);

  const shooterX = width / 2;
  const shooterY = height - bubbleRadius * 2.5;

  return (
    <div className="w-full h-full flex flex-col">
      <Scoreboard score={score} />
      <div className="flex-grow relative">
        <svg
          width={width}
          height={height}
          onMouseMove={gameState === GameState.PLAYING ? handleMouseMove : undefined}
          onClick={gameState === GameState.PLAYING ? handleClick : undefined}
          className="w-full h-full cursor-crosshair bg-gradient-to-br from-gray-900 to-slate-800"
        >
          {/* Top boundary */}
          <line x1="0" y1="1" x2={width} y2="1" stroke="#475569" strokeWidth="2" />

          {/* Render static bubbles */}
          {bubbles.map((bubble) => {
            const { x, y } = getBubblePixelPos(bubble.row, bubble.col);
            return <Bubble key={bubble.id} bubble={bubble} x={x} y={y} radius={bubbleRadius} />;
          })}
          
          {/* Render projectile */}
          {projectile && (
            <circle
              cx={projectile.x}
              cy={projectile.y}
              r={bubbleRadius}
              fill={COLOR_MAP[projectile.color]}
            />
          )}

          {/* Render Shooter and Aim Line */}
          {gameState === GameState.PLAYING && (
            <>
              {/* Aim Line */}
              <line
                x1={aimLine.x1}
                y1={aimLine.y1}
                x2={aimLine.x2}
                y2={aimLine.y2}
                stroke="rgba(255, 255, 255, 0.4)"
                strokeWidth="2"
                strokeDasharray="4 4"
              />
              
              {/* Alien Shooter Character */}
              <text
                x={shooterX}
                y={height - bubbleRadius * 0.5}
                textAnchor="middle"
                fontSize={bubbleRadius * 4}
                style={{
                  filter: 'drop-shadow(3px 5px 2px #00000040)',
                  transformOrigin: 'center bottom',
                  transition: 'transform 0.1s ease-out',
                  transform: isShooting ? 'scale(0.95, 0.9) translateY(2px)' : 'scale(1)',
                }}
              >
                👽
              </text>

              {/* Next Bubble Preview */}
              <g transform={`translate(${shooterX + bubbleRadius * 3.5}, ${height - bubbleRadius * 1.8})`}>
                <text x="0" y={-bubbleRadius * 1.2} textAnchor="middle" fontSize={bubbleRadius * 0.7} fill="#94a3b8">Next</text>
                <circle
                  r={bubbleRadius * 0.7}
                  fill={COLOR_MAP[shooter.nextBubble]}
                  stroke="#cbd5e1"
                  strokeWidth="1"
                />
              </g>

              {/* Current Bubble (hide if projectile is active) */}
              {!projectile && (
                <circle
                  cx={shooterX}
                  cy={shooterY}
                  r={bubbleRadius}
                  fill={COLOR_MAP[shooter.currentBubble]}
                />
              )}
            </>
          )}
        </svg>
      </div>
    </div>
  );
};

export default GameBoard;
