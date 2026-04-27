// components/WinScreen.tsx
'use client';

import { Player, GameScores } from '@/app/types/game';
import { QUOTES } from '@/app/constants/game';

interface WinScreenProps {
  result: Player | 'draw' | null;
  player: Player | null;
  scores: GameScores;
  onPlayAgain: () => void;
}

export default function WinScreen({ result, player, scores, onPlayAgain }: WinScreenProps) {
  if (!result) return null;

  const getRandomQuote = () => {
    const quoteList = result === 'draw' ? QUOTES.draw : QUOTES[result];
    return quoteList[Math.floor(Math.random() * quoteList.length)];
  };

  const getWinScreenClass = () => {
    if (result === 'a') return 'screen aw';
    if (result === 'n') return 'screen nw';
    return 'screen draw';
  };

  return (
    <div id="win-screen" className={getWinScreenClass()}>
      <p className="weyebrow">Battle Complete</p>
      <p className={`wname ${result === 'a' ? 'wa' : result === 'n' ? 'wn' : 'draw'}`} id="wname">
        {result === 'draw' ? 'Draw' : result === 'a' ? 'Athena' : 'Neura'}
      </p>
      <p className="wname-sub" id="wname-sub">
        {result === 'draw' ? 'The battle ends in balance' : result === player ? 'You are victorious!' : 'The AI prevails'}
      </p>
      <p className="wquote" id="wquote">{getRandomQuote()}</p>
      <div className="wscores">
        <div className="sbox sa">
          <div className="stag" id="stag-a">Athena</div>
          <div className="snum" id="sc-a">{scores.a}</div>
          <div className="slbl">Wins</div>
        </div>
        <div className="sbox sn">
          <div className="stag" id="stag-n">Neura</div>
          <div className="snum" id="sc-n">{scores.n}</div>
          <div className="slbl">Wins</div>
        </div>
        <div className="sbox sd">
          <div className="stag">Draws</div>
          <div className="snum" id="sc-draw">{scores.draw}</div>
          <div className="slbl">Tied</div>
        </div>
      </div>
      <button className="rbtn" id="play-again-btn" onClick={onPlayAgain}>Play Again</button>
    </div>
  );
}