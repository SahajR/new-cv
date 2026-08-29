/**
 * Scene objects — photographic cutouts placed around the content, in the
 * style of surya.website. Each section of the page gets its own array; the
 * <Scene> component turns an array into an absolutely-positioned layer that
 * covers that section.
 *
 * Coordinates are fractions of the section's box (0 = left/top edge,
 * 1 = right/bottom edge) and describe the object's CENTRE, so the same data
 * holds up across viewport widths. Values outside 0–1 deliberately bleed
 * off the edge.
 */
export interface SceneObject {
  id: string;
  src: string;
  /** Intrinsic pixel size of the source image — reserves space, avoids layout shift. */
  w: number;
  h: number;
  /** Empty string for purely decorative images (the layer is aria-hidden anyway). */
  alt: string;
  /** Horizontal anchor as a fraction of the section width (object centre). */
  x: number;
  /**
   * Vertical anchor: a fraction of the section height, or a CSS length string
   * (e.g. '320px') measured from the section's top. Use lengths for objects
   * that should stay near the top regardless of how tall the section grows.
   */
  y: number | string;
  /** Which edge `y` refers to. 'top' pins the image's top edge at `y`. Default 'center'. */
  anchor?: 'center' | 'top';
  /** Rendered width — use clamp()/vw so it scales with the viewport. */
  width: string;
  /** Degrees. */
  rotate?: number;
  /** Parallax strength. 0 = pinned to the page, 1 = moves the most. */
  depth?: number;
  z?: number;
  /** Overrides applied at ≤ 760px. Set `hidden: true` to drop the object on phones. */
  mobile?: Partial<Pick<SceneObject, 'x' | 'y' | 'width' | 'rotate'>> & { hidden?: boolean };
  /** Load eagerly (above the fold) or lazily. Defaults to lazy. */
  eager?: boolean;
}

export const headerScene: SceneObject[] = [
  {
    id: 'skydive-helmet',
    src: '/images/skydive-helmet.webp',
    w: 971,
    h: 960,
    alt: '',
    x: 0.19,
    y: '380px',
    width: 'clamp(150px, 22vw, 320px)',
    rotate: 12,
    depth: 0.55,
    z: 2,
    eager: true,
    mobile: { x: 0.1, y: '48px', width: '30vw', rotate: 10 },
  },
  {
    id: 'dive-watch',
    src: '/images/dive-watch.webp',
    w: 949,
    h: 1600,
    alt: '',
    x: 0.75,
    y: '530px',
    width: 'clamp(50px, 6.6vw, 96px)',
    rotate: 13,
    depth: 1,
    z: 3,
    eager: true,
    mobile: { x: 0.72, y: '150px', width: '12vw', rotate: 15 },
  },
  {
    id: 'action-camera',
    src: '/images/action-camera.webp',
    w: 1405,
    h: 1600,
    alt: '',
    x: 0.5,
    y: '0px',
    anchor: 'top', // flush with the top edge
    width: 'clamp(140px, 16.8vw, 252px)',
    rotate: 0,
    depth: 0.8,
    z: 2,
    eager: true,
    mobile: { x: 0.5, y: '0px', width: '31vw', rotate: 0 },
  },
  {
    id: 'dive-mask',
    src: '/images/dive-mask.webp',
    w: 998,
    h: 711,
    alt: '',
    x: 0.87,
    y: '325px',
    width: 'clamp(150px, 20vw, 300px)',
    rotate: -9,
    depth: 0.45,
    z: 1,
    eager: true,
    mobile: { x: 0.88, y: '50px', width: '30vw', rotate: -7 },
  },
];
