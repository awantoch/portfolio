import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import test from 'node:test';
import { runInNewContext } from 'node:vm';
import ts from 'typescript';

const component = readFileSync(new URL('../src/components/OrthodoxCrosses.astro', import.meta.url), 'utf8');
const source = component.match(/<script>([\s\S]*?)<\/script>/)?.[1];
assert.ok(source, 'The component must contain its native browser script');
const { outputText } = ts.transpileModule(source, {
  compilerOptions: { target: ts.ScriptTarget.ES2022, module: ts.ModuleKind.ESNext },
});

type Point = { x: number; y: number };
type ElementLifecycle = { connectedCallback(): void; disconnectedCallback(): void };

function mount() {
  const paths: Point[][] = [];
  let path: Point[] = [];
  let transform: number[] = [];
  const context = {
    globalCompositeOperation: 'source-over',
    globalAlpha: 1,
    strokeStyle: '',
    lineWidth: 1,
    setTransform(...values: number[]) { transform = values; },
    clearRect() { paths.length = 0; },
    translate() {},
    rotate() {},
    beginPath() { path = []; },
    moveTo(x: number, y: number) { path.push({ x, y }); },
    lineTo(x: number, y: number) { path.push({ x, y }); },
    stroke() { paths.push(path.slice()); },
  };
  let width = 0;
  let height = 0;
  const canvas = {
    clientWidth: 1000,
    clientHeight: 700,
    get width() { return width; },
    set width(value: number) {
      width = value;
      context.globalCompositeOperation = 'source-over';
    },
    get height() { return height; },
    set height(value: number) {
      height = value;
      context.globalCompositeOperation = 'source-over';
    },
    getContext() { return context; },
  };

  class TrackedEvents extends EventTarget {
    active = new Set<string>();
    override addEventListener(type: string, listener: EventListener) {
      this.active.add(type);
      super.addEventListener(type, listener);
    }
    override removeEventListener(type: string, listener: EventListener) {
      this.active.delete(type);
      super.removeEventListener(type, listener);
    }
  }

  const motion = Object.assign(new TrackedEvents(), { matches: false });
  const window = Object.assign(new TrackedEvents(), {
    innerWidth: 1000,
    innerHeight: 700,
    devicePixelRatio: 2,
    matchMedia: () => motion,
  });
  const document = Object.assign(new TrackedEvents(), { hidden: false });
  const observers: { disconnected: boolean }[] = [];
  class ResizeObserver {
    disconnected = false;
    constructor() { observers.push(this); }
    observe() {}
    disconnect() { this.disconnected = true; }
  }
  class HTMLElement {
    dataset = {
      radius: '50', duration: '33000', hueSpeed: '50', swirlSpeed: '5000',
      swirlAmplitude: '0.0005', freq1Multiplier: '3', freq2Multiplier: '5',
      mode: 'fullscreen', rings: '1',
    };
    attributes = new Set<string>();
    querySelector() { return canvas; }
    setAttribute(name: string) { this.attributes.add(name); }
    removeAttribute(name: string) { this.attributes.delete(name); }
    toggleAttribute(name: string, enabled: boolean) {
      if (enabled) this.attributes.add(name);
      else this.attributes.delete(name);
    }
  }

  let Component!: new () => ElementLifecycle;
  let nextFrame = 0;
  const pending = new Map<number, (time: number) => void>();
  runInNewContext(outputText, {
    HTMLElement, window, document, ResizeObserver,
    performance: { now: () => 1000 },
    customElements: {
      get: () => undefined,
      define: (_name: string, value: typeof Component) => { Component = value; },
    },
    requestAnimationFrame: (callback: (time: number) => void) => {
      pending.set(++nextFrame, callback);
      return nextFrame;
    },
    cancelAnimationFrame: (id: number) => pending.delete(id),
  });
  const element = new Component();
  element.connectedCallback();

  function flushFrame(time = 2000) {
    const callbacks = Array.from(pending.entries());
    for (const [id, callback] of callbacks) {
      if (!pending.delete(id)) continue;
      callback(time);
    }
  }

  return {
    element, canvas, context, paths, motion, window, document, observers, pending,
    flushFrame, getTransform: () => transform,
  };
}

test('draws recognizable Orthodox crosses on the original hexagonal grid', () => {
  const scene = mount();
  assert.equal(scene.paths.length, 7, 'one hexagonal ring contains a center and six neighbors');
  const centers: Point[] = [];
  for (const path of scene.paths) {
    assert.equal(path.length, 8, 'each cross has a stem and three bars');
    const [top, bottom, upperLeft, upperRight, mainLeft, mainRight, footLeft, footRight] = path;
    assert.equal(top.x, bottom.x, 'the stem is vertical');
    assert.ok(top.y < upperLeft.y && footRight.y < bottom.y, 'bars fit inside the stem');
    assert.equal(upperLeft.y, upperRight.y);
    assert.equal(mainLeft.y, mainRight.y);
    assert.ok(upperLeft.y < mainLeft.y && mainLeft.y < footLeft.y, 'bars are ordered top to bottom');
    assert.ok(mainRight.x - mainLeft.x > upperRight.x - upperLeft.x, 'the middle bar is longest');
    assert.ok(footLeft.x < footRight.x && footLeft.y < footRight.y, 'the footrest descends toward the viewer’s right');
    centers.push({ x: top.x, y: (top.y + bottom.y) / 2 });
  }
  const center = centers.find(({ x, y }) => x === 500 && y === 350);
  assert.ok(center);
  for (const neighbor of centers.filter(point => point !== center)) {
    assert.ok(Math.abs(Math.hypot(neighbor.x - center.x, neighbor.y - center.y) - 50) < 0.001);
  }
  scene.element.disconnectedCallback();
});

test('resizes the backing canvas for high density displays and restores canvas drawing state', () => {
  const scene = mount();
  assert.equal(scene.canvas.width, 2000);
  assert.equal(scene.canvas.height, 1400);
  assert.deepEqual(scene.getTransform(), [2, 0, 0, 2, 0, 0]);
  scene.window.innerWidth = 390;
  scene.window.innerHeight = 844;
  scene.window.devicePixelRatio = 1;
  scene.window.dispatchEvent(new Event('resize'));
  scene.flushFrame();
  assert.equal(scene.canvas.width, 390);
  assert.equal(scene.canvas.height, 844);
  assert.deepEqual(scene.getTransform(), [1, 0, 0, 1, 0, 0]);
  assert.equal(scene.context.globalCompositeOperation, 'lighter', 'resizing must not discard the overlap blending');
  assert.ok(scene.paths.length > 0, 'the resized canvas is repainted');
  scene.element.disconnectedCallback();
});

test('stops motion when requested or hidden and releases frames and listeners on disconnect', () => {
  const scene = mount();
  assert.equal(scene.pending.size, 1);
  scene.motion.matches = true;
  scene.motion.dispatchEvent(new Event('change'));
  assert.equal(scene.pending.size, 0, 'reduced motion renders once without an animation loop');
  assert.ok(scene.paths.length > 0, 'reduced motion retains a static background');
  scene.motion.matches = false;
  scene.motion.dispatchEvent(new Event('change'));
  assert.equal(scene.pending.size, 1, 'turning motion back on resumes the animation');
  scene.document.hidden = true;
  scene.document.dispatchEvent(new Event('visibilitychange'));
  assert.equal(scene.pending.size, 0, 'hidden documents pause rendering');
  scene.document.hidden = false;
  scene.document.dispatchEvent(new Event('visibilitychange'));
  scene.window.dispatchEvent(new Event('resize'));
  scene.element.disconnectedCallback();
  assert.equal(scene.pending.size, 0, 'both animation and queued resize frames are cancelled');
  assert.equal(scene.window.active.size + scene.document.active.size + scene.motion.active.size, 0);
  assert.ok(scene.observers.every(observer => observer.disconnected));
});
