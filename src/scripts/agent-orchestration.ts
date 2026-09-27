import fragmentSource from '../shaders/agent-orchestration.frag?raw';
import { COORDINATOR, CYCLE_DURATION, createTeam, poseAt, agentCenter, routeAt, curvePoint } from './agent-orchestration-model';

const vertexSource = `attribute vec2 a_position;
void main() { gl_Position = vec4(a_position, 0.0, 1.0); }`;

function createRenderer(canvas: HTMLCanvasElement) {
  const gl = canvas.getContext('webgl', { alpha: false, antialias: false, depth: false, powerPreference: 'low-power' });
  if (!gl) return null;
  const shaders: WebGLShader[] = [];
  const program = gl.createProgram();
  if (!program) return null;
  for (const [type, source] of [[gl.VERTEX_SHADER, vertexSource], [gl.FRAGMENT_SHADER, fragmentSource]] as const) {
    const shader = gl.createShader(type);
    if (!shader) { gl.deleteProgram(program); shaders.forEach(s => gl.deleteShader(s)); return null; }
    shaders.push(shader);
    gl.shaderSource(shader, source);
    gl.compileShader(shader);
    if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
      console.warn('Agent illustration: using the still fallback.', gl.getShaderInfoLog(shader));
      shaders.forEach(s => gl.deleteShader(s));
      gl.deleteProgram(program);
      return null;
    }
    gl.attachShader(program, shader);
  }
  gl.linkProgram(program);
  shaders.forEach(s => gl.deleteShader(s));
  if (!gl.getProgramParameter(program, gl.LINK_STATUS)) { gl.deleteProgram(program); return null; }
  gl.useProgram(program);
  const buffer = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 1, -1, -1, 1, -1, 1, 1, -1, 1, 1]), gl.STATIC_DRAW);
  const position = gl.getAttribLocation(program, 'a_position');
  gl.enableVertexAttribArray(position);
  gl.vertexAttribPointer(position, 2, gl.FLOAT, false, 0, 0);
  const uniform = (name: string) => gl.getUniformLocation(program, name);
  const locations = {
    resolution: uniform('u_resolution'), agents: uniform('u_agents[0]'), edges: uniform('u_edges[0]'),
    softness: uniform('u_softness[0]'),
    gaze: uniform('u_gaze[0]'), blink: uniform('u_blink[0]'), packet: uniform('u_packet'),
    trail: uniform('u_trail[0]'), coordinator: uniform('u_coordinator'), time: uniform('u_time'),
  };
  return { gl, locations, dispose: () => { gl.deleteBuffer(buffer); gl.deleteProgram(program); } };
}

export function startAgentOrchestration(root: HTMLElement) {
  if (root.dataset.agentInitialized) return;
  root.dataset.agentInitialized = 'true';
  const canvas = root.querySelector<HTMLCanvasElement>('[data-agent-canvas]');
  const toggle = root.querySelector<HTMLButtonElement>('[data-agent-pause]');
  if (!canvas || !toggle) return;
  let renderer = createRenderer(canvas);
  if (!renderer) return;
  const reduced = matchMedia('(prefers-reduced-motion: reduce)');
  let team = createTeam();
  let order = Math.floor(Math.random() * 3);
  let elapsed = 0;
  let sceneTime = 0;
  let raf = 0;
  let previous = 0;
  let lastPaint = 0;
  let visible = false;
  let paused = false;
  let lost = false;
  let disposed = false;
  const agents = new Float32Array(12);
  const edges = new Float32Array(3);
  const softness = new Float32Array(6);
  const gaze = new Float32Array(6);
  const blink = new Float32Array(3);
  const trail = new Float32Array(60);
  const look = (x: number, y: number, target: { x: number; y: number }) => {
    const length = Math.hypot(target.x - x, target.y - y) || 1;
    return [(target.x - x) / length, (target.y - y) / length];
  };

  function paint(time: number) {
    if (!renderer || lost) return;
    const { gl, locations: u } = renderer;
    const poses = team.map(agent => poseAt(agent, time));
    const route = routeAt(time, order);
    const centers = poses.map(agentCenter);
    let packet = { ...COORDINATOR };
    let packetAlpha = 0;
    let pulse = 0;
    trail.fill(0);
    if (route) {
      const inbound = route.phase === 'incoming';
      const source = centers[route.source];
      const target = centers[route.target];
      if (inbound || route.phase === 'outgoing') {
        packet = curvePoint(inbound ? source : COORDINATOR, inbound ? COORDINATOR : target, route.progress);
        // Tuck the packet into each character at the start/end of its journey.
        packetAlpha = Math.min(1, route.progress * 7, (1 - route.progress) * 7);
      }
      if (route.phase === 'coordinating') pulse = Math.sin(route.progress * Math.PI);
      for (let i = 0; i < 20; i++) {
        const incomingTrail = i < 10;
        const dot = curvePoint(incomingTrail ? source : COORDINATOR, incomingTrail ? COORDINATOR : target, ((i % 10) + 1) / 11);
        const active = incomingTrail ? inbound : route.phase === 'outgoing';
        trail.set([dot.x, dot.y, active ? .9 : .28], i * 3);
      }
    }
    for (let i = 0; i < 3; i++) {
      const p = poses[i];
      const received = route?.target === i && route.phase === 'received' ? Math.sin(route.progress * Math.PI) : 0;
      agents.set([p.x, p.y, p.height, received], i * 4);
      edges[i] = p.edge;
      softness.set([p.lean, p.stretch], i * 2);
      gaze.set(look(centers[i].x, centers[i].y, packetAlpha > 0 ? packet : COORDINATOR), i * 2);
      blink[i] = 1 - .92 * Math.pow(Math.max(0, Math.cos(time * 2 + i * 2.3)), 80);
    }
    gl.uniform2f(u.resolution, canvas!.width, canvas!.height);
    gl.uniform4fv(u.agents, agents);
    gl.uniform1fv(u.edges, edges);
    gl.uniform2fv(u.softness, softness);
    gl.uniform2fv(u.gaze, gaze);
    gl.uniform1fv(u.blink, blink);
    gl.uniform3fv(u.trail, trail);
    gl.uniform4f(u.packet, packet.x, packet.y, packetAlpha, time * .7);
    gl.uniform1f(u.coordinator, pulse);
    // The background clock never resets when a new team emerges.
    gl.uniform1f(u.time, reduced.matches ? 2 : sceneTime);
    gl.drawArrays(gl.TRIANGLES, 0, 6);
    root.dataset.agentReady = '';
  }

  function resize() {
    if (!renderer || lost) return;
    const width = root.clientWidth;
    if (!width) return;
    // Enough detail for the grain, without rendering a full retina canvas.
    const scale = Math.min(devicePixelRatio || 1, 1.75);
    canvas!.width = Math.round(Math.min(width, 800) * scale);
    canvas!.height = Math.round(canvas!.width * 380 / 640);
    renderer.gl.viewport(0, 0, canvas!.width, canvas!.height);
    paint(reduced.matches ? 1.45 : elapsed);
  }

  function tick(now: number) {
    raf = 0;
    if (previous) {
      const delta = Math.min((now - previous) / 1000, .05);
      elapsed += delta;
      sceneTime += delta;
    }
    previous = now;
    if (elapsed >= CYCLE_DURATION) {
      elapsed %= CYCLE_DURATION;
      team = createTeam();
      order = Math.floor(Math.random() * 3);
    }
    // Keep motion smooth, without doing extra work on high-refresh displays.
    if (now - lastPaint >= 1000 / 60 - .5) { paint(elapsed); lastPaint = now; }
    raf = requestAnimationFrame(tick);
  }

  function sync() {
    const running = visible && !document.hidden && !paused && !reduced.matches && !lost && !disposed;
    root.dataset.agentState = lost ? 'fallback' : reduced.matches ? 'reduced' : paused ? 'paused' : running ? 'running' : 'offscreen';
    if (running && !raf) { previous = 0; raf = requestAnimationFrame(tick); }
    if (!running && raf) { cancelAnimationFrame(raf); raf = 0; previous = 0; }
  }
  const onToggle = () => {
    paused = !paused;
    toggle.setAttribute('aria-pressed', String(paused));
    toggle.setAttribute('aria-label', paused ? 'Resume agent animation' : 'Pause agent animation');
    sync();
  };
  const onPreference = () => {
    toggle.hidden = reduced.matches || lost;
    sync();
    paint(reduced.matches ? 1.45 : elapsed);
  };
  const observer = new IntersectionObserver(([entry]) => { visible = entry.isIntersecting; sync(); });
  const resizeObserver = new ResizeObserver(resize);
  const onLost = (event: Event) => {
    event.preventDefault();
    lost = true;
    delete root.dataset.agentReady;
    toggle.hidden = true;
    sync();
  };
  const onRestored = () => {
    renderer = createRenderer(canvas);
    lost = !renderer;
    resize();
    onPreference();
  };
  const onPageHide = () => { visible = false; sync(); };
  const onPageShow = () => { observer.unobserve(root); observer.observe(root); };
  const dispose = () => {
    disposed = true;
    sync();
    observer.disconnect();
    resizeObserver.disconnect();
    renderer?.dispose();
    toggle.removeEventListener('click', onToggle);
    reduced.removeEventListener('change', onPreference);
    document.removeEventListener('visibilitychange', sync);
    window.removeEventListener('pagehide', onPageHide);
    window.removeEventListener('pageshow', onPageShow);
    canvas.removeEventListener('webglcontextlost', onLost);
    canvas.removeEventListener('webglcontextrestored', onRestored);
  };
  toggle.addEventListener('click', onToggle);
  canvas.addEventListener('webglcontextlost', onLost);
  canvas.addEventListener('webglcontextrestored', onRestored);
  document.addEventListener('visibilitychange', sync);
  reduced.addEventListener('change', onPreference);
  window.addEventListener('pagehide', onPageHide);
  window.addEventListener('pageshow', onPageShow);
  document.addEventListener('astro:before-swap', dispose, { once: true });
  observer.observe(root);
  resizeObserver.observe(root);
  resize();
  onPreference();
}
