import { cancelFrame, frame } from 'motion';

// Deliberately low-resolution, 12 fps telemetry: a pixel instrument, not a
// live dashboard. Motion shares the page's frame loop; no work runs offscreen.
export function startStackConsole(root: HTMLElement) {
  const gpu = root.querySelector<HTMLCanvasElement>('[data-console-gpu]')?.getContext('2d');
  const wave = root.querySelector<HTMLCanvasElement>('[data-console-wave]')?.getContext('2d');
  const spectrum = root.querySelector<HTMLCanvasElement>('[data-console-spectrum]')?.getContext('2d');
  const toggle = root.querySelector<HTMLButtonElement>('[data-console-pause]');
  if (!gpu || !wave || !spectrum || !toggle) return;

  const reduced = matchMedia('(prefers-reduced-motion: reduce)');
  const load = root.querySelector<HTMLElement>('[data-gpu-load]')!;
  const temp = root.querySelector<HTMLElement>('[data-gpu-temp]')!;
  const meters = [...root.querySelectorAll<SVGPathElement>('[data-node-meter]')];
  const leds = [...root.querySelectorAll<HTMLElement>('[data-node-led]')];
  const ink = '#242136';
  const heat = ['#54324b', '#853649', '#af3549', '#d85665', '#eb7883'];
  let visible = false;
  let paused = false;
  let running = false;
  let elapsed = 0;
  let lastPaint = 0;
  let lastMetrics = -1;

  const clear = (ctx: CanvasRenderingContext2D) => {
    ctx.fillStyle = ink;
    ctx.fillRect(0, 0, ctx.canvas.width, ctx.canvas.height);
  };
  const paint = (time: number) => {
    clear(gpu);
    // PCB traces and pins surround a four-tile GPU die.
    gpu.fillStyle = '#45416e';
    gpu.fillRect(32, 2, 96, 92);
    gpu.fillStyle = '#72718f';
    for (let i = 0; i < 8; i++) {
      gpu.fillRect(26, 10 + i * 10, 6, 4);
      gpu.fillRect(128, 10 + i * 10, 6, 4);
    }
    gpu.fillStyle = '#35304d';
    gpu.fillRect(36, 6, 88, 84);
    for (let y = 0; y < 8; y++) {
      for (let x = 0; x < 8; x++) {
        const intensity = 0.52 + Math.sin(x * 0.71 + time * 1.6) * 0.2
          + Math.cos(y * 0.91 - time * 0.8) * 0.18;
        gpu.fillStyle = heat[Math.max(0, Math.min(4, Math.floor(intensity * 5)))];
        gpu.fillRect(39 + x * 10 + (x > 3 ? 2 : 0), 9 + y * 10 + (y > 3 ? 2 : 0), 8, 8);
      }
    }
    // A small memory bus runs alongside the die.
    for (let i = 0; i < 8; i++) {
      gpu.fillStyle = i === Math.floor(time * 3) % 8 ? '#d3d9f5' : '#575371';
      gpu.fillRect(144, 10 + i * 10, 6, 5);
      gpu.fillRect(9, 10 + i * 10, 6, 5);
    }

    clear(wave);
    wave.fillStyle = '#45405e';
    wave.fillRect(0, 22, 216, 1);
    for (let x = 0; x < 216; x += 3) {
      const envelope = 0.18 + 0.82 * Math.pow(Math.sin(x * 0.022 - time * 1.4), 2);
      const signal = Math.sin(x * 0.38 + time * 8) * Math.sin(x * 0.11 - time * 3);
      const amplitude = Math.round(signal * envelope * 18);
      wave.fillStyle = x > 190 ? '#e57889' : '#c0b7ea';
      wave.fillRect(x, Math.min(22, 22 - amplitude), 2, Math.max(2, Math.abs(amplitude)));
    }

    clear(spectrum);
    for (let i = 0; i < 36; i++) {
      const envelope = 0.22 + 0.72 * Math.pow(Math.sin(i * 0.12 + time * 0.4), 2);
      const level = Math.round((0.3 + Math.abs(Math.sin(i * 0.43 - time * 2)) * 0.7) * envelope * 12);
      for (let j = 0; j < level; j++) {
        spectrum.fillStyle = j > 8 ? '#e57889' : j > 4 ? '#d85665' : '#853649';
        spectrum.fillRect(i * 6 + 1, 52 - j * 4, 4, 3);
      }
      spectrum.fillStyle = '#c0b7ea';
      spectrum.fillRect(i * 6 + 1, 48 - level * 4, 4, 2);
    }

    // Readouts are intentionally calmer than the sampled signal displays.
    const beat = Math.floor(time * 2);
    if (beat !== lastMetrics) {
      lastMetrics = beat;
      load.textContent = String(Math.round(76 + Math.sin(time * 0.6) * 7));
      temp.textContent = String(Math.round(62 + Math.sin(time * 0.3) * 2));
      meters.forEach((meter, i) => {
        const width = Math.round(30 + Math.sin(time * 0.7 + i * 1.4) * 12);
        meter.setAttribute('d', `M0 0h${width}v8H0z`);
        leds[i].style.opacity = (beat + i) % 5 === 0 ? '0.45' : '1';
      });
    }
  };

  const tick = ({ timestamp, delta }: { timestamp: number; delta: number }) => {
    elapsed += Math.min(delta, 50) / 1000;
    if (timestamp - lastPaint < 1000 / 12) return;
    lastPaint = timestamp;
    paint(elapsed);
  };
  const sync = () => {
    root.dataset.consoleState = reduced.matches ? 'reduced' : paused ? 'paused'
      : document.hidden ? 'hidden' : !visible ? 'offscreen' : 'running';
    const shouldRun = visible && !paused && !reduced.matches && !document.hidden;
    if (shouldRun === running) return;
    running = shouldRun;
    if (running) frame.update(tick, true);
    else cancelFrame(tick);
  };
  toggle.addEventListener('click', () => {
    paused = !paused;
    toggle.setAttribute('aria-pressed', String(paused));
    toggle.setAttribute('aria-label', paused ? 'Resume console animation' : 'Pause console animation');
    sync();
  });
  const syncPreference = () => {
    toggle.hidden = reduced.matches;
    sync();
  };
  const observer = new IntersectionObserver(([entry]) => {
    visible = entry.isIntersecting;
    sync();
  });
  observer.observe(root);
  document.addEventListener('visibilitychange', sync);
  reduced.addEventListener('change', syncPreference);
  window.addEventListener('pagehide', () => { visible = false; sync(); });
  window.addEventListener('pageshow', () => {
    // Re-observe after bfcache restoration to refresh visibility without polling.
    observer.unobserve(root);
    observer.observe(root);
  });
  paint(0);
  root.dataset.consoleReady = '';
  syncPreference();
}
