import assert from 'node:assert/strict';
import { test } from 'node:test';
import { fullVersionAvailable } from '../src/lib/feature-flags.ts';

test('the deployable build defaults to the limited site', () => {
  assert.equal(fullVersionAvailable(undefined), false);
  assert.equal(fullVersionAvailable('', false), false);
});
test('local development defaults to the full site', () => {
  assert.equal(fullVersionAvailable(undefined, true), true);
});
test('explicit values override both defaults', () => {
  for (const development of [true, false]) {
    assert.equal(fullVersionAvailable('true', development), true);
    assert.equal(fullVersionAvailable('false', development), false);
  }
});
test('a misspelled gate fails the build instead of accidentally enabling content', () => {
  assert.throws(() => fullVersionAvailable('FALSE'), /must be "true" or "false"/);
});
