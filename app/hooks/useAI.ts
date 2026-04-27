// app/hooks/useAI.ts
'use client';

import { useCallback, useRef } from 'react';
import { Player, CellPosition, GameState } from '../types/game';
import { ROWS, COLS, WIN_LENGTH, DIRECTIONS, DIFFICULTY } from '../constants/game';

export function useAI() {
  const transpositionTableRef = useRef<Map<string, { score: number; depth: number }>>(new Map());

  const getLowestEmptyRow = useCallback((board: (Player | null)[][], col: number): number | null => {
    for (let r = 0; r < ROWS; r++) {
      if (board[r][col] === null) return r;
    }
    return null;
  }, []);

  const checkForWin = useCallback((board: (Player | null)[][], row: number, col: number, side: Player): CellPosition[] | null => {
    for (const [dr, dc] of DIRECTIONS) {
      let count = 1;
      const line: CellPosition[] = [{ row, col }];
      let r = row + dr, c = col + dc;
      while (r >= 0 && r < ROWS && c >= 0 && c < COLS && board[r][c] === side) {
        count++; line.push({ row: r, col: c }); r += dr; c += dc;
      }
      r = row - dr; c = col - dc;
      while (r >= 0 && r < ROWS && c >= 0 && c < COLS && board[r][c] === side) {
        count++; line.unshift({ row: r, col: c }); r -= dr; c -= dc;
      }
      if (count >= WIN_LENGTH) return line;
    }
    return null;
  }, []);

  const isBoardFull = useCallback((board: (Player | null)[][]): boolean => {
    for (let c = 0; c < COLS; c++) {
      if (board[0][c] === null) return false;
    }
    return true;
  }, []);

  const getBoardHash = useCallback((board: (Player | null)[][]): string => {
    let h = '';
    for (let r = 0; r < ROWS; r++) {
      for (let c = 0; c < COLS; c++) {
        h += board[r][c] === null ? '0' : board[r][c] === 'a' ? '1' : '2';
      }
    }
    return h;
  }, []);

  const cacheBoard = useCallback((hash: string, score: number, depth: number) => {
    const table = transpositionTableRef.current;
    table.set(hash, { score, depth });
    if (table.size > 30000) {
      const keys = Array.from(table.keys());
      for (let i = 0; i < Math.floor(keys.length * 0.3); i++) {
        table.delete(keys[i]);
      }
    }
  }, []);

  const countLines = useCallback((board: (Player | null)[][], side: Player, length: number): number => {
    let count = 0;
    for (let r = 0; r < ROWS; r++) {
      for (let c = 0; c < COLS; c++) {
        for (const [dr, dc] of DIRECTIONS) {
          let pieces = 0, empty = 0;
          let valid = true;
          for (let i = 0; i < WIN_LENGTH; i++) {
            const nr = r + i * dr, nc = c + i * dc;
            if (nr < 0 || nr >= ROWS || nc < 0 || nc >= COLS) { valid = false; break; }
            if (board[nr][nc] === side) pieces++;
            else if (board[nr][nc] === null) empty++;
            else { valid = false; break; }
          }
          if (valid && pieces === length && empty === WIN_LENGTH - length) count++;
        }
      }
    }
    return count;
  }, []);

  const evaluatePosition = useCallback((board: (Player | null)[][], ai: Player, player: Player): number => {
    let score = 0;
    for (let r = 0; r < ROWS; r++) {
      if (board[r][3] === ai) score += 4;
      if (board[r][3] === player) score -= 4;
    }
    score += countLines(board, ai, 3) * 10 - countLines(board, player, 3) * 10;
    score += countLines(board, ai, 2) * 2 - countLines(board, player, 2) * 2;
    return score;
  }, [countLines]);

  const getValidColumns = useCallback((board: (Player | null)[][]): number[] => {
    const cols: number[] = [];
    for (let c = 0; c < COLS; c++) {
      if (board[0][c] === null) cols.push(c);
    }
    return cols;
  }, []);

  const isWinningBoard = useCallback((board: (Player | null)[][], side: Player): boolean => {
    for (let r = 0; r < ROWS; r++) {
      for (let c = 0; c < COLS; c++) {
        if (board[r][c] === side && checkForWin(board, r, c, side)) return true;
      }
    }
    return false;
  }, [checkForWin]);

  const minimax = useCallback((
    board: (Player | null)[][],
    depth: number,
    alpha: number,
    beta: number,
    maximizing: boolean,
    ai: Player,
    player: Player,
    recDepth: number
  ): number => {
    const hash = getBoardHash(board);
    const table = transpositionTableRef.current;
    const cached = table.get(hash);
    if (cached && cached.depth >= depth) return cached.score;

    const validCols = getValidColumns(board);
    if (isWinningBoard(board, ai)) return 100000 - recDepth;
    if (isWinningBoard(board, player)) return -100000 + recDepth;
    if (validCols.length === 0) return 0;
    if (depth === 0) return evaluatePosition(board, ai, player);

    const ordered = [...validCols].sort((a, b) => {
      const ra = getLowestEmptyRow(board, a);
      const rb = getLowestEmptyRow(board, b);
      if (ra === null || rb === null) return 0;
      board[ra][a] = ai;
      const sa = evaluatePosition(board, ai, player);
      board[ra][a] = null;
      board[rb][b] = ai;
      const sb = evaluatePosition(board, ai, player);
      board[rb][b] = null;
      return sb - sa + (b === 3 ? 5 : 0) - (a === 3 ? 5 : 0);
    });

    if (maximizing) {
      let maxEval = -Infinity;
      for (const col of ordered) {
        const row = getLowestEmptyRow(board, col);
        if (row === null) continue;
        board[row][col] = ai;
        maxEval = Math.max(maxEval, minimax(board, depth - 1, alpha, beta, false, ai, player, recDepth + 1));
        board[row][col] = null;
        alpha = Math.max(alpha, maxEval);
        if (beta <= alpha) break;
      }
      cacheBoard(hash, maxEval, depth);
      return maxEval;
    } else {
      let minEval = Infinity;
      for (const col of ordered) {
        const row = getLowestEmptyRow(board, col);
        if (row === null) continue;
        board[row][col] = player;
        minEval = Math.min(minEval, minimax(board, depth - 1, alpha, beta, true, ai, player, recDepth + 1));
        board[row][col] = null;
        beta = Math.min(beta, minEval);
        if (beta <= alpha) break;
      }
      cacheBoard(hash, minEval, depth);
      return minEval;
    }
  }, [getLowestEmptyRow, getBoardHash, getValidColumns, isWinningBoard, evaluatePosition, cacheBoard]);

  const findWinningMove = useCallback((board: (Player | null)[][], side: Player): CellPosition | null => {
    for (let col = 0; col < COLS; col++) {
      const row = getLowestEmptyRow(board, col);
      if (row === null) continue;
      board[row][col] = side;
      const win = checkForWin(board, row, col, side);
      board[row][col] = null;
      if (win) return { row, col };
    }
    return null;
  }, [getLowestEmptyRow, checkForWin]);

  const getHeuristicMove = useCallback((board: (Player | null)[][], ai: Player, player: Player): CellPosition | null => {
    let best: CellPosition | null = null;
    let bestScore = -Infinity;
    for (let col = 0; col < COLS; col++) {
      const row = getLowestEmptyRow(board, col);
      if (row === null) continue;
      board[row][col] = ai;
      const score = evaluatePosition(board, ai, player);
      board[row][col] = null;
      if (score > bestScore) {
        bestScore = score;
        best = { row, col };
      }
    }
    return best;
  }, [getLowestEmptyRow, evaluatePosition]);

  const getMinimaxMove = useCallback((board: (Player | null)[][], depth: number, ai: Player, player: Player): CellPosition | null => {
    let bestScore = -Infinity;
    let bestMove: CellPosition | null = null;
    const validCols = getValidColumns(board);
    
    const ordered = [...validCols].sort((a, b) => {
      const sa = (a === 3 ? 10 : 0);
      const sb = (b === 3 ? 10 : 0);
      return sb - sa;
    });

    for (const col of ordered) {
      const row = getLowestEmptyRow(board, col);
      if (row === null) continue;
      const boardCopy = board.map(r => [...r]);
      boardCopy[row][col] = ai;
      const score = minimax(boardCopy, depth - 1, -Infinity, Infinity, false, ai, player, 0);
      if (score > bestScore) {
        bestScore = score;
        bestMove = { row, col };
      }
    }
    return bestMove;
  }, [getValidColumns, getLowestEmptyRow, minimax]);

  // Main AI move function - takes explicit state, doesn't close over anything
  const getAIMove = useCallback((state: GameState): CellPosition | null => {
    if (!state.ai || !state.player || !state.gameActive) return null;
    const config = DIFFICULTY[state.difficulty];
    const { board, ai, player } = state;
    
    const winMove = findWinningMove(board, ai);
    if (winMove) return winMove;
    
    const blockMove = findWinningMove(board, player);
    if (blockMove) return blockMove;
    
    if (!config.useMinimax) {
      return getHeuristicMove(board, ai, player);
    }
    return getMinimaxMove(board, config.depth, ai, player);
  }, [findWinningMove, getHeuristicMove, getMinimaxMove]);

  // Check game state after a move - returns result if game ended
  const checkGameEnd = useCallback((state: GameState, row: number, col: number, side: Player): { winner: Player | 'draw' | null, winningCells: CellPosition[] } => {
    const winLine = checkForWin(state.board, row, col, side);
    if (winLine) {
      return { winner: side, winningCells: winLine };
    }
    if (isBoardFull(state.board)) {
      return { winner: 'draw', winningCells: [] };
    }
    return { winner: null, winningCells: [] };
  }, [checkForWin, isBoardFull]);

  return {
    getLowestEmptyRow,
    checkForWin,
    isBoardFull,
    getAIMove,
    checkGameEnd,
  };
}