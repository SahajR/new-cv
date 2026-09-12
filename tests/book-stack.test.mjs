import assert from 'node:assert/strict';
import { test } from 'node:test';
import { leafDepth, leafPose, stackPose } from '../src/scripts/book-stack.ts';
import { travelCountries } from '../src/data/travel.ts';

const near = (actual, expected, message) => assert.ok(Math.abs(actual - expected) < 1e-8, message);
const parsePose = (pose) => {
  const [, z, angle] = pose.match(/^translateZ\(([-\d.]+)px\) rotateY\(([-\d.]+)deg\)$/);
  return { z: Number(z), angle: Number(angle) };
};

test('grouping and restoring the opening stack preserves every leaf surface', () => {
  for (const step of [1.25, 1.716, 2.4]) {
    for (const { page } of travelCountries) {
      // Both endpoints must match, including the reverse trip back to the TOC.
      for (const position of [0, page]) {
        const group = parsePose(stackPose(position, step));
        const direction = Math.cos(group.angle * Math.PI / 180);
        for (let leaf = 0; leaf < page; leaf++) {
          const resting = parsePose(leafPose(position, leaf, step));
          assert.equal(group.angle, resting.angle);
          for (const surface of [0, -step]) {
            const groupedZ = group.z + (-leaf * step + surface) * direction;
            const restingZ = resting.z + surface * direction;
            near(groupedZ, restingZ, `page ${page}, leaf ${leaf}: no surface jumps on stack removal`);
          }
        }
      }
    }
  }
});

test('both exposed faces stay at the crease while hidden leaves retain their thickness', () => {
  const count = travelCountries.length + 1;
  for (const step of [1.25, 2.4]) {
    for (let position = 1; position < count; position++) {
      near(leafDepth(position, position, step), 0, 'right front face meets the crease');
      near(leafDepth(position, position - 1, step) + step, 0, 'left back face meets the crease');
      for (let leaf = 0; leaf < count; leaf++) {
        const pose = parsePose(leafPose(position, leaf, step));
        const turned = leaf < position;
        assert.equal(pose.angle, turned ? -180 : 0);
        const top = pose.z + (turned ? step : 0);
        assert.ok(top <= 0, 'underlying leaves never cover the selected spread');
        if (leaf + 1 < position) {
          near(leafDepth(position, leaf + 1, step) - pose.z, step, 'left leaves remain one thickness apart');
        } else if (leaf >= position && leaf + 1 < count) {
          near(pose.z - leafDepth(position, leaf + 1, step), step, 'right leaves remain one thickness apart');
        }
      }
    }
  }
});
