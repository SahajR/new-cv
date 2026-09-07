import { animate, frame, type AnimationSequence, type AnimationPlaybackControlsWithThen } from 'motion';

/* ─────────────────────────────────────────────────────────
 * HEADER ENTRANCE STORYBOARD — after the full hey.sr reveal
 *
 *          wait for the title/subtitle to finish and images to decode
 *    0ms   place every object completely outside the viewport
 *  100ms   camera drops in from above
 *  200ms   helmet slides in from the left
 *  300ms   mask slides in from the right
 *  400ms   shark follows from the left
 *  500ms   watch follows from the right; all springs settle
 * ───────────────────────────────────────────────────────── */
const TIMING = {
  start: 100,    // First object starts moving.
  stagger: 100, // Space between the following entrances.
};

const ENTRANCE = {
  clearance: 100, // Extra room for the photographs' soft shadows.
  spring: { type: 'spring' as const, stiffness: 135, damping: 18, mass: 1 },
  objects: [
    { id: 'action-camera', edge: 'top' },
    { id: 'skydive-helmet', edge: 'left' },
    { id: 'dive-mask', edge: 'right' },
    { id: 'shark', edge: 'left' },
    { id: 'dive-watch', edge: 'right' },
  ],
};

export function enterScene(scene: HTMLElement) {
  const reduced = window.matchMedia('(prefers-reduced-motion: reduce)');
  const flights = Array.from(scene.querySelectorAll<HTMLElement>('.scene-flight'));
  const images = Array.from(scene.querySelectorAll<HTMLImageElement>('img'));
  const intro = scene.parentElement?.querySelector<HTMLElement>('[data-intro]');
  const bypassAt = Math.min(window.innerHeight * 0.5,
    intro ? intro.getBoundingClientRect().bottom + window.scrollY : Infinity);
  let playback: AnimationPlaybackControlsWithThen | undefined;
  let introObserver: MutationObserver | undefined;
  let completed = false;

  const finish = () => {
    if (completed) return;
    completed = true;
    introObserver?.disconnect();
    playback?.stop();
    playback = undefined;
    const clearTransforms = () => flights.forEach((el) => el.style.removeProperty('transform'));
    clearTransforms();
    // Motion can commit a final value on its next render, including on resize.
    frame.postRender(clearTransforms);
    scene.dataset.sceneEntrance = 'complete';
    window.removeEventListener('resize', finish);
    window.removeEventListener('pagehide', finish);
    window.removeEventListener('scroll', finishWhenReading);
    reduced.removeEventListener('change', finish);
    document.removeEventListener('visibilitychange', finishWhenHidden);
  };

  const finishWhenHidden = () => {
    if (document.hidden) finish();
  };
  const finishWhenReading = () => {
    if (window.scrollY >= bypassAt) finish();
  };

  if (reduced.matches || document.hidden || scene.dataset.sceneEntrance !== 'boot'
    || window.scrollY >= bypassAt) {
    finish();
    return;
  }

  window.addEventListener('resize', finish);
  window.addEventListener('pagehide', finish);
  window.addEventListener('scroll', finishWhenReading, { passive: true });
  reduced.addEventListener('change', finish);
  document.addEventListener('visibilitychange', finishWhenHidden);

  // The module has loaded; keep the images hidden past the boot fallback
  // while Motion finishes the introduction.
  scene.dataset.sceneEntrance = 'waiting';
  const introReady = new Promise<void>((resolve) => {
    if (!intro || intro.dataset.introPhase === 'complete') {
      resolve();
      return;
    }
    introObserver = new MutationObserver(() => {
      if (intro.dataset.introPhase !== 'complete') return;
      introObserver?.disconnect();
      resolve();
    });
    introObserver.observe(intro, { attributes: true, attributeFilter: ['data-intro-phase'] });
  });

  // Intrinsic image dimensions reserve the landing positions; decode first
  // so slow image loads cannot pop into the middle of an entrance.
  Promise.all([introReady, Promise.allSettled(images.map((img) => img.decode()))]).then(() => {
    if (completed || scene.dataset.sceneEntrance !== 'waiting') return;
    // Restored scroll positions and anchor links should show the settled scene.
    if (window.scrollY >= bypassAt) {
      finish();
      return;
    }

    try {
      const sequence: AnimationSequence = [];
      for (const [index, object] of ENTRANCE.objects.entries()) {
        const flight = scene.querySelector<HTMLElement>(`[data-id="${object.id}"] .scene-flight`);
        const img = flight?.querySelector('img');
        if (!flight || !img || !img.getClientRects().length) continue;

        const rect = img.getBoundingClientRect();
        const x = object.edge === 'left' ? -rect.right - ENTRANCE.clearance
          : object.edge === 'right' ? window.innerWidth - rect.left + ENTRANCE.clearance : 0;
        const y = object.edge === 'top' ? -rect.bottom - ENTRANCE.clearance : 0;
        const origin = `translate3d(${x}px, ${y}px, 0)`;
        flight.style.transform = origin;
        sequence.push([flight, { transform: [origin, 'translate3d(0px, 0px, 0)'] }, {
          ...ENTRANCE.spring,
          at: (TIMING.start + index * TIMING.stagger) / 1000,
        }]);
      }

      if (!sequence.length) {
        finish();
        return;
      }
      scene.dataset.sceneEntrance = 'entering';
      playback = animate(sequence);
      playback.then(finish);
    } catch {
      finish();
    }
  });
}
