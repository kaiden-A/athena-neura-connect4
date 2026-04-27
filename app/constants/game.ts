// app/constants/game.ts
import { DifficultyConfig, Player } from '../types/game';

export const ROWS = 6;
export const COLS = 7;
export const WIN_LENGTH = 4;

export const DIFFICULTY: Record<string, DifficultyConfig> = {
  EASY: { depth: 2, useMinimax: false, name: 'Easy' },
  MEDIUM: { depth: 4, useMinimax: true, name: 'Medium' },
  HARD: { depth: 5, useMinimax: true, name: 'Hard' },
  IMPOSSIBLE: { depth: 6, useMinimax: true, name: 'Impossible' },
};

export const DIRECTIONS: [number, number][] = [
  [0, 1],   // Horizontal
  [1, 0],   // Vertical
  [1, 1],   // Diagonal down-right
  [1, -1],  // Diagonal down-left
];

export const QUOTES: Record<Player | 'draw', string[]> = {
  a: [
    "The cosmos favors the precise.",
    "Written in the stars.",
    "Patience and power — unstoppable.",
    "The night sky never rushes, yet always wins.",
    "Cool minds dominate.",
  ],
  n: [
    "The fire burned brightest today.",
    "Chaos wins again.",
    "Raw energy conquers all.",
    "Where logic ends, Neura begins.",
    "Unleash the neural storm.",
  ],
  draw: [
    "Balance is restored.",
    "Neither side yields.",
    "The universe remains in equilibrium.",
    "A perfect stalemate.",
    "Wisdom and fire in harmony.",
  ],
};