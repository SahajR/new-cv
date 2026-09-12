import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { setImmediate } from 'node:timers/promises';
import { runInNewContext } from 'node:vm';
import { test } from 'node:test';

const component = readFileSync(new URL('../src/components/TravelTransitions.astro', import.meta.url), 'utf8');
const script = component.match(/<script is:inline>([\s\S]*?)<\/script>/)[1];

function setup() {
  const listeners = new Map();
  const dataset = {};
  const events = [];
  runInNewContext(script, {
    addEventListener: (name, listener) => listeners.set(name, listener),
    document: { documentElement: { dataset } },
    dispatchEvent: (event) => events.push(event.type),
    Event,
  });
  return { listeners, dataset, events };
}

test('a skipped incoming transition releases book playback and handles its rejected snapshot', async () => {
  const { listeners, dataset, events } = setup();
  listeners.get('pagereveal')({ viewTransition: {
    ready: Promise.reject(new Error('Transition was skipped')),
    finished: Promise.resolve(),
  } });
  assert.equal(dataset.bookRevealing, 'true');
  await setImmediate();
  assert.equal(dataset.bookRevealing, undefined);
  assert.deepEqual(events, ['book:revealed']);
});

test('a cancelled outgoing snapshot does not leave an unhandled rejection', async () => {
  const { listeners, events } = setup();
  listeners.get('pageswap')({ viewTransition: {
    ready: Promise.reject(new Error('Transition was aborted because of invalid state')),
  } });
  await setImmediate();
  assert.deepEqual(events, []);
});
