import assert from 'node:assert/strict';
import { test } from 'node:test';
import { setImmediate } from 'node:timers/promises';
import { BookNavigation, pageSteps, clampPage } from '../src/scripts/book-navigation.ts';
import { countryFromPath, travelCountries } from '../src/data/travel.ts';

test('country URLs have stable, unique positions and Japan/China are three turns apart', () => {
  assert.equal(new Set(travelCountries.map((c) => c.page)).size, travelCountries.length);
  assert.equal(countryFromPath('/travel/japan/').page, 2);
  assert.equal(countryFromPath('/travel/china').page, 5);
  assert.equal(countryFromPath('/travel/not-a-country'), undefined);
  assert.deepEqual(pageSteps(5, 2, 5), [4, 3, 2]);
  assert.deepEqual(pageSteps(2, 5, 5), [3, 4, 5]);
  assert.deepEqual(pageSteps(2, 2, 5), []);
});

test('invalid and out-of-range stored positions cannot escape the book', () => {
  assert.equal(clampPage(NaN, 5), 0);
  assert.equal(clampPage(Infinity, 5), 0);
  assert.deepEqual(pageSteps(-10, 50, 5), [1, 2, 3, 4, 5]);
});

test('a directly opened country starts with the cover and reaches its exact spread', async () => {
  const turns = [];
  const book = new BookNavigation(5, 0, async (from, to) => { turns.push([from, to]); }, () => {});
  book.request(2);
  assert.deepEqual(turns, [], 'offscreen books remain idle');
  book.resume();
  await setImmediate();
  assert.deepEqual(turns, [[0, 1], [1, 2]]);
  assert.equal(book.position, 2);
  assert.equal(book.running, false);
});

test('country journals open their complete preceding stack in one turn', async () => {
  for (const country of travelCountries) {
    const turns = [];
    const settled = [];
    const book = new BookNavigation(5, 0, async (from, to) => { turns.push([from, to]); }, (page) => settled.push(page), { bundleOpening: true });
    book.request(country.page);
    assert.deepEqual(turns, [], 'the stack waits for the shared transition and viewport');
    book.resume();
    await setImmediate();
    assert.deepEqual(turns, [[0, country.page]]);
    assert.deepEqual(settled, [country.page], 'intermediate countries are never exposed or announced');
  }
});

test('a destination change during a stack turn settles it before reversing individual leaves', async () => {
  const turns = [];
  let finishStack;
  const book = new BookNavigation(5, 0, (from, to) => {
    turns.push([from, to]);
    return from === 0 ? new Promise((resolve) => { finishStack = resolve; }) : Promise.resolve();
  }, () => {}, { bundleOpening: true });
  book.resume();
  book.request(4);
  book.request(2);
  finishStack();
  await setImmediate();
  assert.deepEqual(turns, [[0, 4], [4, 3], [3, 2]]);
  assert.equal(book.position, 2);
});

test('pausing and restoring a bundled opening never exposes a stale destination', async () => {
  const turns = [];
  const settled = [];
  let finish;
  const book = new BookNavigation(5, 0, (from, to) => {
    turns.push([from, to]);
    return new Promise((resolve) => { finish = resolve; });
  }, (page) => settled.push(page), { bundleOpening: true });
  book.request(4);
  book.resume();
  book.pause();
  book.reset(2);
  finish();
  await setImmediate();
  assert.deepEqual(turns, [[0, 4]]);
  assert.deepEqual(settled, [2]);
  assert.equal(book.position, 2);
});

test('the index closes an incoming spread in one turn, then stays closed', async () => {
  const turns = [];
  const book = new BookNavigation(5, 2, async (from, to) => { turns.push([from, to]); }, () => {}, { bundleClosing: true });
  book.request(0);
  book.resume();
  await setImmediate();
  assert.deepEqual(turns, [[2, 0]]);
  assert.equal(book.position, 0);
  book.pause();
  book.resume();
  await setImmediate();
  assert.deepEqual(turns, [[2, 0]], 'visibility changes do not reopen the index');
});

test('every country closes directly to the cover without exposing an intermediate page', async () => {
  for (const country of travelCountries) {
    const turns = [];
    const settled = [];
    const book = new BookNavigation(5, country.page, async (from, to) => { turns.push([from, to]); }, (page) => settled.push(page), { bundleClosing: true });
    book.request(0);
    book.resume();
    await setImmediate();
    assert.deepEqual(turns, [[country.page, 0]]);
    assert.deepEqual(settled, [0]);
  }
});

test('bundled cover transitions preserve exact country-to-country leaf counts', async () => {
  const turns = [];
  const book = new BookNavigation(5, 5, async (from, to) => { turns.push([from, to]); }, () => {}, { bundleOpening: true, bundleClosing: true });
  book.resume();
  book.request(2);
  await setImmediate();
  assert.deepEqual(turns, [[5, 4], [4, 3], [3, 2]]);
  book.request(4);
  await setImmediate();
  assert.deepEqual(turns.slice(3), [[2, 3], [3, 4]]);
  book.request(0);
  await setImmediate();
  assert.deepEqual(turns.slice(5), [[4, 0]]);
});

test('rapid retargeting finishes the active leaf, then takes only the new path', async () => {
  const turns = [];
  const releases = [];
  const book = new BookNavigation(5, 2, (from, to) => {
    turns.push([from, to]);
    return new Promise((resolve) => releases.push(resolve));
  }, () => {});
  book.resume();
  book.request(5);
  book.request(4);
  book.request(1);
  assert.deepEqual(turns, [[2, 3]]);
  releases.shift()();
  await setImmediate();
  assert.deepEqual(turns, [[2, 3], [3, 2]]);
  releases.shift()();
  await setImmediate();
  releases.shift()();
  await setImmediate();
  assert.deepEqual(turns, [[2, 3], [3, 2], [2, 1]]);
  assert.equal(book.position, 1);
});

test('pausing stops subsequent turns and resuming continues without replay', async () => {
  const turns = [];
  let finish;
  const book = new BookNavigation(5, 2, (from, to) => {
    turns.push([from, to]);
    return new Promise((resolve) => { finish = resolve; });
  }, () => {});
  book.resume();
  book.request(5);
  book.pause();
  finish();
  await book.whenStepSettles();
  assert.equal(book.position, 3);
  assert.deepEqual(turns, [[2, 3]]);
  book.resume();
  assert.deepEqual(turns, [[2, 3], [3, 4]]);
  book.pause();
  finish();
  await book.whenStepSettles();
});

test('a restored page ignores completion callbacks from its old animation', async () => {
  let finish;
  const settled = [];
  const book = new BookNavigation(5, 1, () => new Promise((resolve) => { finish = resolve; }), (p) => settled.push(p));
  book.resume();
  book.request(5);
  book.reset(4);
  finish();
  await setImmediate();
  assert.equal(book.position, 4);
  assert.equal(book.target, 4);
  assert.deepEqual(settled, [4]);
});
