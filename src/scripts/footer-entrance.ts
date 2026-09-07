import { animate, frame, type AnimationPlaybackControlsWithThen } from 'motion';

// After the title, subtitle and final header image settle, the dock fades in
// over 420ms while a spring carries it up 36px into its fixed resting position.
export function enterFooter(root: HTMLElement) {
  const intro = document.querySelector<HTMLElement>('[data-intro]');
  const scene = document.querySelector<HTMLElement>('.hero [data-scene-entrance]');
  const reduced = matchMedia('(prefers-reduced-motion: reduce)');
  const bypassAt = Math.min(window.innerHeight * 0.5,
    intro ? intro.getBoundingClientRect().bottom + window.scrollY : Infinity);
  let playback: AnimationPlaybackControlsWithThen | undefined;
  let headerObserver: MutationObserver | undefined;
  let completed = false;

  const clearStyles = () => {
    root.style.removeProperty('transform');
    root.style.removeProperty('opacity');
  };
  const finish = () => {
    if (completed) return;
    completed = true;
    headerObserver?.disconnect();
    playback?.stop();
    playback = undefined;
    root.dataset.footerEntrance = 'complete';
    // Release Motion's deferred styles too: no lingering animation or opacity
    // backdrop root should interfere with the glass after its entrance.
    clearStyles();
    frame.postRender(clearStyles);
    window.removeEventListener('resize', finish);
    window.removeEventListener('pagehide', finish);
    window.removeEventListener('scroll', skipWhenReading);
    document.removeEventListener('visibilitychange', finishWhenHidden);
    reduced.removeEventListener('change', finish);
    root.removeEventListener('focusin', finish);
  };
  const finishWhenHidden = () => {
    if (document.hidden) finish();
  };
  const skipWhenReading = () => {
    if (window.scrollY >= bypassAt) finish();
  };

  if (reduced.matches || document.hidden || root.dataset.footerEntrance !== 'boot'
    || window.scrollY >= bypassAt) {
    finish();
    return;
  }
  root.dataset.footerEntrance = 'waiting';
  window.addEventListener('resize', finish);
  window.addEventListener('pagehide', finish);
  window.addEventListener('scroll', skipWhenReading, { passive: true });
  document.addEventListener('visibilitychange', finishWhenHidden);
  reduced.addEventListener('change', finish);
  root.addEventListener('focusin', finish);

  const reveal = () => {
    if (completed || root.dataset.footerEntrance !== 'waiting') return;
    if (intro && intro.dataset.introPhase !== 'complete') return;
    if (scene && scene.dataset.sceneEntrance !== 'complete') return;
    headerObserver?.disconnect();
    try {
      root.style.opacity = '0';
      root.style.transform = 'translateY(36px)';
      root.dataset.footerEntrance = 'entering';
      playback = animate([
        [root, { opacity: [0, 1] }, { at: 0.08, duration: 0.42, ease: 'easeOut' }],
        [root, { transform: ['translateY(36px)', 'translateY(0px)'] }, {
          at: 0.08, type: 'spring', stiffness: 240, damping: 22, mass: 0.8,
        }],
      ]);
      playback.then(finish);
    } catch {
      finish();
    }
  };

  headerObserver = new MutationObserver(reveal);
  for (const element of [intro, scene]) {
    if (element) headerObserver.observe(element, {
      attributes: true,
      attributeFilter: ['data-intro-phase', 'data-scene-entrance'],
    });
  }
  reveal();
}
