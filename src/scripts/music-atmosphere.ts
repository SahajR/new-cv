import { frame, scroll, springValue } from 'motion';

/** MUSIC STORYBOARD — the pixel weaving is the physical light/dark boundary.
 * The ground below it is always dark; content above it keeps its own palette.
 * Scroll progress softly reveals the atmospheric glyphs with a damped spring.
 * The dock changes palette when it crosses into the dark ground.
 * No animation loops or per-pixel updates run while idle.
 */
export function startMusicAtmosphere() {
  const section = document.querySelector<HTMLElement>('#music');
  const backdrop = document.querySelector<HTMLElement>('[data-music-atmosphere]');
  const boundary = section?.querySelector<HTMLElement>('[data-music-transition]');
  const folio = backdrop?.closest<HTMLElement>('.folio');
  if (!section || !backdrop || !boundary || !folio) return;

  const root = document.documentElement;
  const reduced = matchMedia('(prefers-reduced-motion: reduce)');
  const glyphs = [...backdrop.querySelectorAll<HTMLElement>('[data-music-glyph]')];
  const details = backdrop.querySelector<HTMLElement>('[data-music-details]');
  const dust = backdrop.querySelector<HTMLElement>('[data-music-dust]');
  const mist = section.querySelector<SVGGElement>('[data-music-mist]');
  const themeMeta = document.querySelector<HTMLMetaElement>('meta[name="theme-color"]');
  const savedChrome = themeMeta?.content;
  root.style.setProperty('--music-ground', getComputedStyle(root).getPropertyValue('--bg').trim());

  const progress = springValue<number>(0, { stiffness: 95, damping: 26, mass: 0.7 });
  let lastProgress = 0;
  let initialized = false;
  let dark = false;
  let boundaryBottom = boundary.getBoundingClientRect().bottom + window.scrollY;

  const render = (value: number) => {
    const p = Math.max(0, Math.min(1, value));
    if (details) details.style.opacity = `${p}`;
    glyphs.forEach((glyph, i) => {
      glyph.style.transform = reduced.matches ? 'none'
        : `translateY(${(1 - p) * (i === 0 ? 45 : -35)}px) rotate(${(1 - p) * (i === 0 ? -9 : 7)}deg)`;
    });
    if (dust) dust.style.transform = reduced.matches ? 'none' : `translateY(${-24 * p}px)`;
    if (mist) mist.style.transform = reduced.matches ? 'none' : `translateX(${(p - 0.5) * 5}px)`;
  };
  const unsubscribe = progress.on('change', render);
  const update = (scrollY: number) => {
    const p = Math.max(0, Math.min(1, (scrollY + innerHeight - boundaryBottom) / (innerHeight * 0.75)));
    const nextDark = boundaryBottom - scrollY < innerHeight - 88;
    if (nextDark !== dark) {
      dark = nextDark;
      if (dark) root.dataset.musicTheme = 'dark';
      else delete root.dataset.musicTheme;
      if (themeMeta) themeMeta.content = dark ? '#071315' : savedChrome ?? '#e9e3fe';
    }
    lastProgress = p;
    if (reduced.matches || !initialized) {
      progress.jump(reduced.matches ? (p >= 0.55 ? 1 : 0) : p);
      render(progress.get());
      initialized = true;
    } else progress.set(p);
  };
  // The ground is in document space, so it meets the weaving without scroll lag.
  // Geometry is measured only on layout changes; scrolling updates decorations.
  const stopScroll = scroll((_, info) => update(info.y.current));
  const measure = () => {
    boundaryBottom = boundary.getBoundingClientRect().bottom + window.scrollY;
    const folioTop = folio.getBoundingClientRect().top + window.scrollY;
    backdrop.style.top = `${boundaryBottom - folioTop - 1}px`;
    backdrop.style.visibility = 'visible';
    update(window.scrollY);
  };
  const scheduleMeasure = () => frame.read(measure);
  const observer = new ResizeObserver(scheduleMeasure);
  observer.observe(section.closest('[data-journey]') ?? section);
  window.addEventListener('resize', scheduleMeasure);
  document.fonts.ready.then(scheduleMeasure);
  measure();

  const syncMotion = () => {
    progress.jump(reduced.matches ? (lastProgress >= 0.55 ? 1 : 0) : lastProgress);
    render(progress.get());
  };
  reduced.addEventListener('change', syncMotion);
  // A restored tab should reflect its current scroll immediately.
  const restore = () => frame.read(syncMotion);
  window.addEventListener('pageshow', restore);
  document.addEventListener('astro:before-swap', () => {
    stopScroll();
    observer.disconnect();
    unsubscribe();
    progress.destroy();
    reduced.removeEventListener('change', syncMotion);
    window.removeEventListener('pageshow', restore);
    window.removeEventListener('resize', scheduleMeasure);
    delete root.dataset.musicTheme;
    root.style.removeProperty('--music-ground');
    if (themeMeta && savedChrome) themeMeta.content = savedChrome;
  }, { once: true });
}
