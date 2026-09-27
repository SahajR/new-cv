import { test } from 'node:test';
import assert from 'node:assert/strict';
import { COLS, ROWS, PALETTE, CYCLE, INTRO_END, STILL_TIME, createScene, agentState, sceneStats, frameText } from '../src/scripts/agent-ascii-scene.ts';

test('every frame is a full 200 × 50 grid of printable ASCII in the palette', () => {
  const scene = createScene();
  for (let t = 0; t < INTRO_END + CYCLE * 2; t += 0.37) {
    const { chars, colors } = scene.render(t);
    assert.equal(chars.length, COLS * ROWS);
    for (let i = 0; i < chars.length; i++) {
      assert.ok(chars[i] >= 32 && chars[i] <= 126, `char ${chars[i]} at ${i}, t=${t}`);
      assert.ok(colors[i] < PALETTE.length);
    }
  }
});

test('frames are deterministic, so the server still matches the client', () => {
  const a = createScene().render(STILL_TIME);
  const b = createScene();
  b.render(3);
  const again = b.render(STILL_TIME);
  assert.deepEqual([...a.chars], [...again.chars]);
  assert.deepEqual([...a.colors], [...again.colors]);
  const lines = frameText(STILL_TIME).split('\n');
  assert.equal(lines.length, ROWS);
  assert.ok(lines.every(line => line.length <= COLS));
});

test('the build-in starts empty, and agents only arrive after it', () => {
  const { chars } = createScene().render(0);
  assert.ok(chars.filter(c => c !== 32).length < 300);
  for (let slot = 0; slot < 5; slot++) assert.equal(agentState(slot, INTRO_END - 0.01).alive, false);
  assert.equal(sceneStats(INTRO_END).active, 0);
});

test('agents overlap in a steady rhythm and keep delivering results', () => {
  for (let t = INTRO_END + CYCLE; t < INTRO_END + CYCLE * 3; t += 0.1) {
    const { active } = sceneStats(t);
    assert.ok(active >= 3 && active <= 4, `active ${active} at t=${t}`);
  }
  const early = sceneStats(INTRO_END + CYCLE).delivered;
  const later = sceneStats(INTRO_END + CYCLE * 2).delivered;
  assert.equal(later - early, 5);
  for (let slot = 0; slot < 5; slot++) {
    const a = agentState(slot, 30);
    const b = agentState(slot, 30 + CYCLE);
    assert.equal(b.cycle, a.cycle + 1);
    assert.ok(Math.abs(b.local - a.local) < 1e-9);
  }
});
