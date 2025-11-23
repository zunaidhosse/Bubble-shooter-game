
import React from 'react';
import { Bubble as BubbleType } from '../types';
import { COLOR_MAP } from '../constants';

interface BubbleProps {
  bubble: BubbleType;
  x: number;
  y: number;
  radius: number;
}

const Bubble: React.FC<BubbleProps> = ({ bubble, x, y, radius }) => {
  const color = COLOR_MAP[bubble.color];

  return (
    <g transform={`translate(${x}, ${y})`}>
      <defs>
        <radialGradient id={`grad-${bubble.color}`} cx="30%" cy="30%" r="70%">
          <stop offset="0%" style={{ stopColor: 'rgba(255,255,255,0.4)' }} />
          <stop offset="100%" style={{ stopColor: color }} />
        </radialGradient>
      </defs>
      <circle
        r={radius}
        fill={`url(#grad-${bubble.color})`}
        stroke={color}
        strokeWidth="1"
      />
    </g>
  );
};

export default Bubble;
