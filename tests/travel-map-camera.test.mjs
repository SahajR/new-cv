import { test } from 'node:test';
import assert from 'node:assert/strict';
import { createMapCamera, focusMapTransform, MAP_CAMERA, MAP_CAMERA_HOME } from '../src/scripts/travel-map-camera.ts';

test('the mobile camera centers the chosen landmark and doubles its rendered size', () => {
  const view = { x: 75, y: -5, width: 820, height: 405 };
  const point = { x: 614, y: 268 };
  const camera = focusMapTransform(view, point);
  assert.equal(point.x * camera.scale + camera.x, view.x + view.width / 2);
  assert.equal(point.y * camera.scale + camera.y, view.y + view.height / 2);
  assert.equal(42 * camera.scale, 84);
});

function animationHarness(t) {
  let id = 0;
  const frames = new Map();
  const attributes = new Map();
  t.mock.method(globalThis, 'requestAnimationFrame', callback => {
    frames.set(++id, callback);
    return id;
  });
  t.mock.method(globalThis, 'cancelAnimationFrame', frame => frames.delete(frame));
  const camera = createMapCamera({
    setAttribute: (name, value) => attributes.set(name, value),
    removeAttribute: name => attributes.delete(name),
  });
  return {
    camera,
    attributes,
    frames,
    tick(time) {
      const pending = [...frames.values()];
      frames.clear();
      pending.forEach(callback => callback(time));
    },
  };
}

// Node has no animation clock; these stand-ins are restored after each test.
globalThis.requestAnimationFrame ??= () => 0;
globalThis.cancelAnimationFrame ??= () => {};

test('fast scrolling retargets an unfinished pan without jumping back', t => {
  const { camera, tick, attributes, frames } = animationHarness(t);
  camera.move({ x: -100, y: -50, scale: 2 }, true);
  tick(0);
  tick(MAP_CAMERA.duration / 2);
  const halfway = attributes.get('transform');
  const next = { x: -240, y: -160, scale: 2 };
  camera.move(next, true);
  assert.equal(frames.size, 1);
  tick(300);
  assert.equal(attributes.get('transform'), halfway);
  // Scroll events repeating the same stop must not restart the pan.
  camera.move(next, true);
  tick(300 + MAP_CAMERA.duration);
  assert.equal(attributes.get('transform'), 'translate(-240 -160) scale(2)');
  assert.equal(frames.size, 0);
});

test('reduced motion or a desktop resize snaps to its target and cancels the pan', t => {
  const { camera, tick, attributes, frames } = animationHarness(t);
  const target = { x: -743, y: -338.5, scale: 2 };
  camera.move(target, true);
  tick(0);
  camera.move(target, false);
  assert.equal(attributes.get('transform'), 'translate(-743 -338.5) scale(2)');
  assert.equal(frames.size, 0);
  camera.move(MAP_CAMERA_HOME, false);
  tick(1000);
  assert.equal(attributes.get('transform'), 'translate(0 0) scale(1)');
});

test('leaving the page removes the camera transform and pending animation', t => {
  const { camera, tick, attributes, frames } = animationHarness(t);
  camera.move({ x: -100, y: -50, scale: 2 }, true);
  tick(0);
  camera.cleanup();
  assert.equal(frames.size, 0);
  tick(1000);
  assert.equal(attributes.has('transform'), false);
});

test('street-scale focus centers exact coordinates without rounding away neighboring sights', () => {
  const view = { x: 90, y: 80, width: 560, height: 295 };
  const bund = { x: 513.6313995, y: 260.7187725 };
  const garden = { x: 513.6426195, y: 260.7899775 };
  const camera = focusMapTransform(view, bund, 1100);
  assert.ok(Math.abs(bund.x * camera.scale + camera.x - 370) < 1e-7);
  assert.ok(Math.abs(bund.y * camera.scale + camera.y - 227.5) < 1e-7);
  assert.ok((garden.y - bund.y) * camera.scale > 75, 'the two nearby sights remain distinct');
});

test('city zoom uses intermediate scales, retargets, and returns completely to the overview', t => {
  const { camera, tick, attributes, frames } = animationHarness(t);
  const city = { x: -564624, y: -286565, scale: 1100 };
  camera.move(city, true);
  tick(0);
  tick(MAP_CAMERA.cityDuration / 4);
  const zoom = Number(attributes.get('transform').match(/scale\(([^)]+)\)/)[1]);
  assert.ok(zoom > 1 && zoom < 250, 'approach geographically before revealing street-scale icons');
  const interrupted = attributes.get('transform');
  camera.move(MAP_CAMERA_HOME, true);
  tick(300);
  assert.equal(attributes.get('transform'), interrupted);
  camera.move(MAP_CAMERA_HOME, true);
  tick(300 + MAP_CAMERA.cityDuration);
  assert.equal(attributes.get('transform'), 'translate(0 0) scale(1)');
  assert.equal(frames.size, 0);
  camera.move(city, false);
  assert.equal(attributes.get('transform'), 'translate(-564624 -286565) scale(1100)');
  assert.equal(frames.size, 0, 'reduced motion resolves a city immediately');
});
