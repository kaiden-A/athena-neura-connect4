// components/GameScreen.tsx
'use client';

import { Player, DifficultyLevel } from '@/app/types/game';
import { DIFFICULTY } from '@/app/constants/game';
import GameBoard from './GameBoard';

interface GameScreenProps {
  gameState: {
    board: (Player | null)[][];
    currentPlayer: Player | null;
    player: Player | null;
    ai: Player | null;
    gameActive: boolean;
    winningCells: { row: number; col: number }[];
    difficulty: DifficultyLevel;
  };
  onColumnClick: (col: number) => void;
  onReset: () => void;
  onDifficultyChange: (level: DifficultyLevel) => void;
  getLowestEmptyRow: (board: (Player | null)[][], col: number) => number | null;
}

export default function GameScreen({
  gameState,
  onColumnClick,
  onReset,
  onDifficultyChange,
  getLowestEmptyRow,
}: GameScreenProps) {
  const { board, currentPlayer, player, ai, gameActive, winningCells, difficulty } = gameState;

  const getStatusText = () => {
    if (!gameActive) {
      if (winningCells.length > 0) {
        const winner = board[winningCells[0].row][winningCells[0].col];
        return winner === player ? 'You win!' : 'AI wins!';
      }
      return 'Draw!';
    }
    if (currentPlayer === ai) return 'AI is thinking...';
    return 'Your turn';
  };

  const getStatusClass = () => {
    if (!gameActive) {
      if (winningCells.length > 0) {
        const winner = board[winningCells[0].row][winningCells[0].col];
        return winner === 'a' ? 'game-status win' : 'game-status lose';
      }
      return 'game-status draw';
    }
    if (currentPlayer === ai) return 'game-status thinking';
    return 'game-status';
  };

  return (
    <div id="game-screen" className="screen off">
      <div className="game-header">
        <div className="player-indicator">
          <span className="player-name a" id="player-a-name">Athena</span>
          <span className="player-turn" id="player-a-turn">
            {player === 'a' ? (currentPlayer === 'a' ? 'Your turn' : 'AI thinking...') : (currentPlayer === 'a' ? 'AI thinking...' : 'Your turn')}
          </span>
        </div>
        <div
          className={`turn-indicator ${currentPlayer ? `active ${currentPlayer}` : ''}`}
          id="turn-indicator"
        />
        <div className="player-indicator">
          <span className="player-name n" id="player-n-name">Neura</span>
          <span className="player-turn" id="player-n-turn">
            {player === 'n' ? (currentPlayer === 'n' ? 'Your turn' : 'AI thinking...') : (currentPlayer === 'n' ? 'AI thinking...' : 'Your turn')}
          </span>
        </div>
      </div>
      
      <div className={getStatusClass()} id="game-status">{getStatusText()}</div>
      
      <div className="difficulty-bar">
        {Object.keys(DIFFICULTY).map((level) => (
          <button
            key={level}
            className={`diff-btn ${difficulty === level ? 'active' : ''} ${difficulty === level && ai === 'n' ? 'n' : ''}`}
            data-level={level}
            onClick={() => onDifficultyChange(level as DifficultyLevel)}
          >
            {DIFFICULTY[level].name}
          </button>
        ))}
      </div>
      
      <GameBoard
        board={board}
        currentPlayer={currentPlayer}
        player={player}
        gameActive={gameActive}
        winningCells={winningCells}
        onColumnClick={onColumnClick}
        getLowestEmptyRow={getLowestEmptyRow}
      />
      
      <button className="rbtn" id="reset-btn" onClick={onReset}>New Game</button>
    </div>
  );
}