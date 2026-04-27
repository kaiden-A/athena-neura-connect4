// components/Starfield.tsx
'use client';

import { useStarfield } from '../hooks/useStarField';

export default function Starfield() {
  const canvasRef = useStarfield();

  return (
    <>
      <canvas
        ref={canvasRef}
        id="canvas-bg"
        style={{
          position: 'fixed',
          inset: 0,
          zIndex: 0,
          pointerEvents: 'none',
        }}
      />
      <div
        className="neb neb-a"
        style={{
          position: 'fixed',
          borderRadius: '50%',
          pointerEvents: 'none',
          zIndex: 1,
          filter: 'blur(80px)',
          width: '40vw',
          height: '40vw',
          background: 'var(--A)',
          opacity: 0.04,
          top: '-10vw',
          left: '-10vw',
        }}
      />
      <div
        className="neb neb-n"
        style={{
          position: 'fixed',
          borderRadius: '50%',
          pointerEvents: 'none',
          zIndex: 1,
          filter: 'blur(80px)',
          width: '35vw',
          height: '35vw',
          background: 'var(--N)',
          opacity: 0.04,
          bottom: '-8vw',
          right: '-8vw',
        }}
      />
    </>
  );
}