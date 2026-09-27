// A 200 × 100 ASCII motion piece: requests fall into an orchestrator loop,
// which dispatches tasks to agents; each agent boots a sandbox VM on a node,
// makes tool calls into the platform, and returns its result upward.
// Pure and deterministic in `t`, so the server can render the same still.

export const COLS = 200;
export const ROWS = 100;
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
export const INTRO_END = 2.6;
export const CYCLE = 15;
export const STILL_TIME = 37.95;
const SLOT_ORDER = [2, 0, 4, 1, 3];
const SLOT_GAP = CYCLE / 5;
const PHASE = {
  boot: [0, 0.8], beam: [0.45, 1.15], spawn: [1.0, 1.75], dispatch: [1.75, 2.65], work: [2.9, 8.9],
  result: [8.9, 9.8], exit: [9.8, 10.3], retire: [9.95, 10.75],
} as const;
const CALL_START = 3.1;
const CALL_LENGTH = 1.6;

// Layout, in cells.
const CORE = { x: 100, y: 17 };
const RING = { x: 100, y: 18, rx: 46, ry: 7 };
const HUB = { x: RING.x, y: RING.y + RING.ry };
const AGENT_X = [24, 62, 100, 138, 176];
const AGENT_BASE = 58;
const AGENT_TOP = 47;
const STATUS_ROW = 60;
const BUS_ROW = 65;
const NODE_FACE_TOP = 73;
const NODE_FACE_H = 15;
const NODE_FACE_W = 26;
const NODE_DEPTH_ROWS = 3;
const NODE_DEPTH_COLS = 5;
const NODE_TOP = NODE_FACE_TOP - NODE_DEPTH_ROWS;
const HORIZON = 66;
const FLOOR_TOP = 90;

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

/** An agent's journey from the hub, as a fanned cubic curve. */
function pathPoint(slot: number, s: number): Point {
  const ax = AGENT_X[slot];
  const u = 1 - s;
  const p1 = { x: HUB.x, y: HUB.y + 10 };
  const p2 = { x: ax, y: AGENT_TOP - 12 };
  const p3 = { x: ax, y: AGENT_TOP - 1 };
  return {
    x: u * u * u * HUB.x + 3 * u * u * s * p1.x + 3 * u * s * s * p2.x + s * s * s * p3.x,
    y: u * u * u * HUB.y + 3 * u * u * s * p1.y + 3 * u * s * s * p2.y + s * s * s * p3.y,
  };
}

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

function cycleStart(slot: number, cycle: number) {
  return INTRO_END + SLOT_ORDER.indexOf(slot) * SLOT_GAP + cycle * CYCLE;
}
const bladeFor = (slot: number, cycle: number) => Math.floor(hash(slot * 13 + cycle * 7.3) * 4);
const callsFor = (slot: number, cycle: number) => (hash(slot * 5.1 + cycle * 3.7) > 0.4 ? 3 : 2);

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

  function stars(t: number) {
    for (let i = 0; i < 70; i++) {
      const y = Math.floor(hash(i * 3.1) * 44);
      const x = ((hash(i * 7.7) * COLS - t * (0.4 + hash(i) * 0.9)) % COLS + COLS) % COLS;
      const glint = Math.sin(t * (1 + hash(i * 1.3) * 2) + i);
      put(x, y, glint > 0.93 ? '+' : glint > 0.2 ? '.' : '`', glint > 0.93 ? INK.lav : INK.dim);
    }
  }

  // A perspective floor that drifts toward the viewer beneath the nodes.
  function floor(t: number, reveal: number) {
    const lines = 9;
    const scroll = (t * 0.35) % 1;
    for (let k = 0; k < lines; k++) {
      const z = (k + 1 - scroll) / lines;
      const y = Math.round(HORIZON + 3 + (ROWS - HORIZON - 3) * z ** 1.9);
      if (y < FLOOR_TOP || y >= ROWS) continue;
      const near = z > 0.6;
      for (let x = 2; x < COLS - 2; x++) {
        if (Math.abs(x - 100) / 100 > reveal) continue;
        put(x, y, near ? '-' : '.', near ? INK.muted : INK.dim);
      }
    }
    for (let k = -8; k <= 8; k++) {
      const slope = k * 6;
      for (let y = FLOOR_TOP; y < ROWS; y++) {
        const x = 100 + (y - HORIZON) * slope / 10;
        if (x < 1 || x > COLS - 2 || Math.abs(x - 100) / 100 > reveal) continue;
        const steep = Math.abs(slope) < 5;
        put(x, y, steep ? '|' : k < 0 ? '/' : '\\', y > 94 ? INK.muted : INK.dim);
      }
    }
  }

  // The platform bus: packets of unrelated traffic stream along it.
  function bus(t: number, reveal: number) {
    for (let x = 3; x < COLS - 3; x++) {
      if (Math.abs(x - 100) > reveal * 100) continue;
      const flow = (x - t * 22) % 9;
      const packet = ((flow + 9) % 9) < 2 && hash(Math.floor((x - t * 22) / 9)) > 0.45;
      put(x, BUS_ROW, packet ? '=' : '-', packet ? INK.lav : INK.dim);
    }
    if (reveal >= 1) for (const ax of AGENT_X) put(ax, BUS_ROW, '+', INK.muted);
  }

  interface NodeActivity { blade: number; boot: number; running: boolean; flash: number; heat: number; }

  function node(slot: number, t: number, lift: number, activity: NodeActivity | null) {
    const cx = AGENT_X[slot];
    const x0 = cx - 15;
    const y0 = NODE_FACE_TOP + lift;
    const x1 = x0 + NODE_FACE_W - 1;
    const y1 = y0 + NODE_FACE_H - 1;
    const shift = (row: number) => Math.round((row * NODE_DEPTH_COLS) / NODE_DEPTH_ROWS);
    // Clear the silhouette so the floor never shows through.
    for (let y = y0 - NODE_DEPTH_ROWS; y <= y1; y++) {
      for (let x = x0; x <= x1 + NODE_DEPTH_COLS; x++) erase(x, y);
    }
    // Top face, lit from the upper right.
    for (let r = 1; r <= NODE_DEPTH_ROWS; r++) {
      const y = y0 - r;
      const s = shift(r);
      for (let x = x0 + s; x <= x1 + s; x++) {
        const edge = r === NODE_DEPTH_ROWS;
        put(x, y, edge ? '_' : (x + r) % 2 ? '.' : ':', edge ? INK.lav : INK.muted);
      }
      put(x0 + s - 1, y, '/', INK.lav);
    }
    // Right face in shadow.
    for (let c = 1; c <= NODE_DEPTH_COLS; c++) {
      const top = y0 - Math.round((c * NODE_DEPTH_ROWS) / NODE_DEPTH_COLS);
      for (let y = top; y <= y1 - Math.round((c * NODE_DEPTH_ROWS) / NODE_DEPTH_COLS); y++) {
        put(x1 + c, y, c === NODE_DEPTH_COLS ? '|' : (y + c) % 3 ? ' ' : ';', c === NODE_DEPTH_COLS ? INK.muted : INK.dim);
      }
      put(x1 + c, y1 - Math.round((c * NODE_DEPTH_ROWS) / NODE_DEPTH_COLS) + 1, '/', INK.muted);
    }
    // Front face border.
    for (let x = x0; x <= x1; x++) { put(x, y0, '-', INK.lav); put(x, y1, '-', INK.muted); }
    for (let y = y0; y <= y1; y++) { put(x0, y, '|', INK.lav); put(x1, y, '|', INK.lav); }
    put(x0, y0, '+', INK.ink); put(x1, y0, '+', INK.ink); put(x0, y1, '+', INK.lav); put(x1, y1, '+', INK.lav);
    text(x0 + 2, y0 + 1, `n0${slot + 1}`, INK.muted);

    // Blades: one sandbox VM each; neighbours run quiet background workloads.
    for (let b = 0; b < 4; b++) {
      const y = y0 + 3 + b * 2;
      put(x0 + 2, y, '[', INK.muted);
      put(x0 + 19, y, ']', INK.muted);
      const mine = activity && activity.blade === b;
      for (let i = 0; i < 16; i++) {
        const x = x0 + 3 + i;
        if (mine && activity) {
          const booted = i / 16 < activity.boot;
          if (activity.flash > 0.35) put(x, y, '#', INK.white);
          else if (activity.running) {
            const v = hash(Math.floor(t * 9) + i * 3.3 + slot);
            put(x, y, v > 0.66 ? '#' : v > 0.33 ? '=' : '-', INK.ink);
          } else put(x, y, booted ? '#' : '.', booted ? INK.lav : INK.dim);
        } else {
          const v = hash(Math.floor(t * 1.5 + b * 3) * 9.1 + i * 1.7 + slot * 5);
          put(x, y, v > 0.82 ? '=' : '.', v > 0.82 ? INK.muted : INK.dim);
        }
      }
      const led = mine && activity ? (activity.flash > 0.2 ? INK.pink : INK.teal)
        : Math.sin(t * 2.1 + b * 1.7 + slot) > 0.6 ? INK.teal : INK.dim;
      put(x0 + 22, y, 'o', led);
    }
    // A small GPU heatmap reacts to tool calls.
    const heat = activity ? activity.heat : 0;
    const ramp = ' .:-=+*#%@';
    for (let row = 0; row < 2; row++) {
      for (let i = 0; i < 20; i++) {
        const wave = 0.5 + 0.5 * Math.sin(i * 0.7 + t * 3 + row * 1.9 + slot);
        const v = clamp(0.12 + heat * 0.75 * wave + hash(i + row * 31 + Math.floor(t * 6)) * 0.12);
        const ch = ramp[Math.min(ramp.length - 1, Math.floor(v * ramp.length))];
        put(x0 + 2 + i, y0 + 11 + row, ch, v > 0.7 ? INK.pink : v > 0.45 ? INK.red : INK.ember);
      }
    }
  }

  // Flashes sweep across the loop as a band: down for a dispatch, up for a result.
  function torus(t: number, scale: number, reveal: number, flash: { pink: number; teal: number }) {
    depth.fill(0);
    const A = t * 0.8;
    const B = t * 0.37;
    const cA = Math.cos(A), sA = Math.sin(A), cB = Math.cos(B), sB = Math.sin(B);
    const K2 = 9;
    const K1 = 37 * scale;
    const ramp = '.,-~:;=!*#$@';
    for (let theta = 0; theta < Math.PI * 2; theta += 0.1) {
      const ct = Math.cos(theta), st = Math.sin(theta);
      for (let phi = 0; phi < Math.PI * 2; phi += 0.035) {
        const cp = Math.cos(phi), sp = Math.sin(phi);
        const cx = 2 + ct;
        const cy = st;
        const x = cx * (cB * cp + sA * sB * sp) - cy * cA * sB;
        const y = cx * (sB * cp - sA * cB * sp) + cy * cA * cB;
        const z = K2 + cA * cx * sp + cy * sA;
        const ooz = 1 / z;
        const px = Math.round(CORE.x + (K1 * ooz * x) / CELL_ASPECT);
        const py = Math.round(CORE.y - K1 * ooz * y);
        if (px < 0 || py < 0 || px >= COLS || py >= ROWS) continue;
        const index = py * COLS + px;
        if (ooz <= depth[index]) continue;
        depth[index] = ooz;
        if (cellNoise(px, py, 3) > reveal) { chars[index] = 32; colors[index] = 0; continue; }
        const L = cp * ct * sB - cA * ct * sp - sA * st + cB * (cA * st - ct * sA * sp);
        const lum = clamp((L + 1.1) / 2.5);
        chars[index] = ramp.charCodeAt(Math.min(ramp.length - 1, Math.floor(lum * ramp.length)));
        let color: number = lum > 0.78 ? INK.white : lum > 0.58 ? INK.ink : lum > 0.38 ? INK.lav : lum > 0.2 ? INK.muted : INK.dim;
        const row = (py - CORE.y + 14) / 28;
        if (flash.pink > 0 && lum > 0.3 && Math.abs(row - flash.pink) < 0.12) color = INK.pink;
        if (flash.teal > 0 && lum > 0.3 && Math.abs(row - (1 - flash.teal)) < 0.12) color = INK.teal;
        colors[index] = color;
      }
    }
  }

  function ring(t: number, front: boolean, reveal: number) {
    for (let a = 0; a < Math.PI * 2; a += 0.012) {
      const isFront = Math.sin(a) > 0;
      if (isFront !== front) continue;
      if (((a + Math.PI / 2) % (Math.PI * 2)) / (Math.PI * 2) > reveal) continue;
      const x = RING.x + RING.rx * Math.cos(a);
      const y = RING.y + RING.ry * Math.sin(a);
      const dash = ((a * 9 - t * 1.3) % 1 + 1) % 1;
      const color = front ? INK.muted : INK.dim;
      put(x, y, dash < 0.5 ? (front ? '-' : '.') : '.', color);
    }
  }

  function ringPoint(angle: number): Point {
    return { x: RING.x + RING.rx * Math.cos(angle), y: RING.y + RING.ry * Math.sin(angle) };
  }

  // Queued tasks orbit the loop until they leave from the hub at the bottom.
  function tasks(t: number, front: boolean) {
    if (t < 2.1) return;
    const spin = 1.3;
    for (let slot = 0; slot < 5; slot++) {
      const state = agentState(slot, t);
      for (const cycle of [state.cycle, state.cycle + 1]) {
        if (cycle < 0) continue;
        const leave = cycleStart(slot, cycle) + PHASE.dispatch[0];
        const wait = 2.3 + hash(slot * 3 + cycle * 1.9) * 1.1;
        const arrive = leave - wait;
        if (t < arrive || t >= leave) continue;
        const land = arrive + 0.7;
        const angleAt = (time: number) => Math.PI / 2 - spin * (leave - time);
        if (t < land) {
          if (front) continue;
          // Falling in from above, as a thin streak.
          const target = ringPoint(angleAt(land));
          const p = inOut((t - arrive) / 0.7);
          const y = -2 + (target.y + 2) * p;
          for (let j = 0; j < 4; j++) put(target.x, y - j, j ? '.' : 'o', j ? INK.dim : INK.pink);
          continue;
        }
        const angle = angleAt(t);
        if ((Math.sin(angle) > 0) !== front) continue;
        for (let j = 3; j >= 0; j--) {
          const p = ringPoint(angle - j * 0.035);
          put(p.x, p.y, j === 0 ? '@' : j === 1 ? 'o' : '.', j < 2 ? INK.pink : INK.red);
        }
      }
    }
  }

  function trail(slot: number, s: number, reverse: boolean, head: string, color: number) {
    for (let j = 14; j >= 0; j--) {
      const q = reverse ? s + j * 0.018 : s - j * 0.018;
      if (q < 0 || q > 1) continue;
      const p = pathPoint(slot, q);
      put(p.x, p.y, j === 0 ? head : j < 3 ? '*' : j < 6 ? '+' : j < 10 ? ':' : '.', j < 4 ? color : j < 9 ? INK.lav : INK.muted);
    }
  }

  function blob(slot: number, t: number, local: number, cycle: number) {
    const ax = AGENT_X[slot];
    const spawn = span(local, PHASE.spawn);
    const retire = span(local, PHASE.retire);
    let sy = 1 + Math.sin(t * 3.9 + slot * 1.7) * 0.035;
    let sx = 1;
    let lift = 0;
    if (spawn < 1) { sy = 0.2 + 0.8 * outBack(spawn); sx = 1 / Math.sqrt(Math.max(sy, 0.35)); }
    const caught = span(local, [2.6, 2.95]);
    if (caught > 0 && caught < 1) { sy *= 1 - 0.16 * bump(caught); sx *= 1 + 0.12 * bump(caught); }
    const hop = span(local, [8.55, 9.35]);
    if (hop > 0 && hop < 1) {
      if (hop < 0.35) { const k = bump(hop / 0.35 / 2); sy *= 1 - 0.18 * k; sx *= 1 + 0.12 * k; }
      else { const k = (hop - 0.35) / 0.65; lift = 2.2 * bump(k); sy *= 1 + 0.12 * bump(k); }
    }
    const base = AGENT_BASE - lift;

    // Look at whatever is moving toward or away from this agent.
    let gx = Math.sign(HUB.x - ax) * 0.6;
    let gy = 0;
    const dispatch = span(local, PHASE.dispatch);
    if (dispatch > 0 && dispatch < 1) gy = -1;
    const call = callPhase(slot, cycle, local);
    if (call) gy = call.phase === 'up' ? 0 : 1;
    if (local > PHASE.work[0] && !call) gx = Math.round(Math.sin(t * 0.9 + slot * 4));
    if (span(local, PHASE.result) > 0 && span(local, PHASE.result) < 1) { gy = -1; gx = Math.sign(HUB.x - ax) * 0.6; }
    const blinking = ((t + slot * 1.37) % 3.7) < 0.12;

    const light = { x: 0.5, y: 0.62, z: 0.6 };
    const sdf = (u: number, v: number) => {
      const body = Math.hypot(u, v - clamp(v, 2.6, 6.8)) - 4.2;
      const skirt = (Math.hypot(u / 6.8, v / 1.5) - 1) * 1.5;
      const k = 1.6;
      const h = clamp(0.5 + 0.5 * (skirt - body) / k);
      const blend = skirt * (1 - h) + body * h - k * h * (1 - h);
      return Math.max(blend, -v);
    };
    const ramp = ':-=+*#%@';
    for (let y = base - 14; y <= base; y++) {
      for (let x = ax - 13; x <= ax + 13; x++) {
        const u = ((x - ax) * CELL_ASPECT) / sx;
        const v = (base - y + 0.5) / sy;
        const d = sdf(u, v);
        if (d > 0.15) continue;
        const n = cellNoise(x, y, slot + cycle * 5);
        if (spawn < 1 && n > spawn * 1.15) {
          if (n < spawn * 1.15 + 0.14) put(x, y, ':', INK.blue);
          continue;
        }
        if (retire > 0 && n < retire * 1.1) {
          // Dissolve into falling motes.
          const fall = (retire * 1.1 - n) * 26;
          const py = y + fall * fall * 0.25;
          if (py < STATUS_ROW && n > 0.25) put(x + (n - 0.5) * 3, py, n > 0.6 ? '.' : ',', INK.lav);
          continue;
        }
        if (d > -0.35) { put(x, y, d > -0.05 ? '.' : ':', INK.lav); continue; }
        const e = 0.05;
        const nx = sdf(u + e, v) - sdf(u - e, v);
        const ny = sdf(u, v + e) - sdf(u, v - e);
        const h = clamp(-d / 2.2);
        const len = Math.hypot(nx * (1 - h), ny * (1 - h), h + 0.25) || 1;
        const lum = clamp(0.25 + 0.85 * ((nx * (1 - h) * light.x + ny * (1 - h) * light.y + (h + 0.25) * light.z) / len));
        const ch = ramp[Math.min(ramp.length - 1, Math.floor(lum * ramp.length))];
        put(x, y, ch, lum > 0.78 ? INK.white : lum > 0.5 ? INK.ink : INK.lav);
      }
    }
    if (spawn < 0.6 || retire > 0.25) return;
    // Eyes: two tall dark holes, set by gaze.
    for (const side of [-1, 1]) {
      const ex = ax + (side < 0 ? -4 : 3) + Math.round(gx);
      const ey = Math.round(base - 8 * sy) + gy;
      for (const dx of [0, 1]) {
        if (blinking) { erase(ex + dx, ey); put(ex + dx, ey + 1, '_', INK.muted); continue; }
        erase(ex + dx, ey); erase(ex + dx, ey + 1);
      }
    }
  }

  function callPhase(slot: number, cycle: number, local: number) {
    const calls = callsFor(slot, cycle);
    const i = Math.floor((local - CALL_START) / CALL_LENGTH);
    if (i < 0 || i >= calls) return null;
    const c = local - CALL_START - i * CALL_LENGTH;
    if (c < 0.45) return { index: i, phase: 'down' as const, p: c / 0.45 };
    if (c < 0.95) return { index: i, phase: 'process' as const, p: (c - 0.45) / 0.5 };
    if (c < 1.4) return { index: i, phase: 'up' as const, p: (c - 0.95) / 0.45 };
    return null;
  }

  function nodeActivity(slot: number, t: number): NodeActivity | null {
    const { local, cycle } = agentState(slot, t);
    if (cycle < 0 || local >= PHASE.retire[1] + 0.4) return null;
    const blade = bladeFor(slot, cycle);
    const drain = span(local, [PHASE.retire[0], PHASE.retire[1] + 0.4]);
    const boot = span(local, PHASE.boot) * (1 - drain);
    const call = callPhase(slot, cycle, local);
    const flash = call?.phase === 'process' ? bump(call.p) : 0;
    let heat = 0;
    for (let i = 0; i < callsFor(slot, cycle); i++) {
      const since = local - (CALL_START + i * CALL_LENGTH + 0.45);
      if (since > 0) heat = Math.max(heat, Math.exp(-since * 1.4));
    }
    const running = local >= PHASE.spawn[0] && local < PHASE.retire[0];
    return { blade, boot, running, flash, heat };
  }

  function agentLayer(slot: number, t: number) {
    const { local, cycle } = agentState(slot, t);
    if (cycle < 0) return;
    const ax = AGENT_X[slot];

    // Beam up from the sandbox, then a quiet conduit while the agent lives.
    const beam = span(local, PHASE.beam);
    const retire = span(local, PHASE.retire);
    const conduitTop = STATUS_ROW + 1;
    if (beam > 0 && local < PHASE.retire[1]) {
      const top = NODE_TOP - 1 - (NODE_TOP - 1 - AGENT_BASE) * inOut(beam);
      const bottom = retire > 0 ? NODE_TOP - 1 - (NODE_TOP - 1 - conduitTop) * (1 - inOut(retire)) : NODE_TOP - 1;
      for (let y = Math.ceil(Math.max(top, conduitTop)); y <= bottom; y++) {
        if (y === BUS_ROW) continue;
        const hot = beam < 1 && y - top < 3;
        put(ax, y, hot ? '|' : ':', hot ? INK.blue : INK.muted);
      }
      if (beam < 1) {
        for (let y = Math.ceil(top); y < conduitTop + 1; y++) if (y >= AGENT_BASE) put(ax, y, '|', INK.blue);
        put(ax, top, '^', INK.white);
      }
    }

    // Path from the hub draws on as the agent appears.
    const drawOn = span(local, [PHASE.spawn[0], PHASE.spawn[0] + 0.6]);
    if (drawOn > 0 && retire < 1) {
      const from = retire > 0 ? inOut(retire) : 0;
      const to = inOut(drawOn);
      for (let s = from; s <= to; s += 0.02) {
        const p = pathPoint(slot, s);
        if (at(p.x, p.y) === 32) put(p.x, p.y, Math.round(s * 50) % 2 ? '.' : ':', INK.muted);
      }
    }

    // A task arrives from the hub.
    const dispatch = span(local, PHASE.dispatch);
    if (dispatch > 0 && dispatch < 1) trail(slot, inOut(dispatch), false, '@', INK.pink);

    // Tool calls into the platform and back.
    const call = callPhase(slot, cycle, local);
    if (call && call.phase !== 'process') {
      const p = inOut(call.p);
      const y = call.phase === 'down' ? conduitTop + (NODE_TOP - 1 - conduitTop) * p : NODE_TOP - 1 - (NODE_TOP - 1 - conduitTop) * p;
      const dir = call.phase === 'down' ? -1 : 1;
      for (let j = 3; j >= 0; j--) {
        const py = y + dir * j;
        if (py >= conduitTop && py < NODE_TOP) put(ax, py, j === 0 ? (call.phase === 'down' ? 'v' : '^') : '|', j < 2 ? INK.blue : INK.muted);
      }
    }

    // The result climbs back to the loop.
    const result = span(local, PHASE.result);
    if (result > 0 && result < 1) trail(slot, 1 - inOut(result), true, '@', INK.teal);

    const alive = local >= PHASE.spawn[0] && local < PHASE.retire[1] + 0.6;
    if (!alive) return;
    blob(slot, t, local, cycle);

    // Status: a spinner and progress bar under the agent.
    if (local < PHASE.spawn[1] || local >= PHASE.retire[0] + 0.3) return;
    const work = span(local, PHASE.work);
    let status: string;
    let color: number = INK.lav;
    if (local < PHASE.work[0]) status = ' .'.repeat(Math.floor(t * 4) % 4 + 1).padEnd(10, ' ');
    else if (local < PHASE.result[0]) {
      const filled = Math.round(work * 8);
      status = `${'|/-\\'[Math.floor(t * 10) % 4]}[${'#'.repeat(filled)}${'.'.repeat(8 - filled)}]`;
    } else { status = '[  ok  ]'; color = INK.teal; }
    text(ax - Math.floor(status.length / 2), STATUS_ROW, status, color);
  }

  // A shockwave leaves the loop with every dispatch and every returned result.
  function ripples(t: number) {
    for (let slot = 0; slot < 5; slot++) {
      const { local, cycle } = agentState(slot, t);
      if (cycle < 0) continue;
      for (const [start, color] of [[PHASE.dispatch[0], INK.pink], [PHASE.result[1], INK.teal]] as const) {
        const p = span(local, [start, start + 1.1]);
        if (p <= 0 || p >= 1) continue;
        const r = 26 + 70 * outCubic(p);
        for (let a = 0; a < Math.PI * 2; a += 1.2 / r) {
          const x = CORE.x + r * Math.cos(a);
          const y = CORE.y + 1 + r * 0.3 * Math.sin(a);
          if (at(x, y) !== 32 || cellNoise(Math.round(x), Math.round(y), cycle) < p * 0.9) continue;
          put(x, y, p < 0.35 ? ':' : '.', p < 0.5 ? color : INK.muted);
        }
      }
    }
  }

  function results(t: number) {
    for (let slot = 0; slot < 5; slot++) {
      const { local, cycle } = agentState(slot, t);
      if (cycle < 0) continue;
      const exit = span(local, PHASE.exit);
      if (exit <= 0 || exit >= 1) continue;
      const y = CORE.y - 12 - (CORE.y - 10) * outCubic(exit) * 1.4;
      for (let j = 0; j < 6; j++) put(CORE.x, y + j, j === 0 ? '^' : j < 3 ? '|' : ':', j < 3 ? INK.teal : INK.muted);
    }
  }

  function render(t: number) {
    chars.fill(32);
    colors.fill(0);
    const floorReveal = outCubic(t / 1.0);
    const busReveal = outCubic((t - 0.9) / 0.6);
    const coreReveal = smooth((t - 1.1) / 1.0);
    const ringReveal = outCubic((t - 1.7) / 0.9);

    stars(t);
    floor(t, floorReveal);
    if (busReveal > 0) bus(t, busReveal);
    for (let slot = 0; slot < 5; slot++) {
      const rise = outBack((t - 0.3 - SLOT_ORDER.indexOf(slot) * 0.12) / 0.7);
      if (rise <= 0) continue;
      node(slot, t, Math.round((1 - rise) * 30), nodeActivity(slot, t));
    }

    // The orchestrator anticipates each dispatch, then kicks.
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

    if (ringReveal > 0) { ring(t, false, ringReveal); tasks(t, false); }
    if (coreReveal > 0) torus(t, scale, coreReveal * 1.2, { pink, teal });
    if (ringReveal > 0) { ring(t, true, ringReveal); tasks(t, true); }
    ripples(t);
    for (let slot = 0; slot < 5; slot++) agentLayer(slot, t);
    results(t);
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
