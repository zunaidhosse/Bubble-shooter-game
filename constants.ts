
import { BubbleColor } from './types';

export const BOARD_WIDTH = 10;
export const BOARD_HEIGHT = 12;

export const BUBBLE_COLORS: BubbleColor[] = ['red', 'green', 'blue', 'yellow', 'purple', 'orange'];

export const COLOR_MAP: Record<BubbleColor, string> = {
  red: '#ef4444',
  green: '#22c55e',
  blue: '#3b82f6',
  yellow: '#eab308',
  purple: '#a855f7',
  orange: '#f97316',
};

export const SHOTS_BEFORE_NEW_ROW = 5;
export const PROJECTILE_SPEED = 15;
