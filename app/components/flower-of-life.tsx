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
    // core constants
    const RADIUS = 50;
    const duration = 33000;
    const INV50 = 1 / 50;
    const SWIRL_FREQ_INV = 1 / 5000;
    const SWIRL_AMP = 0.0005;
    const sin = Math.sin, cos = Math.cos;
    const TWO_PI = Math.PI * 2;
    const FREQ1 = TWO_PI * 3;
    const FREQ2 = TWO_PI * 5;
    // inverse-duration multipliers for per-frame frequency
    const FREQ1_INV_DURATION = FREQ1 / duration;
    const FREQ2_INV_DURATION = FREQ2 / duration;
    let circles: Array<{ x: number; y: number; freq1Offset: number; freq2Offset: number; hueOffset: number }> = [];

    function init() {
      const W = (canvas.width = window.innerWidth);
      const H = (canvas.height = window.innerHeight);
      circles = [];
      const dx = RADIUS;
      const dy = (RADIUS * Math.sqrt(3)) / 2;
      const cx = W / 2;
      const cy = H / 2;
      const yExtent = Math.ceil((H / 2 + RADIUS) / dy);
      const xExtent = Math.ceil((W / 2 + RADIUS) / dx + yExtent / 2);
      for (let j = -yExtent; j <= yExtent; j++) {
        for (let i = -xExtent; i <= xExtent; i++) {
          const x = cx + dx * (i + j / 2);
          const y = cy + dy * j;
          const normalizedX = (x - cx) / (W / 2);
          const normalizedY = (y - cy) / (H / 2);
          const phase = (normalizedX + normalizedY) * 0.2;
          // random offset within [0, 0.5)
          const rand = Math.random();
          const offset = phase + rand * 0.5;
          // precompute per-circle frequency and hue offsets
          const freq1Offset = offset * FREQ1;
          const freq2Offset = offset * FREQ2;
          const hueOffset = phase * 360;
          circles.push({ x, y, freq1Offset, freq2Offset, hueOffset });
        }
      }
    }

    let rafId: number;
    function draw(time: number) {
      // Simplified fractal breathing with fancy math for performance
      const W = canvas.width;
      const H = canvas.height;
      ctx.clearRect(0, 0, W, H);
      // compute time-based frequency and hue factors
      const tFreq1 = time * FREQ1_INV_DURATION;
      const tFreq2 = time * FREQ2_INV_DURATION;
      const tHue = time * INV50;

      // Swirl effect
      ctx.save();
      ctx.globalCompositeOperation = 'lighter';
      const swirl = sin(time * SWIRL_FREQ_INV) * SWIRL_AMP;
      ctx.translate(W / 2, H / 2);
      ctx.rotate(swirl);
      ctx.translate(-W / 2, -H / 2);

      const len = circles.length;
      for (let idx = 0; idx < len; idx++) {
        const { x, y, freq1Offset, freq2Offset, hueOffset } = circles[idx];
        // Fractal-like wave combination with precomputed offsets
        const w1 = sin(tFreq1 + freq1Offset);
        const w2 = cos(tFreq2 + freq2Offset + w1);
        // normalize to [0,1]
        const norm = (w1 + w2 + 2) * 0.25;
        // compute hue and alpha
        const hue = tHue + hueOffset;
        const alpha = norm * 0.4 + 0.6;
        ctx.globalAlpha = alpha;
        ctx.strokeStyle = `hsl(${hue},70%,50%)`;
        ctx.lineWidth = 1 + norm;
        ctx.beginPath();
        ctx.arc(x, y, RADIUS, 0, TWO_PI);
        ctx.stroke();
      }

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
        opacity: mounted ? 0.08 : 0,
        transition: 'opacity 1.333s ease-in-out',
      }}
    />
  );
} 