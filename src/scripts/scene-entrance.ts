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
  let playback: AnimationPlaybackControlsWithThen | undefined;
  let introObserver: MutationObserver | undefined;

  const finish = () => {
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
    reduced.removeEventListener('change', finish);
    document.removeEventListener('visibilitychange', syncVisibility);
  };

  const syncVisibility = () => {
    if (document.hidden) playback?.pause();
    else playback?.play();
  };

  if (reduced.matches || scene.dataset.sceneEntrance !== 'boot') {
    finish();
    return;
  }

  window.addEventListener('resize', finish);
  window.addEventListener('pagehide', finish);
  reduced.addEventListener('change', finish);
  document.addEventListener('visibilitychange', syncVisibility);

  // The module has loaded; keep the images hidden past the boot fallback
  // while Motion finishes the introduction, including any visibility pauses.
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
    if (scene.dataset.sceneEntrance !== 'waiting') return;
    // Restored scroll positions and anchor links should show the settled scene.
    if (window.scrollY > window.innerHeight * 0.5) {
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
      syncVisibility();
    } catch {
      finish();
    }
  });
}
