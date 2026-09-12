import assert from 'node:assert/strict';
import { test } from 'node:test';
import { BookAudio } from '../src/scripts/book-audio.ts';

function environment(t, { failed = [], wait } = {}) {
  const keys = ['AudioContext', 'localStorage', 'document', 'fetch'];
  const saved = keys.map((key) => [key, Object.getOwnPropertyDescriptor(globalThis, key)]);
  t.after(() => saved.forEach(([key, descriptor]) => descriptor ? Object.defineProperty(globalThis, key, descriptor) : delete globalThis[key]));
  const storage = new Map();
  const sources = [];
  let contexts = 0;
  Object.assign(globalThis, {
    document: { hidden: false },
    localStorage: { getItem: (key) => storage.get(key), setItem: (key, value) => storage.set(key, value) },
    fetch: async (url) => {
      if (wait) await wait;
      const index = url.includes('cover') ? 3 : Number(url.match(/flick-(\d)/)[1]) - 1;
      return { ok: !failed.includes(index), arrayBuffer: async () => new Uint8Array([index]).buffer };
    },
    AudioContext: class {
      state = 'running';
      destination = {};
      constructor() { contexts++; }
      async decodeAudioData(bytes) { return { index: new Uint8Array(bytes)[0] }; }
      createGain() { return { gain: { value: 1 }, connect() {}, disconnect() {} }; }
      createBufferSource() {
        const source = { playbackRate: { value: 1 }, connect() {}, disconnect() {}, start() { sources.push(this); }, stop() { this.stopped = true; this.onended?.(); } };
        return source;
      }
    },
  });
  return { sources, storage, contexts: () => contexts };
}

test('preloading never opens an audio context or plays before a gesture', async (t) => {
  const env = environment(t);
  const sound = new BookAudio();
  sound.prepare();
  assert.equal(await sound.play(), undefined);
  assert.equal(env.contexts(), 0);
  assert.equal(env.sources.length, 0);
});

test('page flicks avoid consecutive repeats and the cover has its own sound', async (t) => {
  const env = environment(t);
  const sound = new BookAudio();
  sound.unlock();
  let previous;
  for (let i = 0; i < 20; i++) {
    const variant = await sound.play();
    assert.ok([0, 1, 2].includes(variant));
    assert.notEqual(variant, previous);
    previous = variant;
  }
  assert.equal(await sound.play(true), 3);
  assert.equal(env.contexts(), 1);
  assert.equal(env.sources.length, 21);
});

test('muting stops current audio, persists preference and prevents later playback', async (t) => {
  const env = environment(t);
  const sound = new BookAudio();
  sound.unlock();
  await sound.play();
  sound.setEnabled(false);
  assert.equal(env.sources[0].stopped, true);
  assert.equal(await sound.play(), undefined);
  assert.equal(new BookAudio().enabled, false);
});

test('muting while samples load discards the pending flick', async (t) => {
  let release;
  const env = environment(t, { wait: new Promise((resolve) => { release = resolve; }) });
  const sound = new BookAudio();
  sound.unlock();
  const playback = sound.play();
  sound.setEnabled(false);
  release();
  assert.equal(await playback, undefined);
  assert.equal(env.sources.length, 0);
});

test('failed samples and background pages remain silent without breaking navigation', async (t) => {
  environment(t, { failed: [0, 1, 3] });
  const sound = new BookAudio();
  sound.unlock();
  assert.equal(await sound.play(), 2);
  assert.equal(await sound.play(true), undefined);
  document.hidden = true;
  assert.equal(await sound.play(), undefined);
  sound.stop();
});
