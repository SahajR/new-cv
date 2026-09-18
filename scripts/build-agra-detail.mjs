// Usage: node scripts/build-agra-detail.mjs /path/to/agra-osm.json
// OpenStreetMap contributors, ODbL. Same LCC projection as the India outline.
import { readFile, writeFile } from 'node:fs/promises';
import { indiaMapPoint } from '../src/data/india-map-projection.ts';

const paths = { water: [], river: [], canal: [], road: [] };
for (const feature of JSON.parse(await readFile(process.argv[2], 'utf8')).elements) {
  const { geometry = [], tags = {} } = feature;
  if (geometry.length < 2) continue;
  const points = geometry.map(({ lat, lon }) => {
    const [x, y] = indiaMapPoint(lat, lon);
    return [x - 128.4, y - 124.1];
  });
  const closed = feature.nodes?.[0] === feature.nodes?.at(-1);
  const kind = tags.natural === 'water' ? 'water' : tags.waterway === 'river' ? 'river' : tags.waterway ? 'canal' : 'road';
  if (kind === 'water' && !closed) continue;
  paths[kind].push('M' + points.map(([x, y]) => `${x.toFixed(5)},${y.toFixed(5)}`).join('L') + (closed ? 'Z' : ''));
}
const styles = {
  water: 'fill="#9fb7ac" fill-opacity=".58" stroke="none"',
  river: 'fill="none" stroke="#93b1a8" stroke-width=".024" stroke-opacity=".6"',
  canal: 'fill="none" stroke="#93b1a8" stroke-width=".0035" stroke-opacity=".6"',
  road: 'fill="none" stroke="#aaa17f" stroke-width=".0013" stroke-opacity=".5"',
};
let svg = '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1.5 1.7">\n';
svg += '<!-- Map data © OpenStreetMap contributors, ODbL: https://www.openstreetmap.org/copyright -->\n';
for (const kind of ['road', 'water', 'river', 'canal']) {
  svg += `<path ${styles[kind]} stroke-linecap="round" stroke-linejoin="round" d="${paths[kind].join('')}"/>\n`;
}
svg += '</svg>\n';
await writeFile(new URL('../public/images/travel/india-map/agra-detail.svg', import.meta.url), svg);
console.log(`${Object.values(paths).flat().length} features; ${svg.length.toLocaleString()} SVG bytes`);
