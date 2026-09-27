// All positions use the illustration's 640 × 380 coordinate system.
export const COORDINATOR = { x: 320, y: 190 };
export const CYCLE_DURATION = 9.2;
export const ROUTE_START = 1.1;
export const ROUTE_DURATION = 2.1;
// Clockwise from bottom: tangent and inward normal rotate the whole character.
export const EDGES = [
  { normal: [0, -1], tangent: [1, 0], range: [92, 548] },
  { normal: [-1, 0], tangent: [0, -1], range: [92, 288] },
  { normal: [0, 1], tangent: [-1, 0], range: [92, 548] },
  { normal: [1, 0], tangent: [0, 1], range: [92, 288] },
] as const;
const clamp = (x: number) => Math.max(0, Math.min(1, x));
const ease = (x: number) => { const t = clamp(x); return t * t * (3 - 2 * t); };

export interface Agent {
  start: number;
  end: number;
  delay: number;
  height: number;
  edge: number;
}
export interface AgentPose { x: number; y: number; height: number; edge: number; lean: number; stretch: number; }
export interface Route { source: number; target: number; phase: 'incoming' | 'coordinating' | 'outgoing' | 'received'; progress: number; }

export function createTeam(random = Math.random): Agent[] {
  const omittedEdge = Math.floor(random() * 4);
  return [1, 2, 3].map(offset => {
    const edge = (omittedEdge + offset) % 4;
    const [min, max] = EDGES[edge].range;
    const start = min + random() * (max - min);
    // The far half of the track guarantees perceptible horizontal movement.
    const end = start < (min + max) / 2 ? max - random() * (max - min) * .25 : min + random() * (max - min) * .25;
    return { start, end, delay: random() * .25, height: 45 + random() * 6, edge };
  });
}

export function poseAt(agent: Agent, time: number): AgentPose {
  const emerge = ease((time - agent.delay) / .48);
  const retreat = 1 - ease((time - 8 - agent.delay) / .6);
  const progress = clamp((time - .3) / 8.2);
  const position = agent.start + (agent.end - agent.start) * ease(progress);
  const velocity = (agent.end - agent.start) * 6 * progress * (1 - progress) / 8.2;
  const direction = agent.edge === 1 || agent.edge === 2 ? -1 : 1;
  const emerged = emerge * retreat;
  // The head trails its border attachment, with a small, unhurried wobble.
  const lean = (-velocity * direction * .15 + Math.sin(time * 3.3 + agent.edge * 1.7) * 3.2) * emerged;
  const stretch = 1 + (Math.sin(time * 3.3 + agent.edge * 1.7) * .085
    + Math.sin(time * 5.1 + agent.edge) * .025) * emerged;
  return {
    x: agent.edge === 1 ? 616 : agent.edge === 3 ? 24 : position,
    y: agent.edge === 0 ? 356 : agent.edge === 2 ? 24 : position,
    height: agent.height * emerged,
    edge: agent.edge,
    lean,
    stretch,
  };
}

export function agentCenter(pose: AgentPose) {
  const { normal, tangent } = EDGES[pose.edge];
  return {
    x: pose.x + normal[0] * pose.height * pose.stretch * .5 + tangent[0] * pose.lean * .5,
    y: pose.y + normal[1] * pose.height * pose.stretch * .5 + tangent[1] * pose.lean * .5,
  };
}

export function routeAt(time: number, order: number): Route | null {
  const elapsed = time - ROUTE_START;
  if (elapsed < 0 || elapsed >= ROUTE_DURATION * 3) return null;
  const step = Math.floor(elapsed / ROUTE_DURATION);
  const source = (step + order) % 3;
  const target = (source + 1 + (order % 2)) % 3;
  const t = elapsed % ROUTE_DURATION;
  if (t < .72) return { source, target, phase: 'incoming', progress: ease(t / .72) };
  if (t < .94) return { source, target, phase: 'coordinating', progress: (t - .72) / .22 };
  if (t < 1.68) return { source, target, phase: 'outgoing', progress: ease((t - .94) / .74) };
  return { source, target, phase: 'received', progress: (t - 1.68) / .42 };
}

export function curvePoint(start: { x: number; y: number }, end: { x: number; y: number }, t: number) {
  const bend = start.y < end.y ? -30 : 30;
  const mx = (start.x + end.x) / 2 + bend;
  return { x: (1 - t) ** 2 * start.x + 2 * (1 - t) * t * mx + t * t * end.x,
    y: (1 - t) ** 2 * start.y + 2 * (1 - t) * t * start.y + t * t * end.y };
}
