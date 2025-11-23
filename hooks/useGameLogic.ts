
import React, { useState, useEffect, useCallback, useRef } from 'react';
import {
  Bubble,
  BubbleColor,
  GameState,
  Shooter,
  Projectile,
  AimLine,
} from '../types';
import {
  BOARD_WIDTH,
  BUBBLE_COLORS,
  SHOTS_BEFORE_NEW_ROW,
} from '../constants';

export const useGameLogic = (width: number, height: number) => {
  const bubbleRadius = width / (BOARD_WIDTH * 2 + 1.5);
  const projectileSpeed = height / 45;
  const verticalSpacing = bubbleRadius * 1.75; // Vertical distance between bubble centers

  const [gameState, setGameState] = useState<GameState>(GameState.READY);
  const [bubbles, setBubbles] = useState<Bubble[]>([]);
  const [shooter, setShooter] = useState<Shooter>({
    currentBubble: 'red',
    nextBubble: 'blue',
    angle: -90,
  });
  const [projectile, setProjectile] = useState<Projectile | null>(null);
  const [score, setScore] = useState(0);
  const [shotsFired, setShotsFired] = useState(0);
  const [aimLine, setAimLine] = useState<AimLine>({ x1: 0, y1: 0, x2: 0, y2: 0 });

  const animationFrameId = useRef<number>();
  const bubblesRef = useRef(bubbles);
  useEffect(() => {
    bubblesRef.current = bubbles;
  }, [bubbles]);

  const getBubblePixelPos = useCallback((row: number, col: number) => {
    const x = bubbleRadius + col * bubbleRadius * 2 + (row % 2) * bubbleRadius;
    const y = bubbleRadius + row * verticalSpacing;
    return { x, y };
  }, [bubbleRadius, verticalSpacing]);

  const getNeighbors = useCallback((row: number, col: number, bubbleList: Bubble[]) => {
    const isEvenRow = row % 2 === 0;
    const neighborCoords = isEvenRow 
      ? [
          [row, col - 1], [row, col + 1],
          [row - 1, col], [row - 1, col -1],
          [row + 1, col], [row + 1, col -1],
        ] 
      : [
          [row, col - 1], [row, col + 1],
          [row - 1, col], [row - 1, col + 1],
          [row + 1, col], [row + 1, col + 1],
        ];
    return neighborCoords.map(([r, c]) => 
        bubbleList.find(b => b.row === r && b.col === c)
    ).filter((b): b is Bubble => b !== undefined);
  }, []);

  const findConnectedBubbles = useCallback((bubbleList: Bubble[]) => {
    const connected = new Set<number>();
    const q = bubbleList.filter(b => b.row === 0);
    q.forEach(b => connected.add(b.id));

    while (q.length > 0) {
        const current = q.shift()!;
        getNeighbors(current.row, current.col, bubbleList).forEach(neighbor => {
            if (!connected.has(neighbor.id)) {
                connected.add(neighbor.id);
                q.push(neighbor);
            }
        });
    }
    return bubbleList.filter(b => connected.has(b.id));
  }, [getNeighbors]);

  const getRandomColor = useCallback((): BubbleColor => {
    // FIX: Removed redundant `.filter(Boolean)` which may confuse type inference.
    const availableColors = Array.from(new Set(bubblesRef.current.map(b => b.color)));
    if (availableColors.length === 0) {
        return BUBBLE_COLORS[Math.floor(Math.random() * BUBBLE_COLORS.length)];
    }
    // FIX: Add type assertion to ensure return type matches BubbleColor.
    // This is safe because we've checked that availableColors is not empty.
    return availableColors[Math.floor(Math.random() * availableColors.length)] as BubbleColor;
  }, []);
  
  const addNewRow = useCallback(() => {
    setBubbles(prev => {
        const newBubbles = prev.map(b => ({...b, row: b.row + 1, id: b.id}));
        const cols = BOARD_WIDTH;
        for (let col = 0; col < cols; col++) {
            newBubbles.push({
                id: Date.now() + col,
                color: BUBBLE_COLORS[Math.floor(Math.random() * BUBBLE_COLORS.length)],
                row: 0,
                col,
            });
        }
        if (newBubbles.some(b => getBubblePixelPos(b.row, b.col).y >= height - bubbleRadius * 3)) {
            setGameState(GameState.GAME_OVER);
        }
        return newBubbles;
    })
  }, [getBubblePixelPos, height, bubbleRadius]);

  const processNewBubble = useCallback((newBubble: Bubble) => {
    let bubblesAfterSnap = [...bubblesRef.current, newBubble];
    
    const q = [newBubble];
    const visited = new Set([newBubble.id]);
    const matched = [newBubble];
    
    while(q.length > 0) {
        const current = q.shift()!;
        getNeighbors(current.row, current.col, bubblesAfterSnap).forEach(neighbor => {
            if (neighbor.color === newBubble.color && !visited.has(neighbor.id)) {
                visited.add(neighbor.id);
                q.push(neighbor);
                matched.push(neighbor);
            }
        })
    }
    
    let finalBubbles = bubblesAfterSnap;
    if (matched.length >= 3) {
        const matchedIds = new Set(matched.map(b => b.id));
        let bubblesAfterPop = bubblesAfterSnap.filter(b => !matchedIds.has(b.id));
        
        const connectedToTop = findConnectedBubbles(bubblesAfterPop);
        const connectedIds = new Set(connectedToTop.map(b => b.id));
        const floatingBubbles = bubblesAfterPop.filter(b => !connectedIds.has(b.id));

        finalBubbles = bubblesAfterPop.filter(b => connectedIds.has(b.id));
        setScore(s => s + matched.length * 10 + floatingBubbles.length * 20);
    }
    
    if (finalBubbles.some(b => getBubblePixelPos(b.row, b.col).y >= height - bubbleRadius * 3)) {
        setGameState(GameState.GAME_OVER);
    }

    setBubbles(finalBubbles);

    setShotsFired(s => {
        const newShots = s + 1;
        if (newShots >= SHOTS_BEFORE_NEW_ROW) {
            addNewRow();
            return 0;
        }
        return newShots;
    });

    setShooter(prev => ({
        ...prev,
        currentBubble: prev.nextBubble,
        nextBubble: getRandomColor()
    }));
  }, [getRandomColor, findConnectedBubbles, getNeighbors, addNewRow, getBubblePixelPos, height, bubbleRadius]);

  const stopGameLoop = useCallback(() => {
    if (animationFrameId.current) {
        cancelAnimationFrame(animationFrameId.current);
    }
  }, []);
  
  const snapProjectile = useCallback((proj: Projectile) => {
    stopGameLoop();
    setProjectile(null);

    let closestRow = -1;
    let closestCol = -1;
    let minDistance = Infinity;

    const maxRow = Math.max(0, Math.floor(proj.y / verticalSpacing) + 2);

    for (let row = 0; row < maxRow; row++) {
        const cols = row % 2 === 0 ? BOARD_WIDTH : BOARD_WIDTH -1;
        for (let col = 0; col < cols; col++) {
            if (bubblesRef.current.some(b => b.row === row && b.col === col)) continue;
            
            const { x: bx, y: by } = getBubblePixelPos(row, col);
            const dist = Math.sqrt(Math.pow(proj.x - bx, 2) + Math.pow(proj.y - by, 2));

            if(dist < bubbleRadius * 2 && dist < minDistance) {
                minDistance = dist;
                closestRow = row;
                closestCol = col;
            }
        }
    }

    if (closestRow === -1 || closestCol === -1) {
        closestRow = Math.max(0, Math.round((proj.y - bubbleRadius) / verticalSpacing));
        closestCol = Math.round((proj.x - bubbleRadius - (closestRow % 2) * bubbleRadius) / (bubbleRadius * 2));
    }
    
    const maxCols = closestRow % 2 === 0 ? BOARD_WIDTH : BOARD_WIDTH - 1;
    closestCol = Math.max(0, Math.min(closestCol, maxCols < 0 ? 0 : maxCols - 1));

    const newBubble: Bubble = {
        id: Date.now(),
        color: proj.color,
        row: closestRow,
        col: closestCol
    };
    
    processNewBubble(newBubble);
  }, [stopGameLoop, verticalSpacing, getBubblePixelPos, bubbleRadius, processNewBubble]);

  const gameLoop = useCallback(() => {
    setProjectile((prev) => {
      if (!prev) return null;

      let { x, y, vx, vy, color } = prev;
      x += vx;
      y += vy;

      if (x - bubbleRadius < 0 || x + bubbleRadius > width) {
        vx = -vx;
      }
      if (y - bubbleRadius < 0) {
        y = bubbleRadius;
        snapProjectile({ ...prev, x, y, vx, vy });
        return null;
      }
      
      for (const bubble of bubblesRef.current) {
        const { x: bx, y: by } = getBubblePixelPos(bubble.row, bubble.col);
        const dx = x - bx;
        const dy = y - by;
        const dist = Math.sqrt(dx * dx + dy * dy);
        if (dist < bubbleRadius * 2) {
          snapProjectile({ ...prev, x, y, vx, vy });
          return null;
        }
      }

      return { x, y, vx, vy, color };
    });
    animationFrameId.current = requestAnimationFrame(gameLoop);
  }, [width, bubbleRadius, getBubblePixelPos, snapProjectile]);

  const generateInitialBubbles = useCallback(() => {
    let newBubbles: Bubble[] = [];
    let idCounter = 0;
    for (let row = 0; row < 5; row++) {
      const cols = row % 2 === 0 ? BOARD_WIDTH : BOARD_WIDTH -1;
      for (let col = 0; col < cols; col++) {
        newBubbles.push({
          id: idCounter++,
          color: BUBBLE_COLORS[Math.floor(Math.random() * BUBBLE_COLORS.length)],
          row,
          col,
        });
      }
    }
    setBubbles(newBubbles);
    setShooter({
        currentBubble: getRandomColor(),
        nextBubble: getRandomColor(),
        angle: -90,
    });
  }, [getRandomColor]);

  const startGame = useCallback(() => {
    generateInitialBubbles();
    setScore(0);
    setShotsFired(0);
    setProjectile(null);
    setGameState(GameState.PLAYING);
  }, [generateInitialBubbles]);

  useEffect(() => {
    if (gameState === GameState.PLAYING && projectile) {
      animationFrameId.current = requestAnimationFrame(gameLoop);
    }
    return () => stopGameLoop();
  }, [gameState, projectile, gameLoop, stopGameLoop]);

  const handleMouseMove = useCallback((e: React.MouseEvent<SVGSVGElement>) => {
    if (gameState !== GameState.PLAYING) return;
    
    const x = e.clientX;
    const y = e.clientY;
    
    const shooterX = width / 2;
    const shooterY = height - bubbleRadius * 2.5;

    const dx = x - shooterX;
    const dy = y - shooterY;
    let angle = Math.atan2(dy, dx) * 180 / Math.PI;

    if (angle > -10) angle = -10;
    if (angle < -170) angle = -170;

    setShooter(prev => ({ ...prev, angle }));

    const rad = angle * Math.PI / 180;
    setAimLine({
        x1: shooterX,
        y1: shooterY,
        x2: shooterX + Math.cos(rad) * height,
        y2: shooterY + Math.sin(rad) * height,
    })
  }, [gameState, width, height, bubbleRadius]);

  const handleClick = useCallback((e: React.MouseEvent<SVGSVGElement>) => {
    if (gameState !== GameState.PLAYING || projectile) return;

    const x = e.clientX;
    const y = e.clientY;
    
    const shooterX = width / 2;
    const shooterY = height - bubbleRadius * 2.5;

    const dx = x - shooterX;
    const dy = y - shooterY;

    if (dy >= 0) return;
    
    let angleDegrees = Math.atan2(dy, dx) * 180 / Math.PI;

    if (angleDegrees > -10) angleDegrees = -10;
    if (angleDegrees < -170) angleDegrees = -170;

    const angleRad = angleDegrees * Math.PI / 180;

    setProjectile({
      x: shooterX,
      y: shooterY,
      vx: Math.cos(angleRad) * projectileSpeed,
      vy: Math.sin(angleRad) * projectileSpeed,
      color: shooter.currentBubble,
    });
  }, [gameState, projectile, width, height, bubbleRadius, projectileSpeed, shooter.currentBubble]);

  return {
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
  };
};
