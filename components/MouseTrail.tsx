'use client';

import { useEffect, useRef } from 'react';

const PIXEL = 8;
const MAX_AGE = 24;
const BLUE = '#016efd';

interface Dot { x: number; y: number; age: number; }

export default function MouseTrail() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d')!;
    const dots: Dot[] = [];

    function resize() {
      canvas!.width = window.innerWidth;
      canvas!.height = window.innerHeight;
    }
    resize();
    window.addEventListener('resize', resize);

    function onMove(e: MouseEvent) {
      const gx = Math.floor(e.clientX / PIXEL) * PIXEL;
      const gy = Math.floor(e.clientY / PIXEL) * PIXEL;
      dots.push({ x: gx, y: gy, age: 0 });
      dots.push({ x: gx + PIXEL * (Math.random() > 0.5 ? 1 : -1), y: gy, age: 3 });
      dots.push({ x: gx, y: gy + PIXEL * (Math.random() > 0.5 ? 1 : -1), age: 3 });
    }
    window.addEventListener('mousemove', onMove);

    let raf: number;
    function draw() {
      ctx.clearRect(0, 0, canvas!.width, canvas!.height);
      for (let i = dots.length - 1; i >= 0; i--) {
        dots[i].age++;
        if (dots[i].age > MAX_AGE) { dots.splice(i, 1); continue; }
        ctx.globalAlpha = (1 - dots[i].age / MAX_AGE) * 0.9;
        ctx.fillStyle = BLUE;
        ctx.fillRect(dots[i].x, dots[i].y, PIXEL, PIXEL);
      }
      ctx.globalAlpha = 1;
      raf = requestAnimationFrame(draw);
    }
    raf = requestAnimationFrame(draw);

    return () => {
      window.removeEventListener('resize', resize);
      window.removeEventListener('mousemove', onMove);
      cancelAnimationFrame(raf);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      style={{ position: 'fixed', top: 0, left: 0, pointerEvents: 'none', zIndex: 9999 }}
    />
  );
}
