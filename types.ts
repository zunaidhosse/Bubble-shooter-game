
export enum GameState {
  READY,
  PLAYING,
  GAME_OVER,
}

export type BubbleColor = 'red' | 'green' | 'blue' | 'yellow' | 'purple' | 'orange';

export interface Bubble {
  id: number;
  color: BubbleColor;
  row: number;
  col: number;
}

export interface Shooter {
  currentBubble: BubbleColor;
  nextBubble: BubbleColor;
  angle: number;
}

export interface Projectile {
  x: number;
  y: number;
  vx: number;
  vy: number;
  color: BubbleColor;
}

export interface AimLine {
  x1: number;
  y1: number;
  x2: number;
  y2: number;
}
