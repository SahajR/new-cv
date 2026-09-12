// Rebuild selected web photographs and a private, photo-scoped Timeline report.
// Requires ExifTool. Raw files and the report stay in ignored travel_data/.
import { execFileSync } from 'node:child_process';
import { readFile, writeFile, mkdir } from 'node:fs/promises';
import { resolve, basename } from 'node:path';
import sharp from 'sharp';

const root = resolve(import.meta.dirname, '..');
const input = resolve(root, 'travel_data/Photos-1-001');
const privateOutput = resolve(root, 'travel_data/japan-import');
const output = resolve(root, 'public/images/travel/japan');
const selection = JSON.parse(await readFile(resolve(root, 'scripts/japan-photo-selection.json'), 'utf8'));
const photos = JSON.parse(execFileSync('exiftool', ['-json', '-n', '-DateTimeOriginal', '-OffsetTimeOriginal', '-GPSLatitude', '-GPSLongitude', '-ext', 'jpg', input], { maxBuffer: 4 * 1024 * 1024 }).toString());
const captureTime = (p) => {
  if (!p.DateTimeOriginal || !p.OffsetTimeOriginal) throw new Error(`Missing capture date/offset: ${p.SourceFile}`);
  return new Date(p.DateTimeOriginal.replace(/^(\d{4}):(\d{2}):(\d{2}) /, '$1-$2-$3T') + p.OffsetTimeOriginal);
};
const photoByName = new Map(photos.map(p => [basename(p.SourceFile), p]));
const start = Math.min(...photos.map(p => +captureTime(p))) - 3600000;
const end = Math.max(...photos.map(p => +captureTime(p))) + 3600000;
const timeline = JSON.parse(await readFile(resolve(root, 'travel_data/timeline_from_2024.json'), 'utf8'));
const nearbyVisits = timeline.semanticSegments.filter(s => s.visit && +new Date(s.startTime) <= end && +new Date(s.endTime) >= start);
const distanceKm = (lat1, lon1, lat2, lon2) => {
  const rad = Math.PI / 180;
  const a = Math.sin((lat2-lat1)*rad/2)**2 + Math.cos(lat1*rad)*Math.cos(lat2*rad)*Math.sin((lon2-lon1)*rad/2)**2;
  return 6371 * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
};
const report = photos.map(p => ({
  file: basename(p.SourceFile), capturedAt: captureTime(p).toISOString(),
  coordinates: p.GPSLatitude === undefined ? null : [p.GPSLatitude, p.GPSLongitude],
  visits: nearbyVisits.filter(s => {
    if (p.GPSLatitude === undefined) return false;
    const coords = s.visit.topCandidate?.placeLocation?.latLng?.match(/-?\d+(?:\.\d+)?/g)?.map(Number);
    return coords?.length === 2 && distanceKm(p.GPSLatitude,p.GPSLongitude,...coords) < 1
      && +captureTime(p) >= +new Date(s.startTime)-900000 && +captureTime(p) <= +new Date(s.endTime)+900000;
  }).map(s => ({ start: s.startTime, end: s.endTime, candidate: s.visit.topCandidate })),
}));
await mkdir(privateOutput, { recursive: true });
await writeFile(resolve(privateOutput, 'matched-report.json'), JSON.stringify({ window: { start: new Date(start), end: new Date(end) }, photos: report }, null, 2));
await mkdir(output, { recursive: true });
const published = {};
for (const stop of selection) {
  published[stop.slug] = [];
  for (const [index, photo] of stop.photos.entries()) {
    const metadata = photoByName.get(photo.file);
    if (!metadata) throw new Error(`Photo not found: ${photo.file}`);
    const id = `${stop.slug}-${String(index+1).padStart(2,'0')}`;
    const image = sharp(metadata.SourceFile).rotate();
    const result = await image.clone().resize({ width: 1440, height: 1440, fit: 'inside', withoutEnlargement: true }).webp({ quality: 80 }).toFile(resolve(output, `${id}.webp`));
    if (index === 0) await image.clone().resize({ width: 640, height: 640, fit: 'inside', withoutEnlargement: true }).webp({ quality: 78 }).toFile(resolve(output, `${id}-small.webp`));
    published[stop.slug].push({ src: `/images/travel/japan/${id}.webp`, ...(index === 0 ? { thumbnail: `/images/travel/japan/${id}-small.webp` } : {}), width: result.width, height: result.height, alt: photo.alt, capturedAt: captureTime(metadata).toISOString() });
  }
}
await writeFile(resolve(root, 'src/data/japan-photos.json'), JSON.stringify(published, null, 2)+'\n');
console.log(`Indexed ${photos.length} photos; matched ${report.filter(p=>p.visits.length).length} by time AND location. Exported ${Object.values(published).flat().length} selected photos. Authored MDX was not changed.`);
