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
    difficulty: 'MEDIUM',
    transpositionTable: new Map(),
  }));

  // Use ref for immediate access in async callbacks
  const stateRef = useRef(gameState);
  stateRef.current = gameState;

  const startGame = useCallback((playerSide: Player) => {
    const aiSide = playerSide === 'a' ? 'n' : 'a';
    const newState: GameState = {
      player: playerSide,
      ai: aiSide,
      currentPlayer: 'a',
      board: createEmptyBoard(),
      gameActive: true,
      winningCells: [],
      scores: stateRef.current.scores, // Preserve scores
      difficulty: stateRef.current.difficulty,
      transpositionTable: new Map(),
    };
    setGameState(newState);
    return newState; // Return so caller knows initial state
  }, []);

  const makeMove = useCallback((row: number, col: number, side: Player): GameState => {
    const current = stateRef.current;
    if (current.board[row][col] !== null) return current;
    
    const newBoard = current.board.map(r => [...r]);
    newBoard[row][col] = side;
    
    const newState = { ...current, board: newBoard };
    setGameState(newState);
    return newState;
  }, []);

  const setGameEnd = useCallback((winner: Player | 'draw', winningCells: CellPosition[]) => {
    setGameState(prev => {
      const newScores = { ...prev.scores };
      if (winner === 'draw') newScores.draw++;
      else newScores[winner]++;
      
      return {
        ...prev,
        gameActive: false,
        winningCells,
        scores: newScores,
      };
    });
  }, []);

  const switchTurn = useCallback(() => {
    setGameState(prev => ({
      ...prev,
      currentPlayer: prev.currentPlayer === 'a' ? 'n' : 'a',
    }));
  }, []);

  const setDifficulty = useCallback((level: DifficultyLevel) => {
    setGameState(prev => ({ ...prev, difficulty: level }));
  }, []);

  const resetGame = useCallback((): GameState => {
    const current = stateRef.current;
    const newState: GameState = {
      ...current,
      board: createEmptyBoard(),
      currentPlayer: 'a',
      gameActive: true,
      winningCells: [],
      transpositionTable: new Map(),
    };
    setGameState(newState);
    return newState;
  }, []);

  return {
    gameState,
    stateRef, // Expose ref for hooks that need latest state
    startGame,
    makeMove,
    setGameEnd,
    switchTurn,
    setDifficulty,
    resetGame,
  };
}