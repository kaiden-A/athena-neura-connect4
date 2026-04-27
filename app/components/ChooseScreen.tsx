// components/ChooseScreen.tsx
'use client';

import { Player } from '@/app/types/game';

interface ChooseScreenProps {
  onSelectSide: (side: Player) => void;
}

export default function ChooseScreen({ onSelectSide }: ChooseScreenProps) {
  return (
    <div id="choose-screen" className="screen">
      <p className="choose-eyebrow">Choose your side</p>
      <div className="choose-headline">
        <h1 className="ha">Athena</h1>
        <div className="vs-badge">VS</div>
        <h1 className="hn">Neura</h1>
      </div>
      <div className="choose-cards">
        <div className="ccard ca" onClick={() => onSelectSide('a')}>
          <div className="card-orb">A</div>
          <p className="card-name">Athena</p>
          <p className="card-tagline">Wisdom of the night sky. Calm, precise, inevitable.</p>
          <button className="card-btn">Play as Athena</button>
        </div>
        <div className="ccard cn" onClick={() => onSelectSide('n')}>
          <div className="card-orb">N</div>
          <p className="card-name">Neura</p>
          <p className="card-tagline">Raw neural fire. Chaotic, blazing, relentless.</p>
          <button className="card-btn">Play as Neura</button>
        </div>
      </div>
      <p className="choose-hint">Pick your side and challenge the AI in Connect 4 strategy</p>
    </div>
  );
}