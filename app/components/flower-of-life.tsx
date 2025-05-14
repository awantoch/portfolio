'use client';

import { useEffect } from 'react';

/*
  i gotta say...i think this is pretty much the most beautiful thing i've ever co-created with AI
  i mean my jaw dropped when i first saw this animation on the test index.html
  my kid self (shit, my current self) would be soooo stoked about this! the world really is changing.
  so cool.
*/

export function FlowerOfLife() {
  useEffect(() => {
    const svg = document.getElementById('flower') as unknown as SVGElement;
    const r = 50, dx = r, dy = r * Math.sqrt(3)/2, duration = 3;
    
    function draw() {
      if (!svg) return;
      svg.innerHTML = '';
      const W = window.innerWidth, H = window.innerHeight;
      svg.setAttribute('viewBox', `0 0 ${W} ${H}`);
      const cx = W/2, cy = H/2;
      // calculate extents to cover full viewport
      const yExtent = Math.ceil((H/2 + r) / dy);
      const xExtent = Math.ceil((W/2 + r) / dx + yExtent / 2);
      
      for (let j = -yExtent; j <= yExtent; j++) {
        for (let i = -xExtent; i <= xExtent; i++) {
          const x = cx + dx * (i + j / 2);
          const y = cy + dy * j;
          const c = document.createElementNS(svg.namespaceURI,'circle') as SVGElement;
          c.setAttribute('cx', x.toString());
          c.setAttribute('cy', y.toString());
          c.setAttribute('r', r.toString());
          const len = 2*Math.PI*r;
          c.style.setProperty('--len', len.toString());
          c.style.strokeDasharray = len.toString();
          c.style.strokeDashoffset = len.toString();
          c.style.animationDelay = (Math.random()*duration)+'s';
          svg.appendChild(c);
        }
      }
    }

    draw();
    window.addEventListener('resize', draw);
    return () => window.removeEventListener('resize', draw);
  }, []);

  return (
    <svg 
      id="flower" 
      xmlns="http://www.w3.org/2000/svg"
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        width: '100%',
        height: '100%',
        pointerEvents: 'none',
        zIndex: -1,
        filter: 'hue-rotate(0deg)',
        animation: 'hue 10s linear infinite',
        opacity: 0.03
      }}
    />
  );
} 