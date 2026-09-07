import { animate, type AnimationSequence, type AnimationPlaybackControlsWithThen } from 'motion';
import { INTRO_KERNING } from '../data/intro-typography';

/* INTRO STORYBOARD — milliseconds after the title font is ready.
 *    0 ms  hey.sr holds; subtitle space is reserved but hidden
 *  700 ms  the dot gathers energy
 * 1000 ms  hey / s / r move into place; sr stays compact and unexpanded
 * 1300 ms  the square lands on the I's baseline and immediately grows upward
 * 1590 ms  the stem hands off to a compressed I
 * 1670 ms  the I springs open to its full width
 * 1920 ms  the apostrophe sweeps out; sr starts expanding at the same beat
 * 2470 ms  I'm is fully revealed
 * ~3050 ms all title springs settle, then the subtitle fades in
 * ~3550 ms the full introduction rests
 *
 * Motion owns playback, pausing and completion. Layout is measured
 * once before playback; the title and journey rail keep their reserved space.
 */
const TIMING = {
  hold: 1000,
  chargeLead: 300,
  seedStagger: 18,
  dotTravel: 300,
  dotStretch: 260,
  lineHold: 30,
  iHandoff: 80,
  dotFade: 220,
  iColor: 400,
  tailAfterI: 330,
  tailReveal: 550,
  commaDelay: 430,
  lastNameDelay: 120,
  letterStagger: 45,
  letterFade: 220,
  subtitleFade: 500,
};
const SPRINGS = {
  initials: { type: 'spring' as const, stiffness: 180, damping: 19, mass: 1 },
  letters: { type: 'spring' as const, stiffness: 240, damping: 20, mass: 0.85 },
  // A timed spring lets the stem settle before the letter takes over.
  stem: { type: 'spring' as const, duration: TIMING.dotStretch / 1000, bounce: 0.12 },
  iWidth: { type: 'spring' as const, stiffness: 430, damping: 35, mass: 0.9 },
  tail: { type: 'spring' as const, stiffness: 280, damping: 22, mass: 0.75 },
};
const MOTION = {
  ease: [0.16, 1, 0.3, 1] as const,
  travelEase: [0.45, 0, 0.2, 1] as const,
  fold: -78,
  initialScale: 0.38,
  dotCharge: 1.65,
};

const root = document.querySelector<HTMLElement>('[data-intro]');
const stage = root?.querySelector<HTMLElement>('[data-intro-stage]');
const subtitle = root?.querySelector<HTMLElement>('[data-intro-subtitle]');
const iGlyph = root?.querySelector<HTMLElement>('[data-intro-i]');
const baseline = root?.querySelector<HTMLElement>('[data-intro-baseline]');
const imTail = root?.querySelector<HTMLElement>('[data-intro-im-tail]');
const dot = root?.querySelector<HTMLElement>('[data-intro-dot]');
const core = root?.querySelector<HTMLElement>('[data-intro-core]');
const ring = root?.querySelector<HTMLElement>('[data-intro-ring]');

if (root && stage && subtitle && iGlyph && baseline && imTail && dot && core && ring) {
  const reduced = window.matchMedia('(prefers-reduced-motion: reduce)');
  const seeds = [...root.querySelectorAll<HTMLElement>('[data-seed]')];
  const letters = [...root.querySelectorAll<HTMLElement>('[data-unfold]')];
  const animatedElements = [...seeds, ...letters, iGlyph, imTail, dot, core, ring, subtitle];
  let playback: AnimationPlaybackControlsWithThen | undefined;
  let run = 0;
  let stageWidth = stage.clientWidth;
  let visible = true;
  let paused = false;

  const syncVisibility = () => {
    const shouldPause = document.hidden || !visible;
    if (!playback || shouldPause === paused) return;
    paused = shouldPause;
    if (paused) playback.pause();
    else playback.play();
  };

  const finish = () => {
    run++;
    playback?.stop();
    playback = undefined;
    paused = false;
    // Motion commits final styles. Clear the animated properties so CSS owns
    // the static fallback after completion or interruption.
    animatedElements.forEach((element) => {
      ['transform', 'opacity', 'clip-path', 'color'].forEach((property) => {
        element.style.removeProperty(property);
      });
    });
    root.dataset.introPhase = 'complete';
  };

  const play = (hold: number) => {
    finish();
    if (reduced.matches) return;
    const thisRun = run;
    root.dataset.introPhase = 'boot';
    stageWidth = stage.clientWidth;

    const originRects = new Map(
      [...root.querySelectorAll<HTMLElement>('[data-origin]')].map((el) => [el.dataset.origin!, el.getBoundingClientRect()])
    );
    const targets = new Map([...seeds, ...letters, iGlyph, baseline, imTail].map((el) => [el, el.getBoundingClientRect()]));
    const stageRect = stage.getBoundingClientRect();
    const dotRect = originRects.get('dot')!;
    const iRect = targets.get(iGlyph)!;
    const baselineRect = targets.get(baseline)!;
    const glyphStyle = getComputedStyle(iGlyph);
    const tracking = parseFloat(glyphStyle.letterSpacing) || 0;
    const srKerning = INTRO_KERNING.sr * parseFloat(glyphStyle.fontSize);
    const glyphWidth = iRect.width - tracking;
    const accent = getComputedStyle(root).getPropertyValue('--accent').trim();
    const ink = getComputedStyle(root).color;
    const at = (offset: number) => (hold + offset) / 1000;
    const stretchAt = TIMING.dotTravel;
    const iAt = stretchAt + TIMING.dotStretch + TIMING.lineHold;
    const tailAt = iAt + TIMING.tailAfterI;
    const namesAt = tailAt;
    const sequence: AnimationSequence = [
      { name: 'intro-start', at: at(0) },
      { name: 'apostrophe-reveal', at: at(tailAt) },
      { name: 'names-expand', at: at(namesAt) },
    ];
    const sRect = targets.get(seeds.find((el) => el.dataset.seed === 's')!)!;

    seeds.forEach((el, index) => {
      const from = originRects.get(el.dataset.seed!)!;
      const to = targets.get(el)!;
      const isR = el.dataset.seed === 'r';
      // Keep r beside s on the first line while the dot becomes I'm.
      const compact = isR
        ? `translate(${sRect.right + srKerning - to.left}px, ${sRect.top - to.top}px) scale(1)`
        : 'translate(0px, 0px) scale(1)';
      sequence.push([el, {
        transform: [
          `translate(${from.left - to.left}px, ${from.top - to.top}px) scale(${from.height / to.height})`,
          compact,
        ],
      }, { at: at(index * TIMING.seedStagger), ...SPRINGS.initials }]);
      if (isR) {
        sequence.push([el, { transform: [compact, 'translate(0px, 0px) scale(1)'] },
          { at: 'names-expand', ...SPRINGS.initials }]);
      }
    });

    // The square lands first, then immediately grows only upward.
    // Its bottom origin and measured cap height keep it on the text baseline.
    const size = dotRect.width;
    const sx = dotRect.left - stageRect.left;
    const sy = dotRect.top - stageRect.top;
    const tx = iRect.left + glyphWidth / 2 - stageRect.left - size / 2;
    const ty = baselineRect.bottom - stageRect.top - size;
    const lineWidth = Math.max(2, iRect.height * 0.045) / size;
    const lineHeight = baselineRect.height / size;
    const initialIWidth = lineWidth * size / glyphWidth;
    iGlyph.style.transformOrigin = `${glyphWidth / 2}px 100%`;
    dot.style.width = ring.style.width = `${size}px`;
    dot.style.height = ring.style.height = `${size}px`;
    const point = (x: number, y: number, xScale = 1, yScale = xScale) =>
      `translate(${x}px, ${y}px) scale(${xScale}, ${yScale})`;
    const landed = point(tx, ty);
    const stem = point(tx, ty, lineWidth, lineHeight);

    sequence.push(
      [core, { transform: ['scale(1)', `scale(${MOTION.dotCharge})`, 'scale(1)'] },
        { at: at(-TIMING.chargeLead), duration: TIMING.chargeLead / 1000, times: [0, 0.65, 1] }],
      [dot, { transform: [point(sx, sy), landed] },
        { at: at(0), duration: TIMING.dotTravel / 1000, ease: MOTION.travelEase }],
      [dot, { transform: [landed, stem] },
        { at: at(stretchAt), ...SPRINGS.stem }],
      [dot, { opacity: [1, 0] },
        { at: at(iAt), duration: TIMING.dotFade / 1000, ease: 'easeInOut' }],
      [ring, { transform: [point(sx, sy, 0.8), point(sx, sy, 7)], opacity: [0, 0.35, 0] },
        { at: at(0), duration: (stretchAt + TIMING.dotStretch) / 1000, opacity: { times: [0, 0.15, 1] } }],
      [iGlyph, { opacity: [0, 1] },
        { at: at(iAt), duration: TIMING.iHandoff / 1000, ease: 'linear' }],
      [iGlyph, { transform: [`scaleX(${initialIWidth})`, 'scaleX(1)'] },
        { at: at(iAt + TIMING.iHandoff), ...SPRINGS.iWidth }],
      [iGlyph, { color: [accent, ink] },
        { at: at(iAt + TIMING.iHandoff), duration: TIMING.iColor / 1000 }],
      [imTail, { transform: ['translateX(-0.18em)', 'translateX(0em)'] },
        { at: 'apostrophe-reveal', ...SPRINGS.tail }],
      [imTail, { clipPath: ['inset(0 100% 0 0)', 'inset(0 0% 0 0)'], opacity: [0, 1] },
        { at: 'apostrophe-reveal', duration: TIMING.tailReveal / 1000 }],
    );

    letters.forEach((el) => {
      const group = el.dataset.unfold!;
      const index = Number(el.dataset.index);
      const seed = seeds.find((seed) => seed.dataset.seed === (group === 'comma' ? 'y' : group))!;
      const from = targets.get(seed)!;
      const to = targets.get(el)!;
      const delay = group === 'comma' ? TIMING.commaDelay
        : namesAt + (group === 'r' ? TIMING.lastNameDelay : 0);
      const starts = at(delay + index * TIMING.letterStagger);
      sequence.push(
        [el, { transform: [
          `translate(${from.left - to.left}px, ${from.top - to.top}px) rotateY(${MOTION.fold}deg) scale(${MOTION.initialScale})`,
          'translate(0px, 0px) rotateY(0deg) scale(1)',
        ] }, { at: starts, ...SPRINGS.letters }],
        [el, { opacity: [0, 1] }, { at: starts, duration: TIMING.letterFade / 1000 }],
      );
    });

    // Phase labels share Motion's clock, so visibility pauses every beat together.
    const phaseEnd = hold + namesAt + TIMING.lastNameDelay
      + Math.max(...letters.map((el) => Number(el.dataset.index))) * TIMING.letterStagger + TIMING.letterFade;
    sequence.push([(time: number) => {
      if (run !== thisRun) return;
      const elapsed = time - hold;
      const phase = elapsed < 0 ? 'holding'
        : elapsed < TIMING.dotTravel ? 'morphing'
        : elapsed < iAt ? 'line'
        : elapsed < namesAt ? 'spelling' : 'names';
      if (root.dataset.introPhase !== phase) root.dataset.introPhase = phase;
    }, [0, phaseEnd], { at: 0, duration: phaseEnd / 1000, ease: 'linear' }]);

    // Sequences calculate their own duration from spring settling times.
    // Never cut off a spring just because a fixed completion timer expired.
    playback = animate(sequence, { defaultTransition: { ease: MOTION.ease } });
    root.dataset.introPhase = 'holding';
    playback.then(() => {
      if (run !== thisRun) return;
      // Wait for every title spring to finish, then hand playback to the fade.
      playback?.stop();
      root.dataset.introPhase = 'subtitle';
      paused = false;
      playback = animate(subtitle, { opacity: [0, 1] }, {
        duration: TIMING.subtitleFade / 1000,
        ease: 'easeOut',
      });
      playback.then(() => { if (run === thisRun) finish(); });
      syncVisibility();
    });
    syncVisibility();
  };

  const safePlay = (hold: number) => {
    try { play(hold); } catch { finish(); }
  };
  reduced.addEventListener('change', finish);
  new ResizeObserver(() => {
    if (stage.clientWidth !== stageWidth) finish();
    stageWidth = stage.clientWidth;
  }).observe(stage);
  document.addEventListener('visibilitychange', syncVisibility);
  window.addEventListener('resize', finish);
  new IntersectionObserver(([entry]) => {
    visible = entry.isIntersecting;
    syncVisibility();
  }).observe(root);
  window.addEventListener('pagehide', finish);
  document.fonts.ready.then(() => {
    requestAnimationFrame(() => safePlay(TIMING.hold));
  });
}
