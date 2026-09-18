// Local equirectangular views tied to the existing painted overview. The base
// is illustrative; within each area, photo GPS and OSM share this projection.
const areas = {
  kansai: { origin: [34.6868694444444, 135.526169444444], anchor: [387, 254] },
  hiroshima: { origin: [34.3957083333333, 132.454080555556], anchor: [267, 249] },
  kamakura: { origin: [35.3166638888889, 139.5357], anchor: [584, 248] },
  fuji: { origin: [35.5230166666667, 138.745902777778], anchor: [548, 240] },
} as const;

export type JapanMapArea = keyof typeof areas;

export function japanMapPoint(area: JapanMapArea, latitude: number, longitude: number): readonly [number, number] {
  const { origin, anchor } = areas[area];
  return [
    anchor[0] + (longitude - origin[1]) * 50 * Math.cos(origin[0] * Math.PI / 180),
    anchor[1] - (latitude - origin[0]) * 50,
  ];
}

// General regional extents for the static OSM layers, not photo search areas.
export const japanDetailExtents = {
  kansai: [34.02, 135.15, 35.22, 136.05],
  hiroshima: [34.14, 132.12, 34.55, 132.67],
  kamakura: [35.22, 139.38, 35.39, 139.64],
  fuji: [35.39, 138.62, 35.60, 138.94],
} as const;

export function japanDetailBounds(area: JapanMapArea): readonly [number, number, number, number] {
  const [south, west, north, east] = japanDetailExtents[area];
  const [x, y] = japanMapPoint(area, north, west);
  const [right, bottom] = japanMapPoint(area, south, east);
  return [x, y, right - x, bottom - y];
}
