/**
 * Photo albums shown as small inline card stacks (see <AlbumStack>).
 * Paths are under /public. Empty arrays render placeholder cards until the
 * photos are added.
 */
export const albums = {
  skydive: [] as string[],
  scuba: [] as string[],
  mx: [] as string[],
  eq: [] as string[],
};

export type AlbumKey = keyof typeof albums;
