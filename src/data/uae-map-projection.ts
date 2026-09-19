// One local equirectangular projection for the outline, street layers and POIs.
// Coordinates are public landmark positions, not inferred visit/photo GPS.
export function uaeMapPoint(latitude: number, longitude: number): readonly [number, number] {
  return [(longitude - 51.2) * 100 * Math.cos(24.3 * Math.PI / 180), (26.3 - latitude) * 100];
}

export const uaeDetailExtents = {
  'abu-dhabi': [24.2, 54.2, 24.65, 54.75],
  dubai: [24.7, 55.0, 25.4, 55.85],
  fujairah: [25.35, 56.15, 25.75, 56.55],
} as const;
export type UaeMapArea = keyof typeof uaeDetailExtents;
export function uaeDetailBounds(area: UaeMapArea): readonly [number, number, number, number] {
  const [south, west, north, east] = uaeDetailExtents[area];
  const [x, y] = uaeMapPoint(north, west);
  const [right, bottom] = uaeMapPoint(south, east);
  return [x, y, right - x, bottom - y];
}
