import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { runInNewContext } from 'node:vm';
import ts from 'typescript';
import * as scene from '../src/scripts/agent-ascii-scene.ts';

// Exercise scheduling with a fake 2D canvas; drawing itself is checked in the browser.
const source = readFileSync(new URL('../src/scripts/agent-orchestration.ts', import.meta.url), 'utf8')
  .replace(/^import .*;$/gm, '');
const compiled = ts.transpileModule(source, { compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022 } }).outputText;

function harness(reduce = false, canvas2d = true) {
  class Element extends EventTarget {
    dataset = {};
    attributes = new Map();
    hidden = false;
    textContent = '';
    width = 0;
    height = 0;
    setAttribute(key, value) { this.attributes.set(key, value); }
  }
  let draws = 0;
  const ctx = new Proxy({}, {
    get: (_, key) => key === 'measureText' ? () => ({ width: 3 }) : key === 'drawImage' ? (...args) => { if (args.length === 9) draws++; } : () => {},
    set: () => true,
  });
  const makeCanvas = () => { const c = new Element(); c.getContext = () => (canvas2d ? ctx : null); return c; };
  const root = new Element();
  const canvas = makeCanvas();
  const glow = makeCanvas();
  const toggle = new Element();
  const active = new Element();
  const tasks = new Element();
  const preference = new EventTarget();
  preference.matches = reduce;
  const document = new EventTarget();
  document.hidden = false;
  document.createElement = makeCanvas;
  const window = new EventTarget();
  let observe;
  let nextId = 0;
  const frames = new Map();
  root.clientWidth = 560;
  const parts = { '[data-agent-canvas]': canvas, '[data-agent-glow]': glow, '[data-agent-pause]': toggle,
    '[data-agent-active]': active, '[data-agent-tasks]': tasks, '.aa-stage': { clientWidth: 536 } };
  root.querySelector = selector => parts[selector] ?? null;
  const exports = {};
  runInNewContext(compiled, {
    ...scene, exports, document, window, console, devicePixelRatio: 2,
    matchMedia: () => preference,
    requestAnimationFrame: callback => { frames.set(++nextId, callback); return nextId; },
    cancelAnimationFrame: id => frames.delete(id),
    IntersectionObserver: class { constructor(callback) { observe = callback; } observe() {} unobserve() {} disconnect() {} },
    ResizeObserver: class { observe() {} disconnect() {} },
  });
  exports.startAgentOrchestration(root);
  return { root, toggle, preference, document, canvas, active, tasks, frames, draws: () => draws,
    visible: value => observe([{ isIntersecting: value }]),
    frame: time => { const callbacks = [...frames.values()]; frames.clear(); callbacks.forEach(callback => callback(time)); },
  };
}

test('canvas matches the 200 × 100 grid of 0.6em cells', () => {
  const h = harness();
  assert.equal(h.canvas.width, 1072);
  assert.equal(h.canvas.height, Math.round((1072 / 200 / 0.6) * 100));
});

test('animation sleeps offscreen, pauses on demand, and stops in a hidden tab', () => {
  const h = harness();
  assert.equal(h.frames.size, 0);
  h.visible(true);
  assert.equal(h.frames.size, 1);
  h.frame(100);
  assert.equal(h.frames.size, 1);
  h.toggle.dispatchEvent(new Event('click'));
  assert.equal(h.frames.size, 0);
  assert.equal(h.toggle.attributes.get('aria-label'), 'Resume agent animation');
  h.toggle.dispatchEvent(new Event('click'));
  assert.equal(h.frames.size, 1);
  h.document.hidden = true;
  h.document.dispatchEvent(new Event('visibilitychange'));
  assert.equal(h.frames.size, 0);
  h.document.hidden = false;
  h.document.dispatchEvent(new Event('visibilitychange'));
  assert.equal(h.frames.size, 1);
  h.visible(false);
  assert.equal(h.frames.size, 0);
});

test('only changed cells are repainted between frames', () => {
  const h = harness();
  const first = h.draws();
  assert.ok(first > 0);
  h.visible(true);
  h.frame(1000);
  h.frame(1001);
  assert.equal(h.draws(), first);
});

test('reduced motion paints the complete still without scheduling animation', () => {
  const h = harness(true);
  h.visible(true);
  assert.ok(h.draws() > 0);
  assert.equal(h.root.dataset.agentState, 'reduced');
  assert.equal(h.root.dataset.agentReady, '');
  assert.equal(h.active.textContent, String(scene.sceneStats(scene.STILL_TIME).active));
  assert.equal(h.frames.size, 0);
  assert.equal(h.toggle.hidden, true);
  h.preference.matches = false;
  h.preference.dispatchEvent(new Event('change'));
  assert.equal(h.frames.size, 1);
  h.preference.matches = true;
  h.preference.dispatchEvent(new Event('change'));
  assert.equal(h.frames.size, 0);
});

test('without a 2D canvas the text still stays and no work is scheduled', () => {
  const h = harness(false, false);
  assert.equal(h.root.dataset.agentReady, undefined);
  assert.equal(h.frames.size, 0);
  const swapped = harness();
  swapped.visible(true);
  swapped.document.dispatchEvent(new Event('astro:before-swap'));
  assert.equal(swapped.frames.size, 0);
});
