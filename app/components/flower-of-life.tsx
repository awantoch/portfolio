'use client';

import { useEffect, useRef, useState } from 'react';

/*
  i gotta say...i think this is pretty much the most beautiful thing i've ever co-created with AI
  i mean my jaw dropped when i first saw this animation on the test index.html
  my kid self (shit, my current self) would be soooo stoked about this! the world really is changing.
  so cool.
*/

interface FlowerOfLifeProps {
  radius?: number;
  duration?: number;
  hueSpeed?: number;
  swirlSpeed?: number;
  swirlAmplitude?: number;
  freq1Multiplier?: number;
  freq2Multiplier?: number;
  rings?: number;
  mode?: 'fullscreen' | 'fixed';
}

export function FlowerOfLife({
  radius = 50,
  duration = 33000,
  hueSpeed = 50,
  swirlSpeed = 5000,
  swirlAmplitude = 0.0005,
  freq1Multiplier = 3,
  freq2Multiplier = 5,
  rings,
  mode = 'fixed',
}: FlowerOfLifeProps) {
  // FlowerOfLife: Full-screen animated canvas of a "Flower of Life" breathing pattern
  const ref = useRef<HTMLCanvasElement>(null);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    // React effect: runs on mount to initialize and start animation
    setMounted(true);
    // Determine ring count: if explicit, use that; otherwise infinite
    const ringCount = typeof rings === 'number' ? rings : undefined;
    // Get our canvas element and its 2D drawing context
    const canvas = ref.current!;
    const ctx = canvas.getContext('2d')!;
    // Set persistent composite operation to lighten overlaps
    ctx.globalCompositeOperation = 'lighter';
    // ---- Core Constants from props ----
    const sin = Math.sin, cos = Math.cos;
    const TWO_PI = Math.PI * 2;
    const INV_HUE_SPEED = 1 / hueSpeed;
    const SWIRL_FREQ_INV = 1 / swirlSpeed;
    const FREQ1 = TWO_PI * freq1Multiplier;
    const FREQ2 = TWO_PI * freq2Multiplier;
    const FREQ1_INV_DURATION = FREQ1 / duration;
    const FREQ2_INV_DURATION = FREQ2 / duration;
    // Array to hold per-circle data: position & phase offsets
    let circles: Array<{ x: number; y: number; freq1Offset: number; freq2Offset: number; hueOffset: number }> = [];
    // Cached canvas dimensions & count of circles to reduce lookups
    let width = 0, height = 0, halfW = 0, halfH = 0, circleCount = 0;

    function init() {
      let W: number, H: number;
      if (mode === 'fullscreen') {
        W = window.innerWidth;
        H = window.innerHeight;
      } else {
        W = canvas.clientWidth;
        H = canvas.clientHeight;
      }
      canvas.width = W;
      canvas.height = H;
      // Cache dimensions for drawing
      width = W;
      height = H;
      halfW = W * 0.5;
      halfH = H * 0.5;
      // Prepare empty circle list
      circles = [];
      // Define hexagonal grid spacing
      const dx = radius;
      const dy = (radius * Math.sqrt(3)) / 2;
      // Center coordinates
      const cx = W / 2;
      const cy = H / 2;
      // Populate circles: ring-limited if ringCount specified, else infinite grid
      if (typeof ringCount === 'number') {
        for (let j = -ringCount; j <= ringCount; j++) {
          for (let i = -ringCount; i <= ringCount; i++) {
            if (Math.abs(i + j) > ringCount) continue;
            const x = cx + dx * (i + j / 2);
            const y = cy + dy * j;
            const normalizedX = (x - cx) / (W / 2);
            const normalizedY = (y - cy) / (H / 2);
            const phase = (normalizedX + normalizedY) * 0.2;
            const rand = Math.random();
            const offset = phase + rand * 0.5;
            const freq1Offset = offset * FREQ1;
            const freq2Offset = offset * FREQ2;
            const hueOffset = phase * 360;
            circles.push({ x, y, freq1Offset, freq2Offset, hueOffset });
          }
        }
      } else {
        const yExtent = Math.ceil((H / 2 + radius) / dy);
        const xExtent = Math.ceil((W / 2 + radius) / dx + yExtent / 2);
        for (let j = -yExtent; j <= yExtent; j++) {
          for (let i = -xExtent; i <= xExtent; i++) {
            const x = cx + dx * (i + j / 2);
            const y = cy + dy * j;
            const normalizedX = (x - cx) / (W / 2);
            const normalizedY = (y - cy) / (H / 2);
            const phase = (normalizedX + normalizedY) * 0.2;
            const rand = Math.random();
            const offset = phase + rand * 0.5;
            const freq1Offset = offset * FREQ1;
            const freq2Offset = offset * FREQ2;
            const hueOffset = phase * 360;
            circles.push({ x, y, freq1Offset, freq2Offset, hueOffset });
          }
        }
      }
      circleCount = circles.length;
    }

    let rafId: number;
    function draw(time: number) {
      // Reset transform and clear previous frame
      ctx.setTransform(1, 0, 0, 1, 0, 0);
      ctx.clearRect(0, 0, width, height);
      // Compute frame-specific multipliers for waves & hue
      const tFreq1 = time * FREQ1_INV_DURATION;
      const tFreq2 = time * FREQ2_INV_DURATION;
      const tHue = time * INV_HUE_SPEED;
      // Apply swirling rotation effect without save/restore
      const swirl = sin(time * SWIRL_FREQ_INV) * swirlAmplitude;
      ctx.translate(halfW, halfH);
      ctx.rotate(swirl);
      ctx.translate(-halfW, -halfH);

      // Draw each circle using fractal breathing math
      for (let idx = 0; idx < circleCount; idx++) {
        const { x, y, freq1Offset, freq2Offset, hueOffset } = circles[idx];
        // Combine two sine/cosine waves for breathing effect
        const w1 = sin(tFreq1 + freq1Offset);
        const w2 = cos(tFreq2 + freq2Offset + w1);
        // Normalize result to [0..1]
        const norm = (w1 + w2 + 2) * 0.25;
        // Compute dynamic color hue and opacity
        const hue = tHue + hueOffset;
        const alpha = norm * 0.4 + 0.6;
        ctx.globalAlpha = alpha;
        ctx.strokeStyle = `hsl(${hue},70%,50%)`;
        ctx.lineWidth = 1 + norm;
        ctx.beginPath();
        ctx.arc(x, y, radius, 0, TWO_PI);
        ctx.stroke();
      }
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

  const commonStyles = {
    pointerEvents: 'none' as const,
    willChange: 'filter, opacity' as const,
    filter: 'hue-rotate(0deg)' as const,
    animation: 'hue 5s linear infinite' as const,
    opacity: mounted ? 0.08 : 0,
    transition: 'opacity 1.333s ease-in-out' as const,
  };
  const positionStyles = mode === 'fullscreen'
    ? { position: 'fixed' as const, inset: 0 as const, zIndex: -1 as const }
    : { width: '100%', height: '100%', display: 'block' as const };

  return (
    <canvas
      ref={ref}
      aria-hidden="true"
      tabIndex={-1}
      style={{ ...commonStyles, ...positionStyles }}
    />
  );
} 