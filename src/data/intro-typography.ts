// Pair adjustments from public/fonts/mondwest.woff2's GPOS kern feature.
// Inline-block animation spans cannot share the browser's text shaping, so
// preserve these pairs explicitly. Values are font units / 4096, in em.
export const INTRO_KERNING: Record<string, number> = {
  ey: -164 / 4096,
  'y,': -246 / 4096,
  ac: -82 / 4096,
  ch: -164 / 4096,
  sr: -82 / 4096,
};

export function introKerning(text: string, index: number) {
  const adjustment = INTRO_KERNING[text.slice(index - 1, index + 1)];
  return adjustment ? `margin-inline-start: ${adjustment}em` : undefined;
}
