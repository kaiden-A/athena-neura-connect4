// components/GameBoard.tsx
'use client';

import { Player } from '@/app/types/game';
import { COLS, ROWS } from '@/app/constants/game';

interface GameBoardProps {
  board: (Player | null)[][];
  currentPlayer: Player | null;
  player: Player | null;
  gameActive: boolean;
  winningCells: { row: number; col: number }[];
  onColumnClick: (col: number) => void;
  getLowestEmptyRow: (board: (Player | null)[][], col: number) => number | null;
}

export default function GameBoard({
  board,
  currentPlayer,
  player,
  gameActive,
  winningCells,
  onColumnClick,
  getLowestEmptyRow,
}: GameBoardProps) {
  const isWinningCell = (row: number, col: number) =>
    winningCells.some(c => c.row === row && c.col === col);

  const isColumnFull = (col: number) => getLowestEmptyRow(board, col) === null;

  return (
    <div className="board-container">
      <div className="board" id="board">
        {Array.from({ length: COLS }, (_, col) => (
          <div
            key={col}
            className={`column ${!isColumnFull(col) && gameActive && currentPlayer === player ? player : ''} ${isColumnFull(col) ? 'full' : ''}`}
            data-col={col}
            onClick={() => onColumnClick(col)}
          >
            <div className="drop-indicator">▼</div>
            {Array.from({ length: ROWS }, (_, row) => {
              const cellValue = board[row][col];
              return (
                <div
                  key={`${row}-${col}`}
                  className={`cell ${cellValue || 'empty'} ${isWinningCell(row, col) ? 'win' : ''}`}
                  data-row={row}
                  data-col={col}
                >
                  {cellValue ? (cellValue === 'a' ? 'A' : 'N') : ''}
                </div>
              );
            })}
          </div>
        ))}
      </div>
    </div>
  );
}