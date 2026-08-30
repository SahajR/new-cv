import { useEffect, useState } from 'react';
import { AnimatePresence, motion, useReducedMotion } from 'motion/react';

/**
 * A tiny inline stack of photo cards that cycles through an album — the
 * front card slides to the back every `intervalMs`. Sits inline with text.
 *
 * Ported from the previous site's PopupImage; images are plain <img> and
 * the optional `href` replaces the hard-coded section link.
 */

// Offset of each card peeking out behind the front one (0 = just behind).
const SHADOWS = [
  { rotate: 4, x: 4, y: 3, scale: 0.95 },
  { rotate: -3, x: -2, y: 6, scale: 0.9 },
];

const SIZE = 36;
const PLACEHOLDER_COUNT = 3;

interface AlbumStackProps {
  images: string[];
  /** Resting tilt of the whole stack, in degrees. */
  rotation?: number;
  intervalMs?: number;
  /** Where clicking the stack goes. Omit to render a non-link stack. */
  href?: string;
  label?: string;
}

export default function AlbumStack({
  images,
  rotation = -6,
  intervalMs = 2400,
  href,
  label = 'Photo album',
}: AlbumStackProps) {
  const reduced = useReducedMotion();
  const [idx, setIdx] = useState(0);
  const [hovered, setHovered] = useState(false);

  // Fall back to placeholder cards when the album has no photos yet.
  const n = images.length || PLACEHOLDER_COUNT;
  const srcAt = (i: number) => images[i % n];

  useEffect(() => {
    if (reduced || n <= 1) return;
    let interval: ReturnType<typeof setInterval> | undefined;
    // Random start offset so several stacks on one page don't flip in unison.
    const start = setTimeout(() => {
      interval = setInterval(() => {
        if (document.hidden) return; // don't churn in background tabs
        setIdx((i) => (i + 1) % n);
      }, intervalMs);
    }, Math.random() * intervalMs);
    return () => {
      clearTimeout(start);
      if (interval) clearInterval(interval);
    };
  }, [n, intervalMs, reduced]);

  const card = (src: string | undefined) =>
    src ? (
      <img src={src} alt="" draggable={false} className="album-img" />
    ) : (
      <span className="album-blank" aria-hidden="true" />
    );

  const Tag: 'a' | 'span' = href ? 'a' : 'span';

  return (
    <Tag
      href={href}
      aria-label={href ? label : undefined}
      className="album"
      style={{
        transform: `rotate(${hovered ? rotation * 0.5 : rotation}deg) scale(${hovered ? 1.1 : 1})`,
      }}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      onFocus={() => setHovered(true)}
      onBlur={() => setHovered(false)}
    >
      <span className="album-stack" style={{ width: SIZE, height: SIZE }}>
        {/* Cards peeking out behind the front card */}
        {SHADOWS.map((s, i) => (
          <span
            key={i}
            className="album-card album-card-back"
            style={{
              transform: `translate(${s.x}px, ${s.y}px) rotate(${s.rotate}deg) scale(${s.scale})`,
              zIndex: SHADOWS.length - i,
            }}
          >
            {card(srcAt(idx + i + 1))}
          </span>
        ))}

        {/* Front card — animates out as if being placed at the back */}
        <AnimatePresence initial={false} mode="sync">
          <motion.span
            key={idx}
            className="album-card album-card-front"
            initial={{
              scale: 0.88,
              rotate: SHADOWS[SHADOWS.length - 1].rotate,
              x: SHADOWS[SHADOWS.length - 1].x,
              y: SHADOWS[SHADOWS.length - 1].y,
              opacity: 0.6,
            }}
            animate={{ scale: 1, rotate: 0, x: 0, y: 0, opacity: 1 }}
            exit={{
              scale: 0.84,
              rotate: SHADOWS[SHADOWS.length - 1].rotate * 1.5,
              x: SHADOWS[SHADOWS.length - 1].x * 1.4,
              y: SHADOWS[SHADOWS.length - 1].y * 1.4,
              opacity: 0,
              transition: { duration: 0.26, ease: [0.4, 0, 0.8, 1] },
            }}
            transition={{ type: 'spring', stiffness: 380, damping: 30 }}
            style={{ zIndex: SHADOWS.length + 1 }}
          >
            {card(srcAt(idx))}
          </motion.span>
        </AnimatePresence>
      </span>
    </Tag>
  );
}
