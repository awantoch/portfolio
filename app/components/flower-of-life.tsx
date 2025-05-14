'use client';

import { useEffect, useRef } from 'react';

/*
  i gotta say...i think this is pretty much the most beautiful thing i've ever co-created with AI
  i mean my jaw dropped when i first saw this animation on the test index.html
  my kid self (shit, my current self) would be soooo stoked about this! the world really is changing.
  so cool.
*/

export function FlowerOfLife() {
  const ref = useRef<HTMLCanvasElement>(null);
  useEffect(() => {
    const canvas = ref.current!;
    const ctx = canvas.getContext('2d')!;
    let circles: Array<{ x: number; y: number; r: number; len: number; phase: number }> = [];
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
          const phase = 0;
          const len = 2 * Math.PI * r;
          circles.push({ x, y, r, len, phase });
        }
      }
    }

    let rafId: number;
    function draw(time: number) {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      const t = time % duration;
      circles.forEach(({ x, y, r, len, phase }) => {
        const p = t / duration;
        // breathing parameters
        const fadeTime = 0.05; // portion of cycle for fade transitions
        const startHold = 0.2;
        const endHold = 0.8;
        const breathCycles = 3; // number of opacity breaths in hold phase
        // calculate dash offset: draw in, hold, then erase
        const offset =
          p < startHold
            ? len * (1 - p / startHold)
            : p < endHold
            ? 0
            : -len * ((p - endHold) / (1 - endHold));
        const baseAlpha = 0.3;
        let alpha;
        if (p < startHold - fadeTime) {
          // before fade to hold: full opacity
          alpha = 1;
        } else if (p < startHold) {
          // fade from 1 down to baseAlpha
          const t1 = (p - (startHold - fadeTime)) / fadeTime;
          alpha = 1 - t1 * (1 - baseAlpha);
        } else if (p < endHold) {
          // multiple breathing cycles during hold
          const inner = (p - startHold) / (endHold - startHold);
          const breath = (1 - Math.cos(2 * Math.PI * breathCycles * inner)) / 2;
          alpha = baseAlpha + 0.7 * breath;
        } else if (p < endHold + fadeTime) {
          // fade from baseAlpha back up to full opacity
          const t2 = (p - endHold) / fadeTime;
          alpha = baseAlpha + t2 * (1 - baseAlpha);
        } else {
          // after hold: full opacity
          alpha = 1;
        }
        ctx.globalAlpha = alpha;
        ctx.setLineDash([len, len]);
        ctx.lineDashOffset = offset;
        ctx.strokeStyle = '#00ffea';
        ctx.lineWidth = 1.5;
        ctx.beginPath();
        ctx.arc(x, y, r, 0, Math.PI * 2);
        ctx.stroke();
      });
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
        opacity: 0.03,
      }}
    />
  );
} 