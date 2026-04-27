// components/Connect4Game.tsx
'use client';

import { useState, useEffect, useCallback } from 'react';
import { Player, Screen, DifficultyLevel } from '@/app/types/game';
import { useGameLogic } from '@/app/hooks/useGameLogic';
import Starfield from './StarField';

export default function Connect4Game() {
  const [screen, setScreenState] = useState<Screen>('choose');
  const { 
    gameState, 
    startGame, 
    handleColumnClick, 
    setDifficulty, 
    resetGame, 
    getLowestEmptyRow,
    setScreen: setScreenRef,
    getScreen 
  } = useGameLogic();

  // Sync React state with ref
  useEffect(() => {
    const interval = setInterval(() => {
      const currentScreen = getScreen();
      if (currentScreen !== screen) {
        setScreenState(currentScreen);
      }
    }, 100);
    return () => clearInterval(interval);
  }, [screen, getScreen]);

  const handleStartGame = useCallback((side: Player) => {
    startGame(side);
  }, [startGame]);

  const handlePlayAgain = useCallback(() => {
    setScreenRef('choose');
    setScreenState('choose');
  }, [setScreenRef]);

  const handleDifficultyChange = useCallback((level: DifficultyLevel) => {
    setDifficulty(level);
  }, [setDifficulty]);

  const getResult = (): Player | 'draw' | null => {
    if (gameState.winningCells.length > 0) {
      return gameState.board[gameState.winningCells[0].row][gameState.winningCells[0].col];
    }
    if (!gameState.gameActive && gameState.winningCells.length === 0) {
      const isFull = gameState.board.every(row => row.every(cell => cell !== null));
      if (isFull) return 'draw';
    }
    return null;
  };

  const quotes = {
    a: ["The cosmos favors the precise.", "Written in the stars.", "Patience and power — unstoppable.", "The night sky never rushes, yet always wins.", "Cool minds dominate."],
    n: ["The fire burned brightest today.", "Chaos wins again.", "Raw energy conquers all.", "Where logic ends, Neura begins.", "Unleash the neural storm."],
    draw: ["Balance is restored.", "Neither side yields.", "The universe remains in equilibrium.", "A perfect stalemate.", "Wisdom and fire in harmony."]
  };

  return (
    <>
      <Starfield />
      
      <div id="choose-screen" className={`screen ${screen === 'choose' ? '' : 'off'}`}>
        <p className="choose-eyebrow">Choose your side</p>
        <div className="choose-headline">
          <h1 className="ha">Athena</h1>
          <div className="vs-badge">VS</div>
          <h1 className="hn">Neura</h1>
        </div>
        <div className="choose-cards">
          <div className="ccard ca" onClick={() => handleStartGame('a')}>
            <div className="card-orb">A</div>
            <p className="card-name">Athena</p>
            <p className="card-tagline">Wisdom of the night sky. Calm, precise, inevitable.</p>
            <button className="card-btn">Play as Athena</button>
          </div>
          <div className="ccard cn" onClick={() => handleStartGame('n')}>
            <div className="card-orb">N</div>
            <p className="card-name">Neura</p>
            <p className="card-tagline">Raw neural fire. Chaotic, blazing, relentless.</p>
            <button className="card-btn">Play as Neura</button>
          </div>
        </div>
        <p className="choose-hint">Pick your side and challenge the AI in Connect 4 strategy</p>
      </div>

      <div id="game-screen" className={`screen ${screen === 'game' ? '' : 'off'}`}>
        <div className="game-header">
          <div className="player-indicator">
            <span className="player-name a">Athena</span>
            <span className="player-turn">
              {gameState.player === 'a' 
                ? (gameState.currentPlayer === 'a' ? 'Your turn' : 'AI thinking...')
                : (gameState.currentPlayer === 'a' ? 'AI thinking...' : 'Your turn')
              }
            </span>
          </div>
          <div className={`turn-indicator ${gameState.currentPlayer ? `active ${gameState.currentPlayer}` : ''}`} />
          <div className="player-indicator">
            <span className="player-name n">Neura</span>
            <span className="player-turn">
              {gameState.player === 'n'
                ? (gameState.currentPlayer === 'n' ? 'Your turn' : 'AI thinking...')
                : (gameState.currentPlayer === 'n' ? 'AI thinking...' : 'Your turn')
              }
            </span>
          </div>
        </div>
        
        <div className={
          !gameState.gameActive 
            ? (gameState.winningCells.length > 0 
                ? (gameState.board[gameState.winningCells[0].row][gameState.winningCells[0].col] === 'a' ? 'game-status win' : 'game-status lose')
                : 'game-status draw')
            : gameState.currentPlayer === gameState.ai 
              ? 'game-status thinking' 
              : 'game-status'
        }>
          {!gameState.gameActive 
            ? (gameState.winningCells.length > 0 
                ? (gameState.board[gameState.winningCells[0].row][gameState.winningCells[0].col] === gameState.player ? 'You win!' : 'AI wins!')
                : 'Draw!')
            : gameState.currentPlayer === gameState.ai 
              ? 'AI is thinking...' 
              : 'Your turn'
          }
        </div>

        <div className="difficulty-bar">
          {['EASY', 'MEDIUM', 'HARD', 'IMPOSSIBLE'].map((level) => (
            <button
              key={level}
              className={`diff-btn ${gameState.difficulty === level ? 'active' : ''} ${gameState.difficulty === level && gameState.ai === 'n' ? 'n' : ''}`}
              onClick={() => handleDifficultyChange(level as DifficultyLevel)}
            >
              {level === 'EASY' ? 'Easy' : level === 'MEDIUM' ? 'Medium' : level === 'HARD' ? 'Hard' : 'Impossible'}
            </button>
          ))}
        </div>

        <div className="board-container">
          <div className="board">
            {Array.from({ length: 7 }, (_, col) => {
              const isFull = getLowestEmptyRow(gameState.board, col) === null;
              return (
                <div
                  key={col}
                  className={`column ${!isFull && gameState.gameActive && gameState.currentPlayer === gameState.player ? gameState.player : ''} ${isFull ? 'full' : ''}`}
                  onClick={() => handleColumnClick(col)}
                >
                  <div className="drop-indicator">▼</div>
                  {Array.from({ length: 6 }, (_, row) => {
                    const cellValue = gameState.board[row][col];
                    const isWinning = gameState.winningCells.some(c => c.row === row && c.col === col);
                    return (
                      <div
                        key={`${row}-${col}`}
                        className={`cell ${cellValue || 'empty'} ${isWinning ? 'win' : ''}`}
                      >
                        {cellValue ? (cellValue === 'a' ? 'A' : 'N') : ''}
                      </div>
                    );
                  })}
                </div>
              );
            })}
          </div>
        </div>

        <button className="rbtn" onClick={resetGame}>New Game</button>
      </div>

      <div id="win-screen" className={`screen ${screen === 'win' ? '' : 'off'}`}>
        {screen === 'win' && (() => {
          const result = getResult();
          const quote = result === 'draw' 
            ? quotes.draw[Math.floor(Math.random() * quotes.draw.length)]
            : result 
              ? quotes[result][Math.floor(Math.random() * quotes[result].length)]
              : '';
          
          return (
            <>
              <p className="weyebrow">Battle Complete</p>
              <p className={`wname ${result === 'a' ? 'wa' : result === 'n' ? 'wn' : 'draw'}`}>
                {result === 'draw' ? 'Draw' : result === 'a' ? 'Athena' : 'Neura'}
              </p>
              <p className="wname-sub">
                {result === 'draw' ? 'The battle ends in balance' : result === gameState.player ? 'You are victorious!' : 'The AI prevails'}
              </p>
              <p className="wquote">{quote}</p>
              <div className="wscores">
                <div className="sbox sa">
                  <div className="stag">Athena</div>
                  <div className="snum">{gameState.scores.a}</div>
                  <div className="slbl">Wins</div>
                </div>
                <div className="sbox sn">
                  <div className="stag">Neura</div>
                  <div className="snum">{gameState.scores.n}</div>
                  <div className="slbl">Wins</div>
                </div>
                <div className="sbox sd">
                  <div className="stag">Draws</div>
                  <div className="snum">{gameState.scores.draw}</div>
                  <div className="slbl">Tied</div>
                </div>
              </div>
              <button className="rbtn" onClick={handlePlayAgain}>Play Again</button>
            </>
          );
        })()}
      </div>
    </>
  );
}