import projection from './india-map-projection.json' with { type: 'json' };

// Survey of India's native LCC WGS84 projection. Keeping this projection for
// both the artwork guide and city detail makes each photo's GPS line up.
const radians = Math.PI / 180;
const a = 6378137;
const flattening = 1 / 298.257223563;
const e = Math.sqrt(flattening * (2 - flattening));
const m = (latitude: number) => Math.cos(latitude) / Math.sqrt(1 - e * e * Math.sin(latitude) ** 2);
const t = (latitude: number) => Math.tan(Math.PI / 4 - latitude / 2) / ((1 - e * Math.sin(latitude)) / (1 + e * Math.sin(latitude))) ** (e / 2);
const first = 12.472944 * radians, second = 35.172806 * radians;
const n = Math.log(m(first) / m(second)) / Math.log(t(first) / t(second));
const F = m(first) / (n * t(first) ** n);
const origin = a * F * t(24 * radians) ** n;

export function indiaMapPoint(latitude: number, longitude: number): readonly [number, number] {
  const rho = a * F * t(latitude * radians) ** n;
  const theta = n * (longitude - 80) * radians;
  const easting = 4000000 + rho * Math.sin(theta);
  const northing = 4000000 + origin - rho * Math.cos(theta);
  return [
    projection.offset[0] + (easting - projection.west) * projection.unitsPerMeter,
    projection.offset[1] + (projection.north - northing) * projection.unitsPerMeter,
  ];
}
