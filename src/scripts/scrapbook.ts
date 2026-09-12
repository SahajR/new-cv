import { animate } from 'motion/mini';
import { spring, type AnimationPlaybackControls } from 'motion';
import { BookNavigation, clampPage } from './book-navigation';
import { BookAudio } from './book-audio';
import { createPageStack, leafPose, stackPose } from './book-stack';
import { prepareCountryJournal, replaceCountryJournal } from './country-journal';
import { travelCountries, countryFromPath, countryHref, BOOK_VISIT_KEY, BOOK_HANDOFF_KEY, type TravelCountry } from '../data/travel';

const readBookmark = () => {
  try { return clampPage(Number(sessionStorage.getItem(BOOK_VISIT_KEY)), travelCountries.length); }
  catch { return 0; }
};

export function setupScrapbook(root: HTMLElement) {
  if (root.dataset.ready) return;
  const volume = root.querySelector<HTMLElement>('[data-book-volume]')!;
  const stage = root.querySelector<HTMLElement>('[data-book-stage]')!;
  const arrival = root.querySelector<HTMLElement>('[data-book-arrival]')!;
  const leaves = [...root.querySelectorAll<HTMLElement>('[data-leaf]')];
  const board = root.querySelector<HTMLElement>('.sb-board-right')!;
  const faces = [...root.querySelectorAll<HTMLElement>('[data-face-page]')];
  const previous = root.querySelector<HTMLButtonElement>('[data-book-previous]')!;
  const next = root.querySelector<HTMLButtonElement>('[data-book-next]')!;
  const status = root.querySelector<HTMLElement>('[data-book-status]')!;
  const coverImage = root.querySelector<HTMLImageElement>('.sb-cover-art > img')!;
  const sound = new BookAudio();
  const unlockSound = (event: Event) => { if (event.isTrusted) sound.unlock(); };
  document.addEventListener('click', unlockSound, { capture: true });
  document.addEventListener('keydown', unlockSound, { capture: true });
  const reduced = matchMedia('(prefers-reduced-motion: reduce)');
  const journal = root.dataset.mode === 'journal';
  const index = root.dataset.mode === 'index';
  let inView = false;
  let revealed = document.documentElement.dataset.bookRevealing !== 'true';
  let pendingEntrance = true;
  let artworkReady = Number(root.dataset.position) > 0 || coverImage.complete;
  let controls: AnimationPlaybackControls[] = [];
  let routeTransition: ViewTransition | undefined;
  let navigationVersion = 0;
  let countryRequest: AbortController | undefined;
  let turns: string[] = [];
  let activeLeaf: HTMLElement | undefined;
  let activeStack: ReturnType<typeof createPageStack> | undefined;
  let pendingFocus = journal ? countryFromPath(location.pathname)?.page : undefined;

  function focusCountryTitle(position: number) {
    if (pendingFocus !== position || !inView || !revealed || document.hidden || root.dataset.turning === 'true') return;
    const title = root.querySelector<HTMLElement>(`[data-book-country-title="${position}"]`);
    if (!title || title.closest('[inert]')) return;
    pendingFocus = undefined;
    title.focus({ preventScroll: true });
  }

  function paint(position: number) {
    root.style.setProperty('--position', String(position));
    activeStack?.restore();
    activeStack = undefined;
    root.style.removeProperty('--paper-step');
    root.dataset.position = String(position);
    root.dataset.open = String(position > 0);
    root.dataset.turning = 'false';
    leaves.forEach((leaf) => { leaf.classList.remove('is-turning'); leaf.style.removeProperty('transform'); });
    activeLeaf = undefined;
    board.style.removeProperty('transform');
    volume.style.removeProperty('transform');
    faces.forEach((face) => {
      const visible = Number(face.dataset.facePage) === position;
      face.inert = !visible;
      face.setAttribute('aria-hidden', String(!visible));
    });
    previous.disabled = position <= 1;
    next.disabled = position === travelCountries.length;
    const country = travelCountries[Math.max(0, position - 1)];
    status.replaceChildren(document.createTextNode(position === 0 ? 'An adventure awaits' : country.name));
    const number = document.createElement('span');
    number.textContent = position === 0 ? '' : ` / ${String(position).padStart(2, '0')}—05`;
    status.append(number);
    root.querySelectorAll<HTMLElement>('[data-book-country]').forEach((link) => {
      if (Number(link.dataset.page) === position) link.setAttribute('aria-current', 'page');
      else link.removeAttribute('aria-current');
    });
    focusCountryTitle(position);
    // Don't overwrite the previous document's bookmark with a fresh closed cover.
    if (position > 0) {
      try { sessionStorage.setItem(BOOK_VISIT_KEY, String(position)); } catch { /* Optional persistence. */ }
    }
  }

  function paperStep() {
    const edge = leaves[0].querySelector<HTMLElement>('.sb-leaf-edge-fore')!;
    return parseFloat(getComputedStyle(edge).width);
  }

  async function turn(from: number, to: number) {
    root.dataset.turning = 'true';
    root.dataset.direction = to > from ? 'forward' : 'backward';
    const closing = index && to === 0;
    const bundled = (journal && from === 0) || closing;
    root.dataset.turnKind = bundled ? 'stack' : 'leaf';
    if (!reduced.matches) {
      const step = paperStep();
      root.style.setProperty('--paper-step', `${step}px`);
      const stackLeaves = bundled ? leaves.slice(0, Math.max(from, to)) : [];
      if (bundled) {
        activeStack = createPageStack(volume, stackLeaves, step);
        if (!closing) root.dataset.openingLeaves = String(to);
        faces.forEach((face) => { face.inert = true; face.setAttribute('aria-hidden', 'true'); });
      } else {
        activeLeaf = leaves[Math.min(from, to)];
        activeLeaf.classList.add('is-turning');
      }
      const coverTurn = from === 0 || to === 0;
      void sound.play(coverTurn).then((variant) => {
        if (variant === undefined) return;
        root.dataset.soundVariant = String(variant + 1);
        root.dataset.soundCount = String(Number(root.dataset.soundCount || 0) + 1);
      });
      const duration = closing ? .65 : bundled ? 1.05 : coverTurn ? .85 : .62;
      const animateLayer = (element: HTMLElement, start: string, end: string) => {
        element.style.transform = start;
        // Native Motion animations finish without a deferred style write, so
        // paint() can hand transforms back to the responsive resting CSS.
        return animate(element, { transform: [start, end] }, { type: spring, duration, bounce: .04 });
      };
      controls = [];
      if (activeStack) controls.push(animateLayer(activeStack.element, stackPose(from, step), stackPose(to, step)));
      // The remaining pages rise/sink by the same physical thickness as the
      // moving leaves. Every final pose matches its resting CSS exactly.
      leaves.forEach((leaf, i) => {
        if (!stackLeaves.includes(leaf)) controls.push(animateLayer(leaf, leafPose(from, i, step), leafPose(to, i, step)));
      });
      controls.push(animateLayer(board, `translateZ(${-(leaves.length - from) * step}px)`, `translateZ(${-(leaves.length - to) * step}px)`));
      if (coverTurn) {
        const pose = to === 0 ? 'translateX(-25%) rotateX(12deg) rotateZ(-5deg) scale(1.18)' : 'rotateX(8deg)';
        controls.push(animate(volume, { transform: [getComputedStyle(volume).transform, pose] }, { type: spring, duration, bounce: .04 }));
      }
      try { await Promise.all(controls.map((control) => control.finished)); }
      catch { /* An interrupted page still settles to a deterministic side. */ }
      controls = [];
    }
    turns.push(`${from}>${to}`);
    turns = turns.slice(-20);
    root.dataset.turns = turns.join(',');
  }

  const navigator = new BookNavigation(travelCountries.length, Number(root.dataset.position), turn, paint, { bundleOpening: journal, bundleClosing: index });
  const initialTarget = Number(root.dataset.target);
  paint(navigator.position);
  root.dataset.ready = 'true';

  const requestPage = (page: number) => {
    pendingEntrance = false;
    const target = clampPage(page, travelCountries.length);
    root.dataset.target = String(target);
    navigator.request(target);
    focusCountryTitle(navigator.position);
  };

  function syncPlayback() {
    const regionWindow = root.closest('[data-journey-window]');
    const windowOpen = !regionWindow || regionWindow.classList.contains('is-reached');
    const allowed = inView && !document.hidden && revealed && windowOpen && artworkReady;
    root.dataset.playback = allowed ? 'playing' : !inView ? 'offscreen' : document.hidden ? 'background' : !revealed ? 'transition' : !windowOpen ? 'window' : 'artwork';
    if (allowed) {
      if (root.dataset.arrival === 'waiting') root.dataset.arrival = 'landing';
      // CSS owns the drop, dust and settling rotation. Its animationend
      // releases the existing page controller only after the book lands.
      if (root.dataset.arrival === 'landing') return;
      controls.forEach((control) => control.play());
      navigator.resume();
      if (pendingEntrance) {
        pendingEntrance = false;
        requestPage(initialTarget);
      }
      focusCountryTitle(navigator.position);
    } else {
      navigator.pause();
      sound.stop();
      controls.forEach((control) => control.pause());
    }
  }

  arrival.addEventListener('animationend', (event) => {
    if (event.target !== arrival || event.animationName !== 'book-arrive') return;
    root.dataset.arrival = 'complete';
    syncPlayback();
  });

  function refreshVisibility() {
    // Shared-element snapshots can leave IntersectionObserver with the old
    // document's visibility. Refresh once when the live book is restored.
    const rect = stage.getBoundingClientRect();
    inView = rect.bottom > 0 && rect.top < innerHeight && rect.right > 0 && rect.left < innerWidth;
    observer.unobserve(stage);
    observer.observe(stage);
    syncPlayback();
  }

  function updateCountryContent(country: TravelCountry) {
    document.title = `${country.name} — Sahaj’s travel journal`;
    document.querySelector('meta[name="description"]')?.setAttribute('content', country.note);
    document.querySelector('meta[property="og:title"]')?.setAttribute('content', document.title);
    document.querySelector('meta[property="og:description"]')?.setAttribute('content', country.note);
  }

  async function navigateCountry(country: TravelCountry, historyMode: 'push' | 'pop' = 'push') {
    const version = ++navigationVersion;
    countryRequest?.abort();
    countryRequest = new AbortController();
    const request = countryRequest;
    let journalRegion: HTMLElement | undefined;
    root.setAttribute('aria-busy','true');
    try {
      journalRegion = await prepareCountryJournal(country.slug, request.signal);
    } catch {
      if (!request.signal.aborted) location.assign(countryHref(country));
      return;
    } finally {
      if (version === navigationVersion) root.removeAttribute('aria-busy');
    }
    if (version !== navigationVersion) return;
    pendingFocus = undefined;
    pendingEntrance = false;
    root.dataset.arrival = 'complete';
    routeTransition?.skipTransition();
    // A new route always starts from a complete leaf, even after a rapid click.
    navigator.pause();
    sound.stop();
    controls.forEach((control) => control.complete());
    await navigator.whenStepSettles();
    if (version !== navigationVersion) return;
    const update = () => {
      if (version !== navigationVersion) return;
      if (historyMode === 'push' && countryFromPath(location.pathname)?.slug !== country.slug) {
        history.pushState({ travelCountry: country.slug }, '', countryHref(country));
      }
      updateCountryContent(country);
      replaceCountryJournal(journalRegion);
    };
    if (document.startViewTransition && !reduced.matches) {
      const transition = document.startViewTransition(update);
      routeTransition = transition;
      void transition.ready.catch(() => {});
      try { await transition.finished; } catch { /* Normal navigation is the fallback. */ }
      finally { if (routeTransition === transition) routeTransition = undefined; }
    } else update();
    if (version !== navigationVersion) return;
    pendingFocus = country.page;
    requestPage(country.page);
    syncPlayback();
  }

  function saveHandoff(path: string) {
    try {
      sessionStorage.setItem(BOOK_HANDOFF_KEY, JSON.stringify({
        path: path.replace(/\/$/, ''), page: navigator.position, time: Date.now(),
      }));
    } catch { /* A normal direct-route opening still works. */ }
  }

  function takeHandoff() {
    try {
      const handoff = JSON.parse(sessionStorage.getItem(BOOK_HANDOFF_KEY) || 'null');
      sessionStorage.removeItem(BOOK_HANDOFF_KEY);
      if (handoff?.path === location.pathname.replace(/\/$/, '') && Date.now() - handoff.time < 15000
        && Number.isInteger(handoff.page) && handoff.page >= 0 && handoff.page <= travelCountries.length) return handoff.page as number;
    } catch { /* The cached document can keep its last settled position. */ }
  }

  root.addEventListener('click', (event) => {
    const target = event.target as Element;
    const previousButton = target.closest('[data-book-previous]');
    const nextButton = target.closest('[data-book-next]');
    if (target.closest('[data-book-open]')) {
      pendingEntrance = false;
      requestPage(initialTarget || 2);
      return;
    }
    if (previousButton || nextButton) {
      const page = Math.max(1, clampPage(navigator.target + (nextButton ? 1 : -1), travelCountries.length));
      if (journal) void navigateCountry(travelCountries[page - 1]);
      else requestPage(page);
      return;
    }
    const link = target.closest<HTMLAnchorElement>('a[data-book-country], a[data-book-read]');
    if (!link || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey || event.button !== 0) return;
    const url = new URL(link.href);
    const country = countryFromPath(url.pathname);
    if (url.pathname.replace(/\/$/, '') === '/travel') {
      saveHandoff(url.pathname);
      return;
    }
    if (!country) return;
    if (journal) {
      event.preventDefault();
      void navigateCountry(country);
    } else saveHandoff(url.pathname);
  });

  root.addEventListener('keydown', (event) => {
    if (index) return;
    if (event.key !== 'ArrowLeft' && event.key !== 'ArrowRight') return;
    if ((event.target as Element).closest('input, textarea, select, [data-japan-map]')) return;
    event.preventDefault();
    (event.key === 'ArrowRight' ? next : previous).click();
  });
  const homeLink = document.querySelector<HTMLAnchorElement>('[data-book-home]');
  homeLink?.addEventListener('click', (event) => {
    if (event.metaKey || event.ctrlKey || event.shiftKey || event.altKey || event.button !== 0) return;
    saveHandoff(new URL(homeLink.href).pathname);
  });
  window.addEventListener('popstate', () => {
    const country = countryFromPath(location.pathname);
    if (journal && country && document.querySelector<HTMLElement>('[data-country-journal]')?.dataset.countryJournal !== country.slug) void navigateCountry(country, 'pop');
  });
  window.addEventListener('pageswap', (event) => {
    const destination = event.activation?.entry?.url;
    if (destination) {
      const url = new URL(destination);
      if (url.origin === location.origin && (countryFromPath(url.pathname) || url.pathname === '/' || url.pathname.replace(/\/$/, '') === '/travel')) saveHandoff(url.pathname);
    }
  });
  window.addEventListener('pagehide', () => {
    root.dataset.playback = 'background';
    navigator.pause();
    sound.stop();
    controls.forEach((control) => control.pause());
  });
  window.addEventListener('pageshow', (event) => {
    if (event.persisted) {
      controls.forEach((control) => control.stop());
      controls = [];
      pendingFocus = journal ? countryFromPath(location.pathname)?.page : undefined;
      navigator.reset(takeHandoff() ?? (index ? navigator.position : readBookmark() || initialTarget));
      pendingEntrance = false;
      root.dataset.arrival = 'complete';
      const country = countryFromPath(location.pathname);
      if (journal && country) {
        updateCountryContent(country);
        requestPage(country.page);
      } else if (index) requestPage(0);
    }
    refreshVisibility();
  });
  window.addEventListener('book:revealed', () => { revealed = true; refreshVisibility(); });
  window.addEventListener('pagereveal', (event) => { revealed = !event.viewTransition; syncPlayback(); });
  document.addEventListener('visibilitychange', syncPlayback);
  reduced.addEventListener('change', () => {
    if (reduced.matches) {
      root.dataset.arrival = 'complete';
      controls.forEach((control) => control.complete());
      sound.stop();
    }
    syncPlayback();
  });

  const observer = new IntersectionObserver((entries) => {
    inView = entries[0].isIntersecting;
    if (inView && !reduced.matches) sound.prepare();
    syncPlayback();
  }, { threshold: .15 });
  observer.observe(stage);
  const regionWindow = root.closest('[data-journey-window]');
  if (regionWindow) new MutationObserver(syncPlayback).observe(regionWindow, { attributes: true, attributeFilter: ['class'] });
  if (!artworkReady) {
    void coverImage.decode().catch(() => {}).finally(() => { artworkReady = true; syncPlayback(); });
  }
}
