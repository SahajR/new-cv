/**
 * Photo albums shown as small inline card stacks (see <AlbumStack>).
 * Thumbnails are 240px square WebPs generated from raw_images/albums/.
 */
export const albums = {
  skydive: [
    '/albums/skydive/sky-0.webp',
    '/albums/skydive/sky-2.webp',
    '/albums/skydive/sky-3.webp',
    '/albums/skydive/sky-5.webp',
    '/albums/skydive/sky-6.webp',
  ],
  scuba: [
    '/albums/scuba/scuba-0.webp',
    '/albums/scuba/scuba-1.webp',
    '/albums/scuba/scuba-2.webp',
    '/albums/scuba/scuba-3.webp',
    '/albums/scuba/scuba-4.webp',
  ],
  mx: ['/albums/mx/mx-soon.webp', '/albums/mx/mx-other.webp'],
  eq: ['/albums/eq/eq-1.webp', '/albums/eq/eq-2.webp', '/albums/eq/eq-3.webp', '/albums/eq/eq-4.webp'],
};

export type AlbumKey = keyof typeof albums;
