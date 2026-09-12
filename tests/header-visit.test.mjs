import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { test } from 'node:test';
import { runInNewContext } from 'node:vm';
import { HEADER_VISIT_KEY, rememberHeaderVisit } from '../src/scripts/header-visit.ts';

const layout = readFileSync(new URL('../src/layouts/Layout.astro', import.meta.url), 'utf8');
const bootstrap = layout.match(/<script is:inline define:vars=\{\{ headerVisitKey: HEADER_VISIT_KEY \}\}>([\s\S]*?)<\/script>/)[1];
const entrances = [
  ['Intro', 'introPhase'], ['Scene', 'sceneEntrance'],
  ['Journey', 'journeyEntrance'], ['Footer', 'footerEntrance'],
].map(([component, property]) => ({
  property,
  script: readFileSync(new URL(`../src/components/${component}.astro`, import.meta.url), 'utf8')
    .match(/<script is:inline>([\s\S]*?)<\/script>/)[1],
}));

function session() {
  const entries = new Map();
  return { getItem: (key) => entries.get(key) ?? null, setItem: (key, value) => entries.set(key, value) };
}

function landing(storage, reduced = false) {
  const timers = [];
  const document = { documentElement: { dataset: {} }, currentScript: {} };
  const context = {
    document, headerVisitKey: HEADER_VISIT_KEY,
    location: { hash: '' },
    window: { sessionStorage: storage, matchMedia: () => ({ matches: reduced }), setTimeout: (callback) => timers.push(callback) },
  };
  runInNewContext(bootstrap, context);
  const elements = entrances.map(({ script, property }) => {
    const element = { dataset: { [property]: 'complete' } };
    document.currentScript.previousElementSibling = element;
    runInNewContext(script, context);
    return { element, property };
  });
  return { document, timers, phases: () => elements.map(({ element, property }) => element.dataset[property]) };
}

function finishHeader(storage) {
  const previous = globalThis.window;
  globalThis.window = { sessionStorage: storage };
  try { rememberHeaderVisit(); } finally {
    if (previous === undefined) delete globalThis.window;
    else globalThis.window = previous;
  }
}

test('a fresh visit prepares the title, images, timeline and dock for animation', () => {
  assert.deepEqual(landing(session()).phases(), ['boot', 'boot', 'boot', 'boot']);
});

test('finishing the title preserves its current entrance sequence but skips it after navigation', () => {
  const storage = session();
  const firstPage = landing(storage);
  finishHeader(storage);
  assert.equal(storage.getItem(HEADER_VISIT_KEY), '1');
  assert.equal(firstPage.document.documentElement.dataset.headerSeen, 'false');
  assert.deepEqual(firstPage.phases(), ['boot', 'boot', 'boot', 'boot']);
  const returnPage = landing(storage);
  assert.deepEqual(returnPage.phases(), ['complete', 'complete', 'complete', 'complete']);
  assert.equal(returnPage.timers.length, 0, 'returning does not schedule delayed boot fallbacks');
});

test('a new tab session starts fresh after a previous session has seen the header', () => {
  const previousVisit = session();
  finishHeader(previousVisit);
  assert.deepEqual(landing(session()).phases(), ['boot', 'boot', 'boot', 'boot']);
});

test('blocked session storage never prevents the page from rendering', () => {
  const blocked = { getItem() { throw new Error('disabled'); }, setItem() { throw new Error('disabled'); } };
  assert.doesNotThrow(() => finishHeader(blocked));
  const page = landing(blocked);
  assert.deepEqual(page.phases(), ['boot', 'boot', 'boot', 'boot']);
  page.timers.forEach((callback) => callback());
  assert.deepEqual(page.phases(), ['complete', 'complete', 'complete', 'complete']);
});

test('reduced motion remains settled on the first visit', () => {
  const page = landing(session(), true);
  assert.deepEqual(page.phases(), ['complete', 'complete', 'complete', 'complete']);
  assert.equal(page.timers.length, 0);
});

test('a Travel fragment reserves preceding window heights before anchoring', () => {
  const opened = [];
  const regions = ['work', 'interests', 'travel', 'music'].map((id) => ({
    id, querySelector: () => ({ classList: { add: () => opened.push(id) } }),
  }));
  runInNewContext(entrances.find((entry) => entry.property === 'journeyEntrance').script, {
    document: { documentElement: { dataset: { headerSeen: 'true' } }, currentScript: { previousElementSibling: { querySelectorAll: () => regions } } },
    location: { hash: '#travel' },
  });
  assert.deepEqual(opened, ['work', 'interests', 'travel']);
});
