'use client';

import { useEffect, useRef, useState } from 'react';

/*
  i gotta say...i think this is pretty much the most beautiful thing i've ever co-created with AI
  i mean my jaw dropped when i first saw this animation on the test index.html
  my kid self (shit, my current self) would be soooo stoked about this! the world really is changing.
  so cool.
*/

export function FlowerOfLife() {
  const ref = useRef<HTMLCanvasElement>(null);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    const canvas = ref.current!;
    const ctx = canvas.getContext('2d')!;
    let circles: Array<{ x: number; y: number; r: number; len: number; phase: number; breathCycles: number; fadeTime: number }> = [];
    const duration = 33000;

    function init() {
      const W = (canvas.width = window.innerWidth);
      const H = (canvas.height = window.innerHeight);
      circles = [];
      const r = 50;
      const dx = r;
      const dy = (r * Math.sqrt(3)) / 2;
      const cx = W / 2;
      const cy = H / 2;
      const yExtent = Math.ceil((H / 2 + r) / dy);
      const xExtent = Math.ceil((W / 2 + r) / dx + yExtent / 2);
      for (let j = -yExtent; j <= yExtent; j++) {
        for (let i = -xExtent; i <= xExtent; i++) {
          const x = cx + dx * (i + j / 2);
          const y = cy + dy * j;
          const normalizedX = (x - cx) / (W / 2);
          const normalizedY = (y - cy) / (H / 2);
          const phase = (normalizedX + normalizedY) * 0.2;
          const len = 2 * Math.PI * r;
          const randomBreathCycles = 2 + Math.random() * 2;
          const randomFadeTime = 0.03 + Math.random() * 0.04;
          circles.push({ 
            x, 
            y, 
            r, 
            len, 
            phase,
            breathCycles: randomBreathCycles,
            fadeTime: randomFadeTime
          });
        }
      }
    }

    let rafId: number;
    function draw(time: number) {
      // Simplified fractal breathing with fancy math for performance
      const W = canvas.width;
      const H = canvas.height;
      ctx.clearRect(0, 0, W, H);
      const tNorm = time / duration; // normalized time 0-1

      // Swirl effect (lightweight)
      ctx.save();
      ctx.globalCompositeOperation = 'lighter';
      const swirl = Math.sin(time / 5000) * 0.0005;
      ctx.translate(W / 2, H / 2);
      ctx.rotate(swirl);
      ctx.translate(-W / 2, -H / 2);

      circles.forEach(({ x, y, r, phase, breathCycles }) => {
        // Randomly jitter the wave using breathCycles (range 2–4)
        const jitter = (breathCycles - 2) / 2; // normalize to 0–1
        const pBase = (tNorm + phase) % 1;
        const p = (pBase + jitter * 0.5) % 1; // add up to 0.5 phase jitter
        // Fractal-like wave combination
        const w1 = Math.sin(2 * Math.PI * 3 * p);
        const w2 = Math.cos(2 * Math.PI * 5 * p + w1);
        const fract = w1 * 0.5 + w2 * 0.5;
        const norm = (fract + 1) / 2;
        // Dynamic radius and color
        const dr = r;
        const hue = (time / 50 + phase * 360) % 360;
        ctx.globalAlpha = norm * 0.4 + 0.6;
        ctx.strokeStyle = `hsl(${hue},70%,50%)`;
        ctx.lineWidth = 1 + norm;
        ctx.beginPath();
        ctx.arc(x, y, dr, 0, Math.PI * 2);
        ctx.stroke();
      });

      ctx.restore();
      rafId = requestAnimationFrame(draw);
    }

    init();
    window.addEventListener('resize', init);
    rafId = requestAnimationFrame(draw);
    return () => {
      window.removeEventListener('resize', init);
      cancelAnimationFrame(rafId);
    };
  }, []);

  return (
    <canvas
      ref={ref}
      style={{
        position: 'fixed',
        inset: 0,
        pointerEvents: 'none',
        zIndex: -1,
        willChange: 'filter, opacity',
        filter: 'hue-rotate(0deg)',
        animation: 'hue 5s linear infinite',
        opacity: mounted ? 0.03 : 0,
        transition: 'opacity 1.333s ease-in-out',
      }}
    />
  );
} 