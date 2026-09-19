import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { stripTypeScriptTypes } from 'node:module';
import { test } from 'node:test';
import { runInNewContext } from 'node:vm';
import { INTRO_KERNING } from '../src/data/intro-typography.ts';

const source = readFileSync(new URL('../src/scripts/intro.ts', import.meta.url), 'utf8');
const script = stripTypeScriptTypes(source.replace(/^import .*;\n/gm, ''));

function element(dataset = {}, left = 0, top = 0, height = 64) {
  const style = { removeProperty(property) { delete this[property]; } };
  return { dataset, style, clientWidth: 500,
    getBoundingClientRect: () => ({ left, top, width: 32, height, right: left + 32, bottom: top + height }),
  };
}

async function setup(phase = 'boot') {
  const seeds = [...'heysr'].map((seed, index) => element({ seed }, index * 32, 80));
  const letters = ['comma', 's', 'r'].map((unfold, index) => element({ unfold, index: 1 }, index * 50, 150));
  const origins = [...'hey.sr'].map((origin, index) => element({ origin: origin === '.' ? 'dot' : origin }, index * 50, 0, 144));
  const parts = Object.fromEntries(['stage', 'subtitle', 'i', 'baseline', 'im-tail', 'dot', 'core', 'ring']
    .map((name) => [name, element()]));
  const root = element({ introPhase: phase });
  root.querySelector = (selector) => parts[selector.slice('[data-intro-'.length, -1)];
  root.querySelectorAll = (selector) => ({ '[data-seed]': seeds, '[data-unfold]': letters, '[data-origin]': origins })[selector];
  const callbacks = [];
  const listeners = new Map();
  const animations = [];
  let visits = 0;
  const observer = class { observe() {} disconnect() {} };
  runInNewContext(script, {
    document: { querySelector: () => root, hidden: false, fonts: { ready: Promise.resolve() },
      addEventListener() {}, removeEventListener() {} },
    window: {
      matchMedia: () => ({ matches: false, addEventListener() {}, removeEventListener() {} }),
      addEventListener: (name, callback) => listeners.set(name, callback),
      removeEventListener: (name) => listeners.delete(name),
    },
    ResizeObserver: observer, IntersectionObserver: observer,
    requestAnimationFrame: (callback) => callbacks.push(callback),
    getComputedStyle: () => ({ letterSpacing: '0', fontSize: '64', color: '#060606', getPropertyValue: () => '#3a53ed' }),
    // Deliberately leave all keyframes unresolved to simulate a delayed first
    // Motion frame. The page must already have a safe visible starting pose.
    animate: (sequence) => { animations.push(sequence); return { then() {}, stop() {} }; },
    frame: { postRender: (callback) => callbacks.push(callback) },
    rememberHeaderVisit: () => visits++, INTRO_KERNING,
  });
  await Promise.resolve();
  return { root, seeds, letters, parts, animations,
    start: () => callbacks.shift()(),
    finish: () => listeners.get('resize')(),
    visits: () => visits,
  };
}

test('a fresh intro is in its starting pose before Motion commits any keyframes', async () => {
  const intro = await setup();
  intro.start();
  assert.equal(intro.root.dataset.introPhase, 'holding');
  assert.equal(intro.animations.length, 1);
  for (const seed of intro.seeds) {
    const track = intro.animations[0].find((segment) => Array.isArray(segment) && segment[0] === seed);
    assert.equal(seed.style.transform, track[1].transform[0]);
    assert.notEqual(seed.style.transform, 'none');
  }
  for (const glyph of [...intro.letters, intro.parts.i, intro.parts['im-tail']]) {
    assert.equal(glyph.style.opacity, '0', 'expanded letters stay hidden during the animation handoff');
  }
  assert.equal(intro.parts.dot.style.opacity, '1');
  assert.match(intro.parts.dot.style.transform, /^translate\(/);
});

test('interrupting before the first Motion frame restores the full heading', async () => {
  const intro = await setup();
  intro.start();
  intro.finish();
  assert.equal(intro.root.dataset.introPhase, 'complete');
  for (const glyph of [...intro.seeds, ...intro.letters, ...Object.values(intro.parts)]) {
    assert.equal(glyph.style.opacity, undefined);
    assert.equal(glyph.style.transform, undefined);
  }
  assert.equal(intro.visits(), 1);
});

test('a returning visit never hides the settled heading for animation startup', async () => {
  const intro = await setup('complete');
  intro.start();
  assert.equal(intro.root.dataset.introPhase, 'complete');
  assert.equal(intro.animations.length, 0);
  assert.ok(intro.letters.every((glyph) => glyph.style.opacity === undefined));
});
