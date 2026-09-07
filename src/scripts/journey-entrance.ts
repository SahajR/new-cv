import { animate, frame, type AnimationSequence, type AnimationPlaybackControlsWithThen } from 'motion';

/* TIMELINE ENTRANCE STORYBOARD — after the last header image settles
 *    0ms   keep the timeline's layout reserved and its contents hidden
 *   80ms   fade downward from the lead-in rail; spring into position
 *  730ms   overall fade finishes while the soft reveal continues downward
 * 1180ms   the entire timeline is revealed; normal scrolling takes over
 */
const TIMING = {
  start: 80,    // A short breath after the images land.
  fade: 650,    // Soft opacity entrance.
  reveal: 1100, // Top-to-bottom feathered wipe.
};
const ENTRANCE = {
  offsetY: 20,
  revealEnd: '112%', // Carry the 12% feather fully beyond the bottom edge.
  spring: { type: 'spring' as const, stiffness: 180, damping: 22, mass: 1 },
};

export function enterJourney(root: HTMLElement, relayout: () => void) {
  const scene = root.closest('.hero')?.querySelector<HTMLElement>('[data-scene-entrance]');
  const intro = root.closest('.hero')?.querySelector<HTMLElement>('[data-intro]');
  // Scrolling past the introduction skips the remaining landing entrances.
  const bypassAt = Math.min(window.innerHeight * 0.5,
    intro ? intro.getBoundingClientRect().bottom + window.scrollY : Infinity);
  const reduced = window.matchMedia('(prefers-reduced-motion: reduce)');
  let playback: AnimationPlaybackControlsWithThen | undefined;
  let sceneObserver: MutationObserver | undefined;
  let completed = false;

  const clearStyles = () => {
    ['transform', 'opacity', '--journey-reveal'].forEach((property) => root.style.removeProperty(property));
  };
  const finish = () => {
    if (completed) return;
    completed = true;
    sceneObserver?.disconnect();
    playback?.stop();
    playback = undefined;
    root.dataset.journeyEntrance = 'complete';
    clearStyles();
    frame.postRender(() => {
      clearStyles();
      relayout();
    });
    window.removeEventListener('resize', finish);
    window.removeEventListener('pagehide', finish);
    window.removeEventListener('scroll', skipWhenReading);
    reduced.removeEventListener('change', finish);
    document.removeEventListener('visibilitychange', finishWhenHidden);
  };
  const finishWhenHidden = () => {
    if (document.hidden) finish();
  };
  const skipWhenReading = () => {
    // Anchor links and readers scrolling past the intro get the content now.
    if (window.scrollY >= bypassAt) finish();
  };

  if (reduced.matches || document.hidden || root.dataset.journeyEntrance !== 'boot'
    || window.scrollY >= bypassAt) {
    finish();
    return;
  }

  root.dataset.journeyEntrance = 'waiting';
  window.addEventListener('resize', finish);
  window.addEventListener('pagehide', finish);
  window.addEventListener('scroll', skipWhenReading, { passive: true });
  reduced.addEventListener('change', finish);
  document.addEventListener('visibilitychange', finishWhenHidden);

  const reveal = () => {
    if (completed || root.dataset.journeyEntrance !== 'waiting') return;
    if (scene && scene.dataset.sceneEntrance !== 'complete') return;
    sceneObserver?.disconnect();

    try {
      root.style.opacity = '0';
      root.style.transform = `translateY(${ENTRANCE.offsetY}px)`;
      root.style.setProperty('--journey-reveal', '0%');
      root.dataset.journeyEntrance = 'revealing';
      const at = TIMING.start / 1000;
      const sequence: AnimationSequence = [
        [root, { opacity: [0, 1] }, { at, duration: TIMING.fade / 1000, ease: 'easeOut' }],
        [root, { transform: [`translateY(${ENTRANCE.offsetY}px)`, 'translateY(0px)'] }, { at, ...ENTRANCE.spring }],
        [root, { '--journey-reveal': ['0%', ENTRANCE.revealEnd] }, { at, duration: TIMING.reveal / 1000, ease: 'linear' }],
      ];
      playback = animate(sequence);
      playback.then(finish);
    } catch {
      finish();
    }
  };

  if (scene) {
    sceneObserver = new MutationObserver(reveal);
    sceneObserver.observe(scene, { attributes: true, attributeFilter: ['data-scene-entrance'] });
  }
  reveal();
}
