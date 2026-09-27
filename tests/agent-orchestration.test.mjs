import { test } from 'node:test';
import assert from 'node:assert/strict';
import { createTeam, poseAt, agentCenter, EDGES, routeAt, curvePoint, CYCLE_DURATION, ROUTE_START, ROUTE_DURATION } from '../src/scripts/agent-orchestration-model.ts';

test('each trio moves along three distinct border edges and retires before the next team', () => {
  for (const random of [() => 0, () => .25, () => .5, () => .99999]) {
    const team = createTeam(random);
    assert.equal(team.length, 3);
    assert.equal(new Set(team.map(agent => agent.edge)).size, 3);
    team.forEach(agent => {
      assert.equal(poseAt(agent, 0).height, 0);
      assert.equal(poseAt(agent, CYCLE_DURATION).height, 0);
      const before = poseAt(agent, 1);
      const after = poseAt(agent, 7.5);
      assert.ok(Math.hypot(after.x - before.x, after.y - before.y) > 60);
      for (let time = 0; time < CYCLE_DURATION; time += .1) {
        const pose = poseAt(agent, time);
        if (agent.edge === 0) assert.equal(pose.y, 356);
        if (agent.edge === 1) assert.equal(pose.x, 616);
        if (agent.edge === 2) assert.equal(pose.y, 24);
        if (agent.edge === 3) assert.equal(pose.x, 24);
        const center = agentCenter(pose);
        assert.ok(center.x >= 24 && center.x <= 616 && center.y >= 24 && center.y <= 356);
        const { normal, tangent } = EDGES[agent.edge];
        assert.equal(Math.abs(normal[0] * tangent[0] + normal[1] * tangent[1]), 0);
        assert.ok(pose.height >= 0 && pose.height <= agent.height);
      }
    });
  }
});

test('every delivery goes from one visible agent through the coordinator to a different visible agent', () => {
  const team = createTeam(() => .99999);
  for (let order = 0; order < 3; order++) {
    const senders = new Set();
    for (let step = 0; step < 3; step++) {
      const start = ROUTE_START + step * ROUTE_DURATION;
      const phases = [.2, .8, 1.2, 1.9].map(t => routeAt(start + t, order));
      assert.deepEqual(phases.map(r => r.phase), ['incoming', 'coordinating', 'outgoing', 'received']);
      const { source, target } = phases[0];
      senders.add(source);
      assert.notEqual(source, target);
      for (const phase of phases) {
        assert.equal(phase.source, source);
        assert.equal(phase.target, target);
      }
      assert.ok(poseAt(team[source], start).height >= 45);
      assert.ok(poseAt(team[target], start + ROUTE_DURATION).height >= 45);
    }
    assert.equal(senders.size, 3);
  }
  assert.equal(routeAt(0, 0), null);
  assert.equal(routeAt(8, 0), null);
});

test('packet curves start and end exactly at their moving endpoints', () => {
  const start = { x: 132, y: 80 };
  const end = { x: 372, y: 192 };
  assert.deepEqual(curvePoint(start, end, 0), start);
  assert.deepEqual(curvePoint(start, end, 1), end);
  const moved = { x: 480, y: 291 };
  assert.deepEqual(curvePoint(end, moved, 1), moved);
});
