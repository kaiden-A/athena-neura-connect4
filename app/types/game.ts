// app/types/game.ts
export type Player = 'a' | 'n';
export type GameResult = Player | 'draw';
export type DifficultyLevel = 'EASY' | 'MEDIUM' | 'HARD' | 'IMPOSSIBLE';
export type Screen = 'choose' | 'game' | 'win';

export interface CellPosition {
  row: number;
  col: number;
}

export interface GameScores {
  a: number;
  n: number;
  draw: number;
}

export interface DifficultyConfig {
  depth: number;
  useMinimax: boolean;
  name: string;
}

export interface TranspositionEntry {
  score: number;
  depth: number;
}

export interface GameState {
  board: (Player | null)[][];
  player: Player | null;
  ai: Player | null;
  currentPlayer: Player | null;
  gameActive: boolean;
  scores: GameScores;
  winningCells: CellPosition[];
  difficulty: DifficultyLevel;
  transpositionTable: Map<string, TranspositionEntry>;
}