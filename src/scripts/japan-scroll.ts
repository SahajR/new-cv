export interface StoryPosition { id: string; top: number; bottom: number }

export function selectActiveStory(stories: StoryPosition[], mapBottom: number, viewportHeight: number): string | undefined {
  const visible = stories.filter(story => story.bottom > mapBottom && story.top < viewportHeight);
  const line = mapBottom + Math.max(0, viewportHeight - mapBottom) * .2;
  return visible.reduce<StoryPosition | undefined>((best, story) => !best || Math.abs(story.top-line) < Math.abs(best.top-line) ? story : best, undefined)?.id;
}

// The stage reaches the top first; the old map position reaches it last.
// Both coordinates move with the document, so reversing scroll retraces the lift.
export function mapLiftProgress(stageTop: number, dockTop: number, reducedMotion = false) {
  if (dockTop <= 0) return 1;
  if (stageTop >= 0 || reducedMotion) return 0;
  return -stageTop / (dockTop - stageTop);
}

function setupMapHandoff(root: HTMLElement, map: HTMLElement, schedule: () => void) {
  const home = map.parentElement!;
  const book = home.closest<HTMLElement>('[data-scrapbook]')!;
  const face = home.closest<HTMLElement>('[data-face-page]')!;
  const stage = book.querySelector<HTMLElement>('[data-book-stage]')!;
  const dock = root.querySelector<HTMLElement>('[data-japan-map-dock]')!;
  const reduced = matchMedia('(prefers-reduced-motion:reduce)');
  root.dataset.mapReady = 'true';

  function place(parent: HTMLElement, placement: string) {
    if (map.parentElement !== parent) {
      const focused = map.contains(document.activeElement) ? document.activeElement as HTMLElement | SVGElement : null;
      parent.append(map);
      focused?.focus({ preventScroll: true });
    }
    if (map.dataset.mapPlacement !== placement) {
      map.dataset.mapPlacement = placement;
      map.removeAttribute('style');
    }
  }
  function update() {
    const stageRect = stage.getBoundingClientRect();
    const target = dock.getBoundingClientRect();
    const progress = mapLiftProgress(stageRect.top, target.top, reduced.matches);
    // Let visible page turns finish. A restored card link can skip the opening.
    const settled = book.dataset.position === face.dataset.facePage && book.dataset.turning !== 'true';
    if (progress === 0 || (!settled && stageRect.bottom > 0)) {
      place(home, 'book');
    } else if (progress === 1) {
      place(dock, 'dock');
    } else {
      const source = home.getBoundingClientRect();
      place(document.body, 'flight');
      const lerp = (from: number, to: number) => from + (to - from) * progress;
      map.style.left = `${lerp(source.left, target.left)}px`;
      map.style.top = `${lerp(source.top, target.top)}px`;
      map.style.width = `${lerp(source.width, target.width)}px`;
      map.style.height = `${lerp(source.height, target.height)}px`;
    }
  }
  const changes = new MutationObserver(schedule);
  changes.observe(book, { attributes: true, attributeFilter: ['data-position', 'data-turning', 'data-arrival'] });
  reduced.addEventListener('change', schedule);
  return {
    update,
    dock,
    cleanup() {
      changes.disconnect();
      reduced.removeEventListener('change', schedule);
      place(home, 'book');
      delete root.dataset.mapReady;
    },
  };
}

export function setupJapanScroll(root: HTMLElement) {
  const abort = new AbortController();
  const { signal } = abort;
  const map = root.closest('main')!.querySelector<HTMLElement>('[data-japan-map]')!;
  const canvas = map.querySelector<SVGSVGElement>('[data-map-canvas]')!;
  const toggle = map.querySelector<HTMLButtonElement>('[data-map-view]')!;
  const current = map.querySelector<HTMLElement>('[data-map-current]')!;
  const cards = [...root.querySelectorAll<HTMLElement>('[data-japan-story]')];
  const markers = [...map.querySelectorAll<SVGAElement>('[data-map-stop]')];
  const links = [...root.querySelectorAll<HTMLAnchorElement>('[data-place-link]')];
  const small = matchMedia('(max-width:600px)');
  const reduced = matchMedia('(prefers-reduced-motion:reduce)');
  let active = '';
  let locked = false;
  let visible = true;
  let frame = 0;
  let settle: ReturnType<typeof setTimeout> | undefined;
  let fullMap = false;
  const handoff = setupMapHandoff(root, map, schedule);

  function paint(id: string) {
    if (id === active) return;
    active = id;
    const card = cards.find(card => card.dataset.japanStory === id);
    current.textContent = card?.dataset.placeName ?? 'Choose a place, or follow the photographs';
    cards.forEach(card => card.classList.toggle('is-active', card.dataset.japanStory === id));
    [...markers, ...links].forEach(link => {
      if ((link.dataset.mapStop ?? link.dataset.placeLink) === id) link.setAttribute('aria-current','location');
      else link.removeAttribute('aria-current');
    });
  }
  function measure() {
    frame = 0;
    handoff.update();
    if (!visible || locked) return;
    const mapRect = map.getBoundingClientRect();
    const positions = cards.map(card => { const rect = card.getBoundingClientRect(); return { id: card.dataset.japanStory!, top: rect.top, bottom: rect.bottom }; });
    const selected = selectActiveStory(positions, Math.max(0,mapRect.bottom), innerHeight);
    if (selected) paint(selected);
    else if (positions[0]?.top >= innerHeight) paint('');
  }
  function schedule() { if (!frame) frame = requestAnimationFrame(measure); }
  function resize() {
    canvas.dataset.mapMode = small.matches && !fullMap ? 'detail' : 'country';
    canvas.setAttribute('viewBox', small.matches && !fullMap ? '85 0 670 330' : '0 0 900 330');
    toggle.hidden = !small.matches;
    toggle.textContent = fullMap ? 'The journey ↙' : 'Whole Japan ↗';
    toggle.setAttribute('aria-label', fullMap ? 'Show the journey in detail' : 'Show the whole map of Japan');
    root.style.setProperty('--japan-map-offset', `${handoff.dock.getBoundingClientRect().height+24}px`);
    schedule();
  }
  function unlock() { locked = false; clearTimeout(settle); schedule(); }
  function jump(card: HTMLElement, smooth: boolean) {
    clearTimeout(settle);
    locked = true;
    paint(card.dataset.japanStory!);
    card.scrollIntoView({ block: 'start', behavior: smooth && !reduced.matches ? 'smooth' : 'instant' });
    card.focus({ preventScroll: true });
    settle = setTimeout(unlock, smooth && !reduced.matches ? 1100 : 50);
  }
  const clickPlace = (event: MouseEvent) => {
    const anchor = (event.target as Element).closest<HTMLAnchorElement | SVGAElement>('[data-map-stop], [data-place-link]');
    if (!anchor || event.defaultPrevented || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey || event.button !== 0) return;
    const id = anchor.dataset.mapStop ?? anchor.dataset.placeLink;
    const card = cards.find(card => card.dataset.japanStory === id);
    if (!card) return;
    event.preventDefault();
    history.replaceState(history.state, '', `#${card.id}`);
    jump(card,true);
  };
  root.addEventListener('click', clickPlace, { signal });
  map.addEventListener('click', clickPlace, { signal });
  toggle.addEventListener('click', () => { fullMap = !fullMap; resize(); }, { signal });
  window.addEventListener('scroll',schedule,{ passive:true, signal });
  window.addEventListener('scrollend',unlock,{ signal });
  window.addEventListener('resize',resize,{ signal });
  window.addEventListener('wheel',unlock,{ passive:true, signal });
  window.addEventListener('touchstart',unlock,{ passive:true, signal });
  window.addEventListener('keydown',event => { if (['ArrowDown','ArrowUp','PageDown','PageUp','Home','End',' '].includes(event.key)) unlock(); },{ signal });
  window.addEventListener('pageshow',schedule,{ signal });
  const restoreHash = () => {
    const card = cards.find(card => `#${card.id}` === location.hash);
    if (card) jump(card,false);
  };
  window.addEventListener('hashchange',restoreHash,{ signal });
  const observer = new IntersectionObserver(([entry]) => { visible = entry.isIntersecting; if (visible) schedule(); });
  observer.observe(root);
  const sizing = new ResizeObserver(resize);
  sizing.observe(handoff.dock);
  resize();
  // Reserve all image dimensions; wait one frame for the initial sticky offset.
  const restoreFrame = requestAnimationFrame(restoreHash);
  return () => { abort.abort(); observer.disconnect(); sizing.disconnect(); paint(''); handoff.cleanup(); cancelAnimationFrame(frame); cancelAnimationFrame(restoreFrame); clearTimeout(settle); };
}
