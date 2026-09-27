import { COLS, ROWS, CELL_ASPECT, PALETTE, STILL_TIME, createScene, sceneStats } from './agent-ascii-scene';

const FPS = 30;
const FONT = 'ui-monospace, "SF Mono", Menlo, Consolas, "DejaVu Sans Mono", monospace';
const FIRST = 32;
const LAST = 126;

// One tile per printable character per palette colour, drawn once per resize.
function buildAtlas(cellW: number, cellH: number) {
  const tileW = Math.ceil(cellW);
  const tileH = Math.ceil(cellH);
  const atlas = document.createElement('canvas');
  atlas.width = tileW * (LAST - FIRST + 1);
  atlas.height = tileH * PALETTE.length;
  const ctx = atlas.getContext('2d');
  if (!ctx) return null;
  ctx.font = `${cellH * 1.12}px ${FONT}`;
  // Fit any monospace advance to the cell exactly.
  const advance = ctx.measureText('M').width || cellW;
  ctx.textBaseline = 'middle';
  ctx.textAlign = 'center';
  for (let c = 1; c < PALETTE.length; c++) {
    ctx.fillStyle = PALETTE[c];
    for (let code = FIRST + 1; code <= LAST; code++) {
      ctx.save();
      ctx.beginPath();
      ctx.rect((code - FIRST) * tileW, c * tileH, tileW, tileH);
      ctx.clip();
      ctx.translate((code - FIRST) * tileW + tileW / 2, c * tileH + tileH / 2);
      ctx.scale(Math.min(1.25, (cellW * 1.08) / advance), 1);
      ctx.fillText(String.fromCharCode(code), 0, 0);
      ctx.restore();
    }
  }
  return { atlas, tileW, tileH };
}

export function startAgentOrchestration(root: HTMLElement) {
  if (root.dataset.agentInitialized) return;
  root.dataset.agentInitialized = 'true';
  const canvas = root.querySelector<HTMLCanvasElement>('[data-agent-canvas]');
  const toggle = root.querySelector<HTMLButtonElement>('[data-agent-pause]');
  const activeOut = root.querySelector<HTMLElement>('[data-agent-active]');
  const tasksOut = root.querySelector<HTMLElement>('[data-agent-tasks]');
  const ctx = canvas?.getContext('2d', { alpha: false });
  const glow = root.querySelector<HTMLCanvasElement>('[data-agent-glow]');
  const glowCtx = glow?.getContext('2d', { alpha: false });
  if (!canvas || !toggle || !ctx) return;

  const reduced = matchMedia('(prefers-reduced-motion: reduce)');
  const scene = createScene();
  const shownChars = new Uint8Array(COLS * ROWS);
  const shownColors = new Uint8Array(COLS * ROWS);
  const xs = new Float64Array(COLS + 1);
  const ys = new Float64Array(ROWS + 1);
  let atlas: ReturnType<typeof buildAtlas> = null;
  let elapsed = 0;
  let raf = 0;
  let previous = 0;
  let lastPaint = 0;
  let lastStats = '';
  let visible = false;
  let paused = false;
  let disposed = false;

  function invalidate() {
    shownChars.fill(0);
    ctx!.fillStyle = PALETTE[0];
    ctx!.fillRect(0, 0, canvas!.width, canvas!.height);
  }

  function paint(time: number) {
    if (!atlas) return;
    const { chars, colors } = scene.render(time);
    const { atlas: sheet, tileW, tileH } = atlas;
    ctx!.fillStyle = PALETTE[0];
    // Only cells that changed since the last frame are repainted.
    for (let y = 0, i = 0; y < ROWS; y++) {
      const top = ys[y];
      const h = ys[y + 1] - top;
      for (let x = 0; x < COLS; x++, i++) {
        const ch = chars[i];
        const color = colors[i];
        if (ch === shownChars[i] && color === shownColors[i]) continue;
        shownChars[i] = ch;
        shownColors[i] = color;
        const left = xs[x];
        const w = xs[x + 1] - left;
        ctx!.fillRect(left, top, w, h);
        if (ch > FIRST && color) ctx!.drawImage(sheet, (ch - FIRST) * tileW, color * tileH, tileW, tileH, left, top, w, h);
      }
    }
    if (glowCtx) {
      // Subtract the screen colour so only lit glyphs bloom.
      glowCtx.globalCompositeOperation = 'copy';
      glowCtx.drawImage(canvas!, 0, 0, glow!.width, glow!.height);
      glowCtx.globalCompositeOperation = 'difference';
      glowCtx.fillStyle = PALETTE[0];
      glowCtx.fillRect(0, 0, glow!.width, glow!.height);
    }
    const stats = sceneStats(time);
    const label = `${stats.active}|${stats.delivered}`;
    if (label !== lastStats) {
      lastStats = label;
      if (activeOut) activeOut.textContent = String(stats.active);
      if (tasksOut) tasksOut.textContent = String(1280 + stats.delivered).padStart(4, '0');
    }
    root.dataset.agentReady = '';
  }

  const stillTime = () => (reduced.matches ? STILL_TIME : elapsed);

  function resize() {
    const width = root.querySelector<HTMLElement>('.aa-stage')?.clientWidth ?? root.clientWidth;
    if (!width) return;
    // Enough pixels for crisp glyphs, without a huge backing store.
    const scale = Math.min(devicePixelRatio || 1, 2.5);
    canvas!.width = Math.round(Math.min(width * scale, 1800));
    const cellW = canvas!.width / COLS;
    const cellH = cellW / CELL_ASPECT;
    canvas!.height = Math.round(cellH * ROWS);
    for (let x = 0; x <= COLS; x++) xs[x] = Math.round(x * cellW);
    for (let y = 0; y <= ROWS; y++) ys[y] = Math.round(y * cellH);
    if (glow) { glow.width = Math.round(canvas!.width / 4); glow.height = Math.round(canvas!.height / 4); }
    atlas = buildAtlas(cellW, cellH);
    invalidate();
    paint(stillTime());
  }

  function tick(now: number) {
    raf = requestAnimationFrame(tick);
    if (previous) elapsed += Math.min((now - previous) / 1000, 0.05);
    previous = now;
    // ASCII reads best slightly stepped; 30 fps also halves the work.
    if (now - lastPaint < 1000 / FPS - 1) return;
    lastPaint = now;
    paint(elapsed);
  }

  function sync() {
    const running = visible && !document.hidden && !paused && !reduced.matches && !disposed;
    root.dataset.agentState = reduced.matches ? 'reduced' : paused ? 'paused' : running ? 'running' : 'offscreen';
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
    toggle.hidden = reduced.matches;
    sync();
    paint(stillTime());
  };
  // The build-in plays the first time the scene is seen, then the loop continues.
  const observer = new IntersectionObserver(([entry]) => {
    visible = entry.isIntersecting;
    sync();
  }, { threshold: 0.15 });
  const resizeObserver = new ResizeObserver(resize);
  const onRestored = () => { resize(); };
  const onPageHide = () => { visible = false; sync(); };
  const onPageShow = () => { observer.unobserve(root); observer.observe(root); };
  const dispose = () => {
    disposed = true;
    sync();
    observer.disconnect();
    resizeObserver.disconnect();
    toggle.removeEventListener('click', onToggle);
    reduced.removeEventListener('change', onPreference);
    document.removeEventListener('visibilitychange', sync);
    window.removeEventListener('pagehide', onPageHide);
    window.removeEventListener('pageshow', onPageShow);
    canvas.removeEventListener('contextrestored', onRestored);
  };
  toggle.addEventListener('click', onToggle);
  canvas.addEventListener('contextrestored', onRestored);
  document.addEventListener('visibilitychange', sync);
  reduced.addEventListener('change', onPreference);
  window.addEventListener('pagehide', onPageHide);
  window.addEventListener('pageshow', onPageShow);
  document.addEventListener('astro:before-swap', dispose, { once: true });
  observer.observe(root);
  resizeObserver.observe(root);
  elapsed = reduced.matches ? STILL_TIME : 0;
  resize();
  onPreference();
}
