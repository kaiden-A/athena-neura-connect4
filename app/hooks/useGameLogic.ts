// app/hooks/useGameLogic.ts
'use client';

import { useCallback, useRef } from 'react';
import { Player, DifficultyLevel, GameState, CellPosition } from '../types/game';
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

  const processingRef = useRef(false);
  const screenRef = useRef<Screen>('choose');

  const getScreen = useCallback(() => screenRef.current, []);
  const setScreen = useCallback((screen: Screen) => {
    screenRef.current = screen;
  }, []);

  const handleGameEnd = useCallback((winner: Player | 'draw', winningCells: CellPosition[]) => {
    setGameEnd(winner, winningCells);
    setTimeout(() => {
      setScreen('win');
    }, 1000);
  }, [setGameEnd, setScreen]);

  const executeAIMove = useCallback((currentState: GameState) => {
    if (!currentState.gameActive) return;
    if (!currentState.ai || !currentState.player) return;
    if (currentState.currentPlayer !== currentState.ai) return;
    
    const aiMove = getAIMove(currentState);
    if (!aiMove) {
      processingRef.current = false;
      return;
    }

    const afterAIMove = makeMove(aiMove.row, aiMove.col, currentState.ai);
    
    const result = checkGameEnd(afterAIMove, aiMove.row, aiMove.col, currentState.ai);
    if (result.winner) {
      handleGameEnd(result.winner, result.winningCells);
      processingRef.current = false;
      return;
    }

    switchTurn();
    processingRef.current = false;
  }, [getAIMove, makeMove, checkGameEnd, handleGameEnd, switchTurn]);

  const handleColumnClick = useCallback((col: number) => {
    if (processingRef.current) return;
    const current = stateRef.current;
    
    if (!current.gameActive) return;
    if (!current.player || !current.ai) return;
    if (current.currentPlayer !== current.player) return;
    
    const row = getLowestEmptyRow(current.board, col);
    if (row === null) return;

    processingRef.current = true;

    const afterMove = makeMove(row, col, current.player);
    
    const result = checkGameEnd(afterMove, row, col, current.player);
    if (result.winner) {
      handleGameEnd(result.winner, result.winningCells);
      processingRef.current = false;
      return;
    }

    switchTurn();

    setTimeout(() => {
      const freshState = stateRef.current;
      executeAIMove(freshState);
    }, 600);
  }, [stateRef, getLowestEmptyRow, makeMove, checkGameEnd, handleGameEnd, switchTurn, executeAIMove]);

  const startGame = useCallback((playerSide: Player) => {
    startGameState(playerSide);
    setScreen('game');
    processingRef.current = false;

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