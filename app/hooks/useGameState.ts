// app/hooks/useGameState.ts
'use client';

import { useState, useCallback, useRef } from 'react';
import { GameState, Player, DifficultyLevel, CellPosition } from '../types/game';
import { ROWS, COLS } from '../constants/game';

const createEmptyBoard = (): (Player | null)[][] =>
  Array(ROWS).fill(null).map(() => Array(COLS).fill(null));

export function useGameState() {
  const [gameState, setGameState] = useState<GameState>(() => ({
    board: createEmptyBoard(),
    player: null,
    ai: null,
    currentPlayer: 'a' as Player,
    gameActive: false,
    scores: { a: 0, n: 0, draw: 0 },
    winningCells: [],
    difficulty: 'MEDIUM' as DifficultyLevel,
    transpositionTable: new Map(),
  }));

  const stateRef = useRef<GameState>(gameState);
  
  const syncRef = useCallback((newState: GameState) => {
    stateRef.current = newState;
    setGameState(newState);
  }, []);

  const startGame = useCallback((playerSide: Player) => {
    const aiSide: Player = playerSide === 'a' ? 'n' : 'a';
    const newState: GameState = {
      player: playerSide,
      ai: aiSide,
      currentPlayer: 'a' as Player,
      board: createEmptyBoard(),
      gameActive: true,
      winningCells: [],
      scores: stateRef.current.scores,
      difficulty: stateRef.current.difficulty,
      transpositionTable: new Map(),
    };
    syncRef(newState);
    return newState;
  }, [syncRef]);

  const makeMove = useCallback((row: number, col: number, side: Player): GameState => {
    const current = stateRef.current;
    if (current.board[row][col] !== null) {
      return current;
    }
    
    const newBoard = current.board.map(r => [...r]);
    newBoard[row][col] = side;
    
    const newState: GameState = { ...current, board: newBoard };
    syncRef(newState);
    return newState;
  }, [syncRef]);

  const setGameEnd = useCallback((winner: Player | 'draw', winningCells: CellPosition[]) => {
    const current = stateRef.current;
    const newScores = { ...current.scores };
    if (winner === 'draw') newScores.draw++;
    else newScores[winner]++;
    
    const newState: GameState = {
      ...current,
      gameActive: false,
      winningCells,
      scores: newScores,
    };
    syncRef(newState);
  }, [syncRef]);

  const switchTurn = useCallback(() => {
    const current = stateRef.current;
    const nextPlayer: Player = current.currentPlayer === 'a' ? 'n' : 'a';
    const newState: GameState = {
      ...current,
      currentPlayer: nextPlayer,
    };
    syncRef(newState);
  }, [syncRef]);

  const setDifficulty = useCallback((level: DifficultyLevel) => {
    const current = stateRef.current;
    const newState: GameState = { ...current, difficulty: level };
    syncRef(newState);
  }, [syncRef]);

  const resetGame = useCallback((): GameState => {
    const current = stateRef.current;
    const newState: GameState = {
      ...current,
      board: createEmptyBoard(),
      currentPlayer: 'a' as Player,
      gameActive: true,
      winningCells: [],
      transpositionTable: new Map(),
    };
    syncRef(newState);
    return newState;
  }, [syncRef]);

  return {
    gameState,
    stateRef,
    startGame,
    makeMove,
    setGameEnd,
    switchTurn,
    setDifficulty,
    resetGame,
  };
}