'use client';

import { useEffect, useRef, useState } from 'react';

/*
  i gotta say...i think this is pretty much the most beautiful thing i've ever co-created with AI
  i mean my jaw dropped when i first saw this animation on the test index.html
  my kid self (shit, my current self) would be soooo stoked about this! the world really is changing.
  so cool.
*/

export function FlowerOfLife() {
  // FlowerOfLife: Full-screen animated canvas of a "Flower of Life" breathing pattern
  const ref = useRef<HTMLCanvasElement>(null);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    // React effect: runs on mount to initialize and start animation
    setMounted(true);
    // Get our canvas element and its 2D drawing context
    const canvas = ref.current!;
    const ctx = canvas.getContext('2d')!;
    // Set persistent composite operation to lighten overlaps
    ctx.globalCompositeOperation = 'lighter';
    // ---- Core Constants ----
    // RADIUS: size of each circle in pixels
    const RADIUS = 50;
    // duration: how long a full breathe/swirl cycle lasts (ms)
    const duration = 33000;
    // INV50: reciprocal of 50ms for hue calculation (time * INV50)
    const INV50 = 1 / 50;
    // Swirl effect parameters: frequency inverse and amplitude
    const SWIRL_FREQ_INV = 1 / 5000;
    const SWIRL_AMP = 0.0005;
    // Cache trig functions and common constants for performance
    const sin = Math.sin, cos = Math.cos;
    const TWO_PI = Math.PI * 2;
    // Frequencies for our breathing waves
    const FREQ1 = TWO_PI * 3;
    const FREQ2 = TWO_PI * 5;
    // Precompute freq/duration multipliers to avoid division per frame
    const FREQ1_INV_DURATION = FREQ1 / duration;
    const FREQ2_INV_DURATION = FREQ2 / duration;
    // Array to hold per-circle data: position & phase offsets
    let circles: Array<{ x: number; y: number; freq1Offset: number; freq2Offset: number; hueOffset: number }> = [];
    // Cached canvas dimensions & count of circles to reduce lookups
    let width = 0, height = 0, halfW = 0, halfH = 0, circleCount = 0;

    function init() {
      // Initialize or reset our grid of circles (e.g. on resize)
      const W = (canvas.width = window.innerWidth);
      const H = (canvas.height = window.innerHeight);
      // Cache dimensions for drawing
      width = W;
      height = H;
      halfW = W * 0.5;
      halfH = H * 0.5;
      // Prepare empty circle list
      circles = [];
      // Define hexagonal grid spacing
      const dx = RADIUS;
      const dy = (RADIUS * Math.sqrt(3)) / 2;
      // Center coordinates
      const cx = W / 2;
      const cy = H / 2;
      // Calculate extents: how many rows/cols to fill screen
      const yExtent = Math.ceil((H / 2 + RADIUS) / dy);
      const xExtent = Math.ceil((W / 2 + RADIUS) / dx + yExtent / 2);
      for (let j = -yExtent; j <= yExtent; j++) {
        for (let i = -xExtent; i <= xExtent; i++) {
          // Compute each circle's center position
          const x = cx + dx * (i + j / 2);
          const y = cy + dy * j;
          // Normalize position to [-1..1] for phase calculation
          const normalizedX = (x - cx) / (W / 2);
          const normalizedY = (y - cy) / (H / 2);
          // Base phase shift based on position
          const phase = (normalizedX + normalizedY) * 0.2;
          // Add slight random offset for breathing variance
          const rand = Math.random();
          const offset = phase + rand * 0.5;
          // Precompute phase offsets to avoid multiplies each frame
          const freq1Offset = offset * FREQ1;
          const freq2Offset = offset * FREQ2;
          const hueOffset = phase * 360;
          circles.push({ x, y, freq1Offset, freq2Offset, hueOffset });
        }
      }
      // Cache total count for faster loops
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
      const tHue = time * INV50;
      // Apply swirling rotation effect without save/restore
      const swirl = sin(time * SWIRL_FREQ_INV) * SWIRL_AMP;
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
        ctx.arc(x, y, RADIUS, 0, TWO_PI);
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