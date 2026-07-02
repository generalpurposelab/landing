'use client';

import { useEffect, useRef } from 'react';

const PIXEL = 6;
const MAX_AGE = 28;
const BLUE = '#016efd';

interface Particle {
  x: number;
  y: number;
  age: number;
}

export default function MouseTrail() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d')!;

    let W = window.innerWidth;
    let H = window.innerHeight;
    canvas.width = W * devicePixelRatio;
    canvas.height = H * devicePixelRatio;
    ctx.scale(devicePixelRatio, devicePixelRatio);

    const particles: Particle[] = [];
    let mx = -999, my = -999;
    let raf = 0;

    function onMouseMove(e: MouseEvent) {
      // Snap to pixel grid
      mx = Math.floor(e.clientX / PIXEL) * PIXEL;
      my = Math.floor(e.clientY / PIXEL) * PIXEL;
      particles.push({ x: mx, y: my, age: 0 });
      // Also scatter a few neighbours for pixelated feel
      for (let i = 0; i < 2; i++) {
        const ox = (Math.floor(Math.random() * 3) - 1) * PIXEL;
        const oy = (Math.floor(Math.random() * 3) - 1) * PIXEL;
        if (ox !== 0 || oy !== 0) {
          particles.push({ x: mx + ox, y: my + oy, age: 2 });
        }
      }
    }

    function onResize() {
      W = window.innerWidth;
      H = window.innerHeight;
      canvas.width = W * devicePixelRatio;
      canvas.height = H * devicePixelRatio;
      ctx.scale(devicePixelRatio, devicePixelRatio);
    }

    function tick() {
      ctx.clearRect(0, 0, W, H);
      for (let i = particles.length - 1; i >= 0; i--) {
        const p = particles[i];
        p.age++;
        if (p.age > MAX_AGE) { particles.splice(i, 1); continue; }
        const alpha = 1 - p.age / MAX_AGE;
        ctx.globalAlpha = alpha * 0.85;
        ctx.fillStyle = BLUE;
        ctx.fillRect(p.x, p.y, PIXEL, PIXEL);
      }
      ctx.globalAlpha = 1;
      raf = requestAnimationFrame(tick);
    }

    window.addEventListener('mousemove', onMouseMove);
    window.addEventListener('resize', onResize);
    raf = requestAnimationFrame(tick);

    return () => {
      window.removeEventListener('mousemove', onMouseMove);
      window.removeEventListener('resize', onResize);
      cancelAnimationFrame(raf);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        width: '100vw',
        height: '100vh',
        pointerEvents: 'none',
        zIndex: 9999,
      }}
    />
  );
}
