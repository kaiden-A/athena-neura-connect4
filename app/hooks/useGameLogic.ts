// app/hooks/useGameLogic.ts
'use client';

import { useCallback, useRef, useEffect } from 'react';
import { Player, GameResult, DifficultyLevel, GameState } from '../types/game';
import { useGameState } from './useGameState';
import { useAI } from './useAI';

export type Screen = 'choose' | 'game' | 'win';

export function useGameLogic() {
  const {
    gameState,
    stateRef,
    startGame: startGameState,
    makeMove,
    setGameEnd,
    switchTurn,
    setDifficulty,
    resetGame: resetGameState,
  } = useGameState();

  const { getLowestEmptyRow, getAIMove, checkGameEnd } = useAI();

  // Track if we're processing to prevent double-clicks
  const processingRef = useRef(false);
  const screenRef = useRef<Screen>('choose');

  // Sync screen with external state
  const getScreen = useCallback(() => screenRef.current, []);
  const setScreen = useCallback((screen: Screen) => {
    screenRef.current = screen;
  }, []);

  const handleGameEnd = useCallback((winner: Player | 'draw', winningCells: CellPosition[]) => {
    setGameEnd(winner, winningCells);
    // Delay win screen
    setTimeout(() => {
      setScreen('win');
    }, 1000);
  }, [setGameEnd, setScreen]);

  const executeAIMove = useCallback((currentState: GameState) => {
    if (!currentState.gameActive || currentState.currentPlayer !== currentState.ai) return;
    
    const aiMove = getAIMove(currentState);
    if (!aiMove) return;

    // Make AI move on fresh state
    const afterAIMove = makeMove(aiMove.row, aiMove.col, currentState.ai);
    
    // Check if AI won
    const result = checkGameEnd(afterAIMove, aiMove.row, aiMove.col, currentState.ai);
    if (result.winner) {
      handleGameEnd(result.winner, result.winningCells);
      processingRef.current = false;
      return;
    }

    // Switch back to player
    switchTurn();
    processingRef.current = false;
  }, [getAIMove, makeMove, checkGameEnd, handleGameEnd, switchTurn]);

  const handleColumnClick = useCallback((col: number) => {
    if (processingRef.current) return;
    const current = stateRef.current;
    
    if (!current.gameActive || current.currentPlayer !== current.player) return;
    
    const row = getLowestEmptyRow(current.board, col);
    if (row === null) return;

    processingRef.current = true;

    // Make player move
    const afterMove = makeMove(row, col, current.player);
    
    // Check if player won or draw
    const result = checkGameEnd(afterMove, row, col, current.player);
    if (result.winner) {
      handleGameEnd(result.winner, result.winningCells);
      processingRef.current = false;
      return;
    }

    // Switch to AI
    switchTurn();

    // Trigger AI after delay - use fresh state ref
    setTimeout(() => {
      const freshState = stateRef.current;
      executeAIMove(freshState);
    }, 600);
  }, [stateRef, getLowestEmptyRow, makeMove, checkGameEnd, handleGameEnd, switchTurn, executeAIMove]);

  const startGame = useCallback((playerSide: Player) => {
    const newState = startGameState(playerSide);
    setScreen('game');
    processingRef.current = false;

    // If AI goes first (player chose 'n'), trigger AI
    if (playerSide === 'n') {
      setTimeout(() => {
        const freshState = stateRef.current;
        executeAIMove(freshState);
      }, 800);
    }
  }, [startGameState, setScreen, stateRef, executeAIMove]);

  const resetGame = useCallback(() => {
    const newState = resetGameState();
    setScreen('game');
    processingRef.current = false;

    // If AI is 'a', they go first after reset
    if (newState.ai === 'a') {
      setTimeout(() => {
        const freshState = stateRef.current;
        executeAIMove(freshState);
      }, 800);
    }
  }, [resetGameState, setScreen, stateRef, executeAIMove]);

  return {
    gameState,
    startGame,
    handleColumnClick,
    setDifficulty,
    resetGame,
    getLowestEmptyRow,
    getScreen,
    setScreen,
  };
}