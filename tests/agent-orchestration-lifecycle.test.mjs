import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { runInNewContext } from 'node:vm';
import ts from 'typescript';
import * as model from '../src/scripts/agent-orchestration-model.ts';

// Exercise scheduling with a fake GPU; actual shader compilation is checked in the browser.
const source = readFileSync(new URL('../src/scripts/agent-orchestration.ts', import.meta.url), 'utf8')
  .replace(/^import .*;$/gm, '');
const compiled = ts.transpileModule(source, { compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022 } }).outputText;

function harness(reduce = false, webgl = true) {
  class Element extends EventTarget {
    dataset = {};
    attributes = new Map();
    hidden = false;
    setAttribute(key, value) { this.attributes.set(key, value); }
  }
  const root = new Element();
  const canvas = new Element();
  const toggle = new Element();
  const preference = new EventTarget();
  preference.matches = reduce;
  const document = new EventTarget();
  document.hidden = false;
  const window = new EventTarget();
  let draws = 0;
  let observe;
  let nextId = 0;
  const frames = new Map();
  const gl = new Proxy({}, { get: (_, key) => key === 'drawArrays' ? () => draws++ : () => true });
  canvas.getContext = () => webgl ? gl : null;
  root.clientWidth = 560;
  root.querySelector = selector => selector === '[data-agent-canvas]' ? canvas : toggle;
  const exports = {};
  runInNewContext(compiled, {
    ...model, exports, fragmentSource: '', document, window, console, devicePixelRatio: 2,
    matchMedia: () => preference,
    requestAnimationFrame: callback => { frames.set(++nextId, callback); return nextId; },
    cancelAnimationFrame: id => frames.delete(id),
    IntersectionObserver: class { constructor(callback) { observe = callback; } observe() {} unobserve() {} disconnect() {} },
    ResizeObserver: class { observe() {} disconnect() {} },
  });
  exports.startAgentOrchestration(root);
  return { root, toggle, preference, document, window, canvas, frames, draws: () => draws,
    visible: value => observe([{ isIntersecting: value }]),
    frame: time => { const callbacks = [...frames.values()]; frames.clear(); callbacks.forEach(callback => callback(time)); },
  };
}

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

test('reduced motion renders a complete still without scheduling animation', () => {
  const h = harness(true);
  h.visible(true);
  assert.ok(h.draws() > 0);
  assert.equal(h.root.dataset.agentState, 'reduced');
  assert.equal(h.frames.size, 0);
  assert.equal(h.toggle.hidden, true);
  h.preference.matches = false;
  h.preference.dispatchEvent(new Event('change'));
  assert.equal(h.frames.size, 1);
  h.preference.matches = true;
  h.preference.dispatchEvent(new Event('change'));
  assert.equal(h.frames.size, 0);
});

test('unavailable or lost WebGL leaves the fallback visible and schedules no work', () => {
  const unsupported = harness(false, false);
  assert.equal(unsupported.root.dataset.agentReady, undefined);
  assert.equal(unsupported.frames.size, 0);
  const h = harness();
  h.visible(true);
  h.canvas.dispatchEvent(new Event('webglcontextlost', { cancelable: true }));
  assert.equal(h.root.dataset.agentReady, undefined);
  assert.equal(h.root.dataset.agentState, 'fallback');
  assert.equal(h.frames.size, 0);
  h.canvas.dispatchEvent(new Event('webglcontextrestored'));
  assert.equal(h.root.dataset.agentReady, '');
  assert.equal(h.frames.size, 1);
  h.document.dispatchEvent(new Event('astro:before-swap'));
  assert.equal(h.frames.size, 0);
});
