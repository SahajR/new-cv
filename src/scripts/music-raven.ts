import { frame, scroll, springValue } from 'motion';

/** The perch stays still; the raven notices the reader as the artwork enters.
 * 0–30%: head slightly averted. 30–65%: looks outward and tilts inquisitively.
 * 65–100%: settles into a watchful angle. No idle loops or flashing eyes.
 */
export function startRaven() {
  const perch = document.querySelector<HTMLElement>('[data-raven-perch]');
  const anchor = perch?.closest<HTMLElement>('[data-music-portal]');
  const head = perch?.querySelector<SVGGElement>('[data-raven-head]');
  const eyes = perch?.querySelector<SVGGElement>('[data-raven-eyes]');
  if (!perch || !anchor || !head || !eyes) return;

  const reduced = matchMedia('(prefers-reduced-motion: reduce)');
  const progress = springValue<number>(0, { stiffness: 65, damping: 19, mass: 0.8 });
  const gazePosition = () => {
    const rect = perch.getBoundingClientRect();
    return rect.top + rect.height * 0.24 + scrollY;
  };
  let anchorTop = gazePosition();
  let lastProgress = 0;
  let initialized = false;
  const clamp = (value: number) => Math.max(0, Math.min(1, value));

  const render = (value: number) => {
    const p = clamp(value);
    const gaze = clamp((p - 0.15) / 0.5);
    const tilt = p < 0.3 ? -7 : p < 0.65
      ? -7 + ((p - 0.3) / 0.35) * 19
      : 12 - ((p - 0.65) / 0.35) * 6;
    head.style.transform = reduced.matches ? 'rotate(6deg)'
      : `rotate(${tilt.toFixed(3)}deg) scaleX(${(0.88 + gaze * 0.12).toFixed(3)})`;
    eyes.style.opacity = reduced.matches ? '1' : `${0.55 + gaze * 0.45}`;
    perch.dataset.gaze = gaze > 0.95 ? 'watching' : 'turning';
  };
  const unsubscribe = progress.on('change', render);
  const update = (y: number) => {
    lastProgress = clamp((y + innerHeight * 0.9 - anchorTop) / (innerHeight * 0.7));
    if (!initialized || reduced.matches) {
      progress.jump(reduced.matches ? 1 : lastProgress);
      render(progress.get());
      initialized = true;
    } else progress.set(lastProgress);
  };
  const stopScroll = scroll((_, info) => update(info.y.current));
  const measure = () => {
    anchorTop = gazePosition();
    update(scrollY);
  };
  const scheduleMeasure = () => frame.read(measure);
  const observer = new ResizeObserver(scheduleMeasure);
  observer.observe(anchor.closest('[data-journey]') ?? anchor);
  window.addEventListener('resize', scheduleMeasure);
  document.fonts.ready.then(scheduleMeasure);
  const syncMotion = () => {
    progress.jump(reduced.matches ? 1 : lastProgress);
    render(progress.get());
  };
  reduced.addEventListener('change', syncMotion);
  measure();

  document.addEventListener('astro:before-swap', () => {
    stopScroll();
    unsubscribe();
    progress.destroy();
    observer.disconnect();
    window.removeEventListener('resize', scheduleMeasure);
    reduced.removeEventListener('change', syncMotion);
  }, { once: true });
}
