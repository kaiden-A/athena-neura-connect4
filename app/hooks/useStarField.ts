// app/hooks/useStarfield.ts
'use client';

import { useEffect, useRef } from 'react';

interface Star {
  x: number;
  y: number;
  r: number;
  a: number;
  p: number;
  dx: number;
  dy: number;
}

export function useStarfield() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const frameRef = useRef<number>(0);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let stars: Star[] = [];

    const resize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };

    const createStars = () => {
      const n = Math.floor((canvas.width * canvas.height) / 10000) + 100;
      stars = [];
      for (let i = 0; i < n; i++) {
        stars.push({
          x: Math.random() * canvas.width,
          y: Math.random() * canvas.height,
          r: i < n * 0.15 ? Math.random() * 1.5 + 0.8 : Math.random() * 0.7 + 0.15,
          a: Math.random() * 0.6 + 0.2,
          p: Math.random() * Math.PI * 2,
          dx: (Math.random() - 0.5) * 0.03,
          dy: (Math.random() - 0.5) * 0.03,
        });
      }
    };

    const draw = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      stars.forEach(s => {
        const tw = 0.5 + 0.5 * Math.sin(Date.now() * 0.001 * s.p);
        ctx.beginPath();
        ctx.arc(s.x, s.y, s.r, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(200,220,255,${s.a * tw})`;
        ctx.fill();
        s.x += s.dx;
        s.y += s.dy + 0.005;
        if (s.x < -10) s.x = canvas.width + 10;
        if (s.x > canvas.width + 10) s.x = -10;
        if (s.y < -10) s.y = canvas.height + 10;
        if (s.y > canvas.height + 10) s.y = -10;
      });
      frameRef.current = requestAnimationFrame(draw);
    };

    resize();
    createStars();
    draw();

    const handleResize = () => {
      resize();
      createStars();
    };

    window.addEventListener('resize', handleResize);
    return () => {
      window.removeEventListener('resize', handleResize);
      cancelAnimationFrame(frameRef.current);
    };
  }, []);

  return canvasRef;
}