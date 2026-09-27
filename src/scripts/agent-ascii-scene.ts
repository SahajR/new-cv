// A compact 200 × 50 ASCII motion piece: requests fall into an orchestrator
// core of two concentric cubes at the centre, and small agents orbit it. Each agent is tethered to
// the loop, receives a task along its tether, works, and sends the result back.
// Pure and deterministic in `t`, so the server can render the same still.

export const COLS = 200;
export const ROWS = 50;
/** Character cell width ÷ height; a monospace advance is 0.6em. */
export const CELL_ASPECT = 0.6;

export const INK = {
  none: 0, dim: 1, muted: 2, lav: 3, ink: 4, white: 5, pink: 6, red: 7, teal: 8, blue: 9, ember: 10,
} as const;
export const PALETTE = [
  '#1d1a2e', '#4a4470', '#6f69a0', '#aaa2dc', '#d9defa', '#ffffff',
  '#e57889', '#d85665', '#9fd8c3', '#7aa2e8', '#853649',
];

// Timeline, in seconds.
export const INTRO_END = 2.2;
export const CYCLE = 15;
export const STILL_TIME = 37.6;
const SLOT_ORDER = [2, 0, 4, 1, 3];
const SLOT_GAP = CYCLE / 5;
const PHASE = {
  spawn: [0.4, 1.1], dispatch: [1.2, 2.1], catch: [2.1, 2.45], work: [2.45, 8.4],
  result: [8.4, 9.3], exit: [9.3, 9.8], retire: [9.5, 10.3],
} as const;
const ORBIT_PERIOD = 48;

// Layout, in cells.
const CORE = { x: 100, y: 25 };
const CORE_RADIUS = 11;
const RING = { x: 100, y: 25, rx: 82, ry: 17 };
const AGENT_W = 2.1;
const AGENT_H = 3.6;

const clamp = (x: number, lo = 0, hi = 1) => Math.max(lo, Math.min(hi, x));
const span = (x: number, [a, b]: readonly [number, number]) => clamp((x - a) / (b - a));
const smooth = (x: number) => { const t = clamp(x); return t * t * (3 - 2 * t); };
const inOut = (x: number) => { const t = clamp(x); return t < 0.5 ? 4 * t * t * t : 1 - (-2 * t + 2) ** 3 / 2; };
const outCubic = (x: number) => 1 - (1 - clamp(x)) ** 3;
const outBack = (x: number) => { const t = clamp(x); const c = 1.9; return 1 + (c + 1) * (t - 1) ** 3 + c * (t - 1) ** 2; };
const bump = (x: number) => (x <= 0 || x >= 1 ? 0 : Math.sin(Math.PI * x));
const hash = (n: number) => { const s = Math.sin(n * 127.1 + 311.7) * 43758.5453; return s - Math.floor(s); };
const cellNoise = (x: number, y: number, seed = 0) => hash(x * 17.13 + y * 101.7 + seed * 7.77);

type Point = { x: number; y: number };

export interface AgentState {
  slot: number;
  cycle: number;
  /** Local time within the current cycle; negative before the first spawn. */
  local: number;
  alive: boolean;
}

export function agentState(slot: number, t: number): AgentState {
  const start = INTRO_END + SLOT_ORDER.indexOf(slot) * SLOT_GAP;
  const elapsed = t - start;
  if (elapsed < 0) return { slot, cycle: -1, local: elapsed, alive: false };
  const cycle = Math.floor(elapsed / CYCLE);
  const local = elapsed - cycle * CYCLE;
  return { slot, cycle, local, alive: local >= PHASE.spawn[0] && local < PHASE.retire[1] };
}

export function sceneStats(t: number) {
  let active = 0;
  let delivered = 0;
  for (let slot = 0; slot < 5; slot++) {
    const state = agentState(slot, t);
    if (state.alive) active++;
    if (state.cycle >= 0) delivered += state.cycle + (state.local >= PHASE.exit[0] ? 1 : 0);
  }
  return { active, delivered };
}

/** Where a slot sits on the orbit; `depth` runs from -1 (far) to 1 (near). */
export function orbitAt(slot: number, t: number) {
  const angle = -Math.PI / 2 + (slot * Math.PI * 2) / 5 + (t * Math.PI * 2) / ORBIT_PERIOD;
  const depth = Math.sin(angle);
  return { x: RING.x + RING.rx * Math.cos(angle), y: RING.y + RING.ry * depth, depth, scale: 0.78 + 0.22 * (depth + 1) / 2 };
}

export function createScene() {
  const size = COLS * ROWS;
  const chars = new Uint8Array(size);
  const colors = new Uint8Array(size);
  const depth = new Float32Array(size);

  const put = (x: number, y: number, ch: string, color: number) => {
    const cx = Math.round(x);
    const cy = Math.round(y);
    if (cx < 0 || cy < 0 || cx >= COLS || cy >= ROWS) return;
    chars[cy * COLS + cx] = ch.charCodeAt(0);
    colors[cy * COLS + cx] = color;
  };
  const text = (x: number, y: number, s: string, color: number) => {
    for (let i = 0; i < s.length; i++) if (s[i] !== ' ') put(x + i, y, s[i], color);
  };
  const erase = (x: number, y: number) => put(x, y, ' ', INK.none);
  const at = (x: number, y: number) => {
    const cx = Math.round(x), cy = Math.round(y);
    return cx < 0 || cy < 0 || cx >= COLS || cy >= ROWS ? 0 : chars[cy * COLS + cx];
  };
  // Far things sit a step back in the palette.
  const recede = (color: number, far: boolean) => {
    if (!far) return color;
    return color === INK.white ? INK.ink : color === INK.ink ? INK.lav : color === INK.lav ? INK.muted : color;
  };

  function stars(t: number) {
    for (let i = 0; i < 60; i++) {
      const y = Math.floor(hash(i * 3.1) * ROWS);
      const x = ((hash(i * 7.7) * COLS - t * (0.4 + hash(i) * 0.9)) % COLS + COLS) % COLS;
      const glint = Math.sin(t * (1 + hash(i * 1.3) * 2) + i);
      put(x, y, glint > 0.93 ? '+' : glint > 0.2 ? '.' : '`', glint > 0.93 ? INK.lav : INK.dim);
    }
  }

  // Two concentric cubes spin out of sync: a solid inner cube inside a
  // wireframe outer cube. Flashes sweep across both as a band: down for a
  // dispatch, up for a result.
  function cubes(t: number, scale: number, reveal: number, flash: { pink: number; teal: number }) {
    depth.fill(0);
    const K2 = 10;
    const K1 = 26 * scale;
    const rotation = (ax: number, ay: number, az: number) => {
      const [ca, sa, cb, sb, cc, sc] = [Math.cos(ax), Math.sin(ax), Math.cos(ay), Math.sin(ay), Math.cos(az), Math.sin(az)];
      // Rz · Ry · Rx
      return [
        cc * cb, cc * sb * sa - sc * ca, cc * sb * ca + sc * sa,
        sc * cb, sc * sb * sa + cc * ca, sc * sb * ca - cc * sa,
        -sb, cb * sa, cb * ca,
      ];
    };
    const apply = (m: number[], x: number, y: number, z: number) => [
      m[0] * x + m[1] * y + m[2] * z, m[3] * x + m[4] * y + m[5] * z, m[6] * x + m[7] * y + m[8] * z,
    ];
    const project = (x: number, y: number, z: number) => {
      const ooz = 1 / (K2 + z);
      return { px: Math.round(CORE.x + (K1 * ooz * x) / CELL_ASPECT), py: Math.round(CORE.y - K1 * ooz * y), ooz };
    };
    const tint = (py: number, color: number) => {
      const row = (py - CORE.y + CORE_RADIUS) / (CORE_RADIUS * 2);
      if (flash.pink > 0 && Math.abs(row - flash.pink) < 0.12) return INK.pink;
      if (flash.teal > 0 && Math.abs(row - (1 - flash.teal)) < 0.12) return INK.teal;
      return color;
    };

    // Inner cube: solid, lit faces with brighter edges.
    const inner = rotation(-t * 0.83, t * 0.61, t * 0.29);
    const size = 1.1;
    const ramp = '.,-~:;=!*#$@';
    const light = [0.45, 0.55, -0.7];
    const faces = [[1, 0, 0], [-1, 0, 0], [0, 1, 0], [0, -1, 0], [0, 0, 1], [0, 0, -1]];
    for (const n of faces) {
      const [nx, ny, nz] = apply(inner, n[0], n[1], n[2]);
      if (nz > 0.15) continue; // facing away
      const lit = clamp(0.2 + 0.8 * Math.max(0, nx * light[0] + ny * light[1] + nz * light[2]));
      const a = n[0] ? [0, 1, 0] : [1, 0, 0];
      const b = n[2] ? [0, 1, 0] : [0, 0, 1];
      for (let u = -1; u <= 1; u += 0.045) {
        for (let v = -1; v <= 1; v += 0.045) {
          const x0 = (n[0] + a[0] * u + b[0] * v) * size;
          const y0 = (n[1] + a[1] * u + b[1] * v) * size;
          const z0 = (n[2] + a[2] * u + b[2] * v) * size;
          const [x, y, z] = apply(inner, x0, y0, z0);
          const { px, py, ooz } = project(x, y, z);
          if (px < 0 || py < 0 || px >= COLS || py >= ROWS) continue;
          const index = py * COLS + px;
          if (ooz <= depth[index]) continue;
          depth[index] = ooz;
          if (cellNoise(px, py, 3) > reveal) { chars[index] = 32; colors[index] = 0; continue; }
          const edge = Math.max(Math.abs(u), Math.abs(v)) > 0.9;
          const lum = clamp(lit + (edge ? 0.3 : 0));
          chars[index] = ramp.charCodeAt(Math.min(ramp.length - 1, Math.floor(lum * ramp.length)));
          const base = lum > 0.8 ? INK.white : lum > 0.6 ? INK.ink : lum > 0.4 ? INK.lav : lum > 0.22 ? INK.muted : INK.dim;
          colors[index] = lum > 0.3 ? tint(py, base) : base;
        }
      }
    }

    // Outer cube: a wireframe whose line characters follow each edge's slope.
    const outer = rotation(t * 0.37, -t * 0.23, t * 0.13 + 0.6);
    const s = 1.95;
    const corners: number[][] = [];
    for (let i = 0; i < 8; i++) corners.push(apply(outer, i & 1 ? s : -s, i & 2 ? s : -s, i & 4 ? s : -s));
    for (let i = 0; i < 8; i++) {
      for (const bit of [1, 2, 4]) {
        if (i & bit) continue;
        const p = corners[i];
        const q = corners[i | bit];
        const a = project(p[0], p[1], p[2]);
        const b = project(q[0], q[1], q[2]);
        // Pick the character from the edge's slope in cells, one cell per step.
        const dx = b.px - a.px, dy = b.py - a.py;
        const ratio = Math.abs(dy) / (Math.abs(dx) || 1e-6);
        const slope = ratio < 0.35 ? '-' : ratio > 2.2 ? '|' : (dx > 0) === (dy < 0) ? '/' : '\\';
        // Diagonals take one cell per row so they stay a single stroke wide.
        const steps = Math.max(slope === '-' ? Math.abs(dx) : Math.abs(dy), 1);
        for (let k = 0; k <= steps; k++) {
          const f = k / steps;
          const x = p[0] + (q[0] - p[0]) * f, y = p[1] + (q[1] - p[1]) * f, z = p[2] + (q[2] - p[2]) * f;
          const { px, py, ooz } = project(x, y, z);
          if (px < 0 || py < 0 || px >= COLS || py >= ROWS) continue;
          const index = py * COLS + px;
          if (ooz <= depth[index]) continue;
          if (cellNoise(px, py, 5) > reveal) continue;
          const near = -z / s; // 1 nearest, -1 farthest
          // Far edges break into dashes, the classic hidden-line cue.
          if (near < -0.35 && k % 4 > 1) continue;
          depth[index] = ooz;
          chars[index] = slope.charCodeAt(0);
          const base = near > 0.4 ? INK.white : near > -0.1 ? INK.ink : near > -0.5 ? INK.lav : INK.muted;
          colors[index] = tint(py, base);
        }
      }
    }
    for (const c of corners) {
      const { px, py, ooz } = project(c[0], c[1], c[2]);
      if (px < 0 || py < 0 || px >= COLS || py >= ROWS || cellNoise(px, py, 5) > reveal) continue;
      const index = py * COLS + px;
      if (ooz < depth[index] - 0.002) continue;
      chars[index] = 43;
      colors[index] = -c[2] / s > -0.3 ? INK.white : INK.lav;
    }
  }

  // The orbit track, drawn in two halves so agents pass behind and in front.
  function ring(t: number, front: boolean, reveal: number) {
    for (let a = 0; a < Math.PI * 2; a += 0.008) {
      if ((Math.sin(a) > 0) !== front) continue;
      if (((a + Math.PI / 2) % (Math.PI * 2)) / (Math.PI * 2) > reveal) continue;
      const x = RING.x + RING.rx * Math.cos(a);
      const y = RING.y + RING.ry * Math.sin(a);
      if (at(x, y) !== 32) continue;
      const dash = ((a * 14 - t * 0.8) % 1 + 1) % 1;
      put(x, y, dash < 0.4 ? (front ? '-' : '.') : '.', front ? INK.muted : INK.dim);
    }
  }

  interface Pose { x: number; y: number; tip: Point; far: boolean; scale: number; }

  function poseFor(slot: number, t: number, local: number): Pose {
    const orbit = orbitAt(slot, t);
    const hop = span(local, [PHASE.result[0] - 0.3, PHASE.result[0] + 0.4]);
    // A small hop as the result leaves.
    const lift = hop > 0.4 ? 1.2 * bump((hop - 0.4) / 0.6) : 0;
    const y = orbit.y - lift;
    const top = y - (AGENT_H * orbit.scale) / 2;
    return { x: orbit.x, y, tip: { x: orbit.x, y: top - 2 }, far: orbit.depth < 0, scale: orbit.scale };
  }

  /** The tether from the core to an agent's antenna, as a gentle curve. */
  function tetherPoint(pose: Pose, s: number): Point {
    const start = CORE;
    const end = pose.tip;
    const bend = { x: (start.x + end.x) / 2, y: Math.min(start.y, end.y) - 3 };
    const u = 1 - s;
    return { x: u * u * start.x + 2 * u * s * bend.x + s * s * end.x, y: u * u * start.y + 2 * u * s * bend.y + s * s * end.y };
  }

  function trail(pose: Pose, s: number, reverse: boolean, color: number) {
    for (let j = 12; j >= 0; j--) {
      const q = reverse ? s + j * 0.022 : s - j * 0.022;
      if (q < 0 || q > 1) continue;
      const p = tetherPoint(pose, q);
      put(p.x, p.y, j === 0 ? '@' : j < 3 ? '*' : j < 6 ? '+' : j < 9 ? ':' : '.', recede(j < 4 ? color : j < 8 ? INK.lav : INK.muted, pose.far));
    }
  }

  function box(slot: number, t: number, local: number, cycle: number, pose: Pose) {
    const spawn = span(local, PHASE.spawn);
    const retire = span(local, PHASE.retire);
    let sy = pose.scale * (1 + Math.sin(t * 3.9 + slot * 1.7) * 0.04);
    let sx = pose.scale;
    if (spawn < 1) { const k = 0.2 + 0.8 * outBack(spawn); sy *= k; sx /= Math.sqrt(Math.max(k, 0.35)); }
    const caught = span(local, PHASE.catch);
    if (caught > 0 && caught < 1) { sy *= 1 - 0.2 * bump(caught); sx *= 1 + 0.15 * bump(caught); }
    const base = pose.y + (AGENT_H * sy) / 2;

    // Eyes look toward the core.
    const gx = Math.abs(CORE.x - pose.x) > 6 ? Math.sign(CORE.x - pose.x) : 0;
    const blinking = ((t + slot * 1.37) % 3.7) < 0.12;
    const light = { x: 0.5, y: 0.62, z: 0.6 };
    const sdf = (u: number, v: number) => {
      const r = 0.45;
      const qx = Math.abs(u) - (AGENT_W - r);
      const qy = Math.abs(v - AGENT_H / 2) - (AGENT_H / 2 - r);
      return Math.hypot(Math.max(qx, 0), Math.max(qy, 0)) + Math.min(Math.max(qx, qy), 0) - r;
    };
    const ramp = ':-=+*#%@';
    for (let y = Math.floor(base - 6); y <= Math.ceil(base); y++) {
      for (let x = Math.floor(pose.x - 6); x <= Math.ceil(pose.x + 6); x++) {
        const u = ((x - pose.x) * CELL_ASPECT) / sx;
        const v = (base - y + 0.5) / sy;
        const d = sdf(u, v);
        if (d > 0.12) continue;
        const n = cellNoise(x, y, slot + cycle * 5);
        if (spawn < 1 && n > spawn * 1.15) {
          if (n < spawn * 1.15 + 0.18) put(x, y, ':', INK.blue);
          continue;
        }
        if (retire > 0 && n < retire * 1.1) {
          // Dissolve into motes that drift off the orbit.
          const fall = (retire * 1.1 - n) * 14;
          if (n > 0.3) put(x + (n - 0.5) * 4, y + fall * fall * 0.12, n > 0.6 ? '.' : ',', recede(INK.lav, pose.far));
          continue;
        }
        if (d > -0.3) { put(x, y, d > -0.05 ? '.' : ':', recede(INK.lav, pose.far)); continue; }
        const e = 0.05;
        const nx = sdf(u + e, v) - sdf(u - e, v);
        const ny = sdf(u, v + e) - sdf(u, v - e);
        const h = clamp(-d / 0.6);
        const len = Math.hypot(nx * (1 - h), ny * (1 - h), h + 0.25) || 1;
        const lum = clamp(0.25 + 0.85 * ((nx * (1 - h) * light.x + ny * (1 - h) * light.y + (h + 0.25) * light.z) / len));
        const ch = ramp[Math.min(ramp.length - 1, Math.floor(lum * ramp.length))];
        put(x, y, ch, recede(lum > 0.78 ? INK.white : lum > 0.5 ? INK.ink : INK.lav, pose.far));
      }
    }
    if (spawn < 0.6 || retire > 0.25) return;
    // An antenna catches incoming tasks; its tip glows while a task is close
    // and pulses while the agent works.
    const top = Math.round(base - AGENT_H * sy);
    const dispatch = span(local, PHASE.dispatch);
    const catching = (dispatch > 0.6 && dispatch < 1) || (caught > 0 && caught < 1);
    const working = local >= PHASE.work[0] && local < PHASE.work[1];
    const tip = catching ? INK.pink : working && Math.floor(t * 4 + slot) % 2 ? INK.blue : INK.ink;
    put(pose.x, top - 1, '|', recede(INK.lav, pose.far));
    put(pose.x, top - 2, catching ? '@' : 'o', recede(tip, pose.far));
    // Eyes: two dark cells.
    const ey = Math.round(base - 2.2 * sy);
    for (const ex of [pose.x - 1 + gx, pose.x + 1 + gx]) {
      if (blinking) put(ex, ey, '-', INK.muted);
      else erase(ex, ey);
    }

    // Progress under the agent.
    if (local < PHASE.work[0] || local >= PHASE.retire[0]) return;
    const done = local >= PHASE.result[0];
    const status = done ? '[ok]' : `[${'#'.repeat(Math.round(span(local, PHASE.work) * 4)).padEnd(4, '.')}]`;
    text(pose.x - Math.floor(status.length / 2), Math.round(base) + 1, status, recede(done ? INK.teal : INK.lav, pose.far));
  }

  function agentLayer(slot: number, t: number, far: boolean) {
    const { local, cycle } = agentState(slot, t);
    if (cycle < 0 || local < PHASE.spawn[0] || local >= PHASE.retire[1] + 0.4) return;
    const pose = poseFor(slot, t, local);
    if (pose.far !== far) return;

    // The tether pays out as the agent appears and reels in as it retires.
    const drawOn = span(local, [PHASE.spawn[0], PHASE.spawn[0] + 0.6]);
    const retire = span(local, PHASE.retire);
    const reach = inOut(drawOn) * (1 - inOut(retire));
    for (let s = 0.08; s <= reach; s += 0.012) {
      const p = tetherPoint(pose, s);
      if (at(p.x, p.y) === 32) put(p.x, p.y, Math.round(s * 80) % 2 ? '.' : ':', far ? INK.dim : INK.muted);
    }
    const dispatch = span(local, PHASE.dispatch);
    if (dispatch > 0 && dispatch < 1) trail(pose, inOut(dispatch), false, INK.pink);
    const result = span(local, PHASE.result);
    if (result > 0 && result < 1) trail(pose, 1 - inOut(result), true, INK.teal);
    if (local < PHASE.retire[1]) box(slot, t, local, cycle, pose);
  }

  // A shockwave leaves the loop with every dispatch and every returned result.
  function ripples(t: number) {
    for (let slot = 0; slot < 5; slot++) {
      const { local, cycle } = agentState(slot, t);
      if (cycle < 0) continue;
      for (const [start, color] of [[PHASE.dispatch[0], INK.pink], [PHASE.result[1], INK.teal]] as const) {
        const p = span(local, [start, start + 1.1]);
        if (p <= 0 || p >= 1) continue;
        const r = 18 + 64 * outCubic(p);
        for (let a = 0; a < Math.PI * 2; a += 1.2 / r) {
          const x = CORE.x + r * Math.cos(a);
          const y = CORE.y + r * (RING.ry / RING.rx) * Math.sin(a);
          if (at(x, y) !== 32 || cellNoise(Math.round(x), Math.round(y), cycle) < p * 0.9) continue;
          put(x, y, p < 0.35 ? ':' : '.', p < 0.5 ? color : INK.muted);
        }
      }
    }
  }

  // Requests fall in from above before each dispatch; results leave upward.
  function requests(t: number) {
    const coreTop = CORE.y - CORE_RADIUS + 2;
    for (let slot = 0; slot < 5; slot++) {
      const state = agentState(slot, t);
      for (const cycle of [state.cycle, state.cycle + 1]) {
        if (cycle < 0) continue;
        const start = INTRO_END + SLOT_ORDER.indexOf(slot) * SLOT_GAP + cycle * CYCLE;
        const p = span(t - start, [PHASE.dispatch[0] - 1.1, PHASE.dispatch[0] - 0.35]);
        if (p <= 0 || p >= 1) continue;
        const from = CORE.x - 12 + hash(slot * 3 + cycle * 1.9) * 24;
        const x = from + (CORE.x - from) * inOut(p);
        const y = -1 + (coreTop + 1) * inOut(p);
        for (let j = 0; j < 3; j++) put(x, y - j, j ? '.' : 'o', j ? INK.red : INK.pink);
      }
      if (state.cycle < 0) continue;
      const exit = span(state.local, PHASE.exit);
      if (exit <= 0 || exit >= 1) continue;
      const y = coreTop - 1 - (coreTop + 6) * outCubic(exit);
      for (let j = 0; j < 4; j++) put(CORE.x, y + j, j === 0 ? '^' : j < 2 ? '|' : ':', j < 2 ? INK.teal : INK.muted);
    }
  }

  function render(t: number) {
    chars.fill(32);
    colors.fill(0);
    const coreReveal = smooth((t - 0.2) / 1.0);
    const ringReveal = outCubic((t - 0.9) / 0.9);

    // The loop anticipates each dispatch, then kicks.
    let anticipate = 0, kick = 0, pink = 0, teal = 0;
    for (let slot = 0; slot < 5; slot++) {
      const { local, cycle } = agentState(slot, t);
      if (cycle < 0) continue;
      anticipate = Math.max(anticipate, bump(span(local, [PHASE.dispatch[0] - 0.3, PHASE.dispatch[0]])));
      kick = Math.max(kick, bump(span(local, [PHASE.dispatch[0], PHASE.dispatch[0] + 0.45])));
      const sweepDown = span(local, [PHASE.dispatch[0] - 0.35, PHASE.dispatch[0] + 0.1]);
      if (sweepDown > 0 && sweepDown < 1) pink = sweepDown;
      const sweepUp = span(local, [PHASE.result[1] - 0.05, PHASE.exit[0] + 0.4]);
      if (sweepUp > 0 && sweepUp < 1) teal = sweepUp;
    }
    const scale = (0.55 + 0.45 * outBack(coreReveal)) * (1 - 0.04 * anticipate + 0.07 * kick);

    stars(t);
    if (ringReveal > 0) ring(t, false, ringReveal);
    for (let slot = 0; slot < 5; slot++) agentLayer(slot, t, true);
    if (coreReveal > 0) cubes(t, scale, coreReveal * 1.2, { pink, teal });
    if (ringReveal > 0) ring(t, true, ringReveal);
    ripples(t);
    for (let slot = 0; slot < 5; slot++) agentLayer(slot, t, false);
    requests(t);
    return { chars, colors };
  }

  return { chars, colors, render };
}

/** Plain text of one frame, for the no-script still. */
export function frameText(t: number) {
  const { chars } = createScene().render(t);
  const lines: string[] = [];
  for (let y = 0; y < ROWS; y++) lines.push(String.fromCharCode(...chars.subarray(y * COLS, (y + 1) * COLS)).trimEnd());
  return lines.join('\n');
}
