import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { runInNewContext } from 'node:vm';
import { test } from 'node:test';
import { BOOK_VISIT_KEY, BOOK_HANDOFF_KEY } from '../src/data/travel.ts';

const component = readFileSync(new URL('../src/components/TravelScrapbook.astro', import.meta.url), 'utf8');
const bootstrap = component.match(/<script is:inline define:vars=\{\{ visitKey:[^\n]+\}\}>([\s\S]*?)<\/script>/)[1];

function boot({ mode = 'embedded', page = 2, path = '/', bookmark, handoff, reduced = false, blocked = false, navigationType = 'navigate' } = {}) {
  const values = new Map([[BOOK_VISIT_KEY, bookmark], [BOOK_HANDOFF_KEY, handoff && JSON.stringify(handoff)]]);
  const faces = Array.from({ length: 7 }, (_, i) => ({ dataset: { facePage: String(i) }, setAttribute() {} }));
  const root = { dataset: { mode, target: String(page) }, style: { setProperty() {} }, querySelectorAll: () => faces };
  runInNewContext(bootstrap, {
    document: { currentScript: { previousElementSibling: root } },
    location: { pathname: path },
    matchMedia: () => ({ matches: reduced }),
    performance: { getEntriesByType: () => [{ type: navigationType }] },
    visitKey: BOOK_VISIT_KEY, transferKey: BOOK_HANDOFF_KEY,
    sessionStorage: {
      getItem(key) { if (blocked) throw new Error('disabled'); return values.get(key) ?? null; },
      removeItem(key) { values.delete(key); },
    },
  });
  return { root, values, faces };
}

test('a fresh home visit starts closed, ready to turn to Japan', () => {
  const { root, faces } = boot();
  assert.equal(root.dataset.position, '0');
  assert.equal(root.dataset.arrival, 'waiting');
  assert.equal(root.dataset.target, '2');
  assert.deepEqual(faces.filter((f) => !f.inert).map((f) => f.dataset.facePage), ['0']);
});

test('cross-document handoff starts at the source spread and keeps the destination target', () => {
  const { root, values } = boot({ mode: 'journal', page: 2, path: '/travel/japan/', handoff: { path: '/travel/japan', page: 5, time: Date.now() } });
  assert.equal(root.dataset.position, '5');
  assert.equal(root.dataset.arrival, 'complete');
  assert.equal(root.dataset.target, '2');
  assert.equal(values.has(BOOK_HANDOFF_KEY), false);
});

test('returning home preserves the country instead of repeating the base reveal', () => {
  const { root } = boot({ handoff: { path: '', page: 5, time: Date.now() } });
  assert.equal(root.dataset.position, '5');
  assert.equal(root.dataset.target, '5');
  assert.equal(root.dataset.arrival, 'complete');
  assert.equal(boot({ bookmark: '3' }).root.dataset.position, '3');
});

test('unrelated, expired, and malformed transfers do not affect direct country entry', () => {
  for (const handoff of [
    { path: '/travel/china', page: 5, time: Date.now() },
    { path: '/travel/japan', page: 5, time: Date.now() - 16000 },
    { path: '/travel/japan', page: 99, time: Date.now() },
  ]) {
    assert.equal(boot({ mode: 'journal', path: '/travel/japan/', handoff }).root.dataset.position, '0');
  }
});

test('reduced motion starts on the destination and disabled storage remains usable', () => {
  assert.equal(boot({ reduced: true, page: 4 }).root.dataset.position, '4');
  assert.equal(boot({ reduced: true }).root.dataset.arrival, 'complete');
  assert.equal(boot({ blocked: true }).root.dataset.position, '0');
});

test('the travel index stays closed on direct entry, even with a previous country bookmark', () => {
  const { root, faces } = boot({ mode: 'index', page: 0, path: '/travel/', bookmark: '5' });
  assert.equal(root.dataset.position, '0');
  assert.equal(root.dataset.target, '0');
  assert.equal(root.dataset.arrival, 'waiting');
  assert.deepEqual(faces.filter((f) => !f.inert).map((f) => f.dataset.facePage), ['0']);
});

test('the index carries the source spread across, then targets the closed cover without another drop', () => {
  const { root } = boot({ mode: 'index', page: 0, path: '/travel/', handoff: { path: '/travel', page: 2, time: Date.now() } });
  assert.equal(root.dataset.position, '2');
  assert.equal(root.dataset.target, '0');
  assert.equal(root.dataset.arrival, 'complete');
});

test('a closed cover also transfers without replaying its landing', () => {
  const handoff = { path: '/travel/japan', page: 0, time: Date.now() };
  const { root } = boot({ mode: 'journal', page: 2, path: '/travel/japan/', handoff });
  assert.equal(root.dataset.position, '0');
  assert.equal(root.dataset.target, '2');
  assert.equal(root.dataset.arrival, 'complete');
  const home = boot({ handoff: { ...handoff, path: '' } }).root;
  assert.equal(home.dataset.position, '0');
  assert.equal(home.dataset.target, '0');
  assert.equal(home.dataset.arrival, 'complete');
});

test('refreshing the index discards even a fresh same-path handoff and replays the drop', () => {
  const { root, values } = boot({ mode: 'index', page: 0, path: '/travel/', bookmark: '5', navigationType: 'reload', handoff: { path: '/travel', page: 5, time: Date.now() } });
  assert.equal(root.dataset.position, '0');
  assert.equal(root.dataset.target, '0');
  assert.equal(root.dataset.arrival, 'waiting');
  assert.equal(values.has(BOOK_HANDOFF_KEY), false);
});

test('reduced-motion index entry keeps the cover closed without a landing animation', () => {
  const { root } = boot({ mode: 'index', page: 0, path: '/travel/', reduced: true });
  assert.equal(root.dataset.position, '0');
  assert.equal(root.dataset.target, '0');
  assert.equal(root.dataset.arrival, 'complete');
});
