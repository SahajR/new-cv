import type * as React from 'react';

type Props = React.JSX.IntrinsicElements['svg'] & { side?: 'front' | 'back' };

/** The original, wide Game Boy Advance silhouette, readable at inline size. */
export function GameBoyAdvance({ side = 'front', ...props }: Props) {
  return (
    <svg {...props} xmlns="http://www.w3.org/2000/svg" width="64" height="40" fill="none" viewBox="0 0 64 40">
      <path d="M12 4h40c4 0 7 3 8 7l2 16c.7 6-3 10-8 9l-10-2H20l-10 2c-5 1-8.7-3-8-9l2-16c1-4 4-7 8-7Z" fill={side === 'front' ? '#8878bb' : '#7867a7'} stroke="#574777" strokeWidth="1.5" />
      <path d="M12 5h40" stroke="#bdb0df" strokeWidth="1.5" strokeLinecap="round" />
      {side === 'front' ? (
        <>
          <rect x="18" y="8" width="28" height="23" rx="3" fill="#302d3b" />
          <rect x="21" y="11" width="22" height="16" rx="1" fill="#bfccb1" />
          <path d="M21 22 34 11h9v3L28 27h-7Z" fill="#dce5d1" opacity=".45" />
          <path d="M8 14h4v4h4v4h-4v4H8v-4H4v-4h4Z" fill="#302d3b" />
          <circle cx="51" cy="22" r="2.5" fill="#302d3b" />
          <circle cx="57" cy="17" r="2.5" fill="#302d3b" />
          <path d="m9 30 3-1m2 2 3-1" stroke="#4f416f" strokeWidth="1.5" strokeLinecap="round" />
          <circle cx="49" cy="10" r="1" fill="#c9efaa" />
        </>
      ) : (
        <>
          <path d="M20 5h24v5H20Z" fill="#4f416f" />
          <rect x="20" y="15" width="24" height="17" rx="2" stroke="#554578" strokeWidth="1.5" />
          <path d="M28 18h8m-9 11h10" stroke="#ab9ace" strokeWidth="1.5" strokeLinecap="round" />
          <circle cx="10" cy="12" r="1.2" fill="#51416e" />
          <circle cx="54" cy="12" r="1.2" fill="#51416e" />
        </>
      )}
    </svg>
  );
}
