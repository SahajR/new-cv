// Usage: node scripts/build-japan-details.mjs /tmp/sahaj-japan
// Reads <prefix>-<area>-osm.json exports. OSM contributors, ODbL.
// Geographic layers and photo markers share the same per-area projection.
import { readFile, writeFile } from 'node:fs/promises';
import { japanMapPoint, japanDetailBounds, japanDetailExtents } from '../src/data/japan-map-projection.ts';

const same = (a, b) => a.lat === b.lat && a.lon === b.lon;
function waterRings(members = []) {
  const rings = [];
  for (const role of ['outer', 'inner']) {
    const parts = members.filter(member => member.type === 'way' && (member.role || 'outer') === role && member.geometry?.length > 1).map(member => member.geometry);
    while (parts.length) {
      let ring = parts.pop();
      while (!same(ring[0], ring.at(-1))) {
        const next = parts.findIndex(part => same(part[0], ring.at(-1)) || same(part.at(-1), ring.at(-1)));
        if (next === -1) break;
        let part = parts.splice(next, 1)[0];
        if (!same(part[0], ring.at(-1))) part = part.toReversed();
        ring = [...ring, ...part.slice(1)];
      }
      if (same(ring[0], ring.at(-1))) rings.push(ring);
    }
  }
  return rings;
}

function simplify(points, tolerance) {
  if (points.length <= 2) return points;
  const [ax, ay] = points[0], [bx, by] = points.at(-1);
  const dx = bx - ax, dy = by - ay, length = dx * dx + dy * dy;
  let distance = 0, split = 0;
  for (let i = 1; i < points.length - 1; i++) {
    const [x, y] = points[i];
    const t = length ? Math.max(0, Math.min(1, ((x - ax) * dx + (y - ay) * dy) / length)) : 0;
    const d = Math.hypot(x - ax - t * dx, y - ay - t * dy);
    if (d > distance) { distance = d; split = i; }
  }
  return distance <= tolerance ? [points[0], points.at(-1)] : [
    ...simplify(points.slice(0, split + 1), tolerance).slice(0, -1),
    ...simplify(points.slice(split), tolerance),
  ];
}

for (const area of Object.keys(japanDetailExtents)) {
  const source = JSON.parse(await readFile(`${process.argv[2]}-${area}-osm.json`, 'utf8'));
  if (source.remark || !source.elements?.length) throw new Error(`Incomplete OSM data for ${area}: ${source.remark ?? 'empty response'}`);
  const [left, top, width, height] = japanDetailBounds(area);
  const local = area === 'fuji' || area === 'kamakura';
  const tolerance = local ? .003 : .012;
  const paths = { road: [], rail: [], water: [], river: [], coast: [] };
  const memberWays = new Set(source.elements.filter(feature => feature.type === 'relation').flatMap(feature => feature.members.filter(member => member.type === 'way').map(member => member.ref)));
  for (const feature of source.elements) {
    const { tags = {} } = feature;
    if (feature.type === 'way' && tags.natural === 'water' && memberWays.has(feature.id)) continue;
    // OSM lakes such as Kawaguchiko are often split across multiple ways.
    // Join their outer/inner rings so the lake and its islands remain visible.
    const geometries = feature.type === 'relation' ? waterRings(feature.members) : [feature.geometry ?? []];
    for (const geometry of geometries) {
      if (geometry.length < 2) continue;
      const points = geometry.map(({ lat, lon }) => {
        const [x, y] = japanMapPoint(area, lat, lon);
        return [x - left, y - top];
      });
      const kind = tags.natural === 'water' ? 'water' : tags.natural === 'coastline' ? 'coast' : tags.waterway ? 'river' : tags.railway ? 'rail' : 'road';
      const closed = points[0][0] === points.at(-1)[0] && points[0][1] === points.at(-1)[1];
      if (kind === 'water') {
        if (!closed) continue;
        const surface = Math.abs(points.reduce((sum, [x, y], i) => {
          const [nx, ny] = points[(i + 1) % points.length];
          return sum + x * ny - nx * y;
        }, 0)) / 2;
        if (surface < (local ? .001 : .02)) continue;
      }
      const simplified = simplify(points, tolerance);
      paths[kind].push('M' + simplified.map(([x, y]) => `${x.toFixed(4)},${y.toFixed(4)}`).join('L') + (closed ? 'Z' : ''));
    }
  }
  const factor = local ? .3 : 1;
  const styles = {
    road: `fill="none" stroke="#aaa17f" stroke-width="${.025 * factor}" stroke-opacity=".48"`,
    rail: `fill="none" stroke="#69715b" stroke-width="${.022 * factor}" stroke-opacity=".55"`,
    water: 'fill="#9fb7ac" fill-opacity=".58" fill-rule="evenodd" stroke="none"',
    river: `fill="none" stroke="#93b1a8" stroke-width="${.07 * factor}" stroke-opacity=".65"`,
    coast: `fill="none" stroke="#93b1a8" stroke-width="${.035 * factor}" stroke-opacity=".7"`,
  };
  let svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${width} ${height}">\n`;
  svg += '<!-- Map data © OpenStreetMap contributors, ODbL: https://www.openstreetmap.org/copyright -->\n';
  for (const [kind, features] of Object.entries(paths)) {
    svg += `<path ${styles[kind]} stroke-linecap="round" stroke-linejoin="round" d="${features.join('')}"/>\n`;
  }
  svg += '</svg>\n';
  await writeFile(new URL(`../public/images/travel/japan-map/${area}-detail.svg`, import.meta.url), svg);
  console.log(`${area}: ${Object.values(paths).flat().length} features, ${Math.round(svg.length / 1024)} KB`);
}
