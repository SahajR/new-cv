// Rebuild selected web photographs from the original and additional Japan folders.
// Timeline matching is optional (--match-timeline); normal imports read only photos.
import { execFileSync } from 'node:child_process';
import { readFile, writeFile, mkdir } from 'node:fs/promises';
import { resolve, relative, basename } from 'node:path';
import sharp from 'sharp';

const root = resolve(import.meta.dirname, '..');
const input = resolve(root, 'travel_data');
const originalPhotos = resolve(input, 'Photos-1-001');
const sourceFolders = [originalPhotos, resolve(input, 'more japan')];
const privateOutput = resolve(root, 'travel_data/japan-import');
const output = resolve(root, 'public/images/travel/japan');
const selection = JSON.parse(await readFile(resolve(root, 'scripts/japan-photo-selection.json'), 'utf8'));
const photos = JSON.parse(execFileSync('exiftool', ['-r', '-json', '-n', '-DateTimeOriginal', '-OffsetTimeOriginal', '-GPSLatitude', '-GPSLongitude', '-ext', 'jpg', ...sourceFolders], { maxBuffer: 4 * 1024 * 1024 }).toString());
const captureTime = (p) => {
  if (!/^\d{4}:\d{2}:\d{2} \d{2}:\d{2}:\d{2}$/.test(p.DateTimeOriginal ?? '') || !/^[+-]\d{2}:\d{2}$/.test(p.OffsetTimeOriginal ?? '')) throw new Error(`Missing or incomplete capture date/offset: ${p.SourceFile}`);
  return new Date(p.DateTimeOriginal.replace(/^(\d{4}):(\d{2}):(\d{2}) /, '$1-$2-$3T') + p.OffsetTimeOriginal);
};
const photoByPath = new Map(photos.map(p => [resolve(p.SourceFile), p]));
await mkdir(privateOutput, { recursive: true });
await writeFile(resolve(privateOutput, 'photo-index.json'), JSON.stringify(photos.map(p => ({ file: relative(input, p.SourceFile), capturedAt: captureTime(p).toISOString(), coordinates: p.GPSLatitude === undefined ? null : [p.GPSLatitude, p.GPSLongitude] })), null, 2));
let matched = null;
if (process.argv.includes('--match-timeline')) {
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
    file: relative(input, p.SourceFile), capturedAt: captureTime(p).toISOString(),
    coordinates: p.GPSLatitude === undefined ? null : [p.GPSLatitude, p.GPSLongitude],
    visits: nearbyVisits.filter(s => {
      if (p.GPSLatitude === undefined) return false;
      const coords = s.visit.topCandidate?.placeLocation?.latLng?.match(/-?\d+(?:\.\d+)?/g)?.map(Number);
      return coords?.length === 2 && distanceKm(p.GPSLatitude,p.GPSLongitude,...coords) < 1
        && +captureTime(p) >= +new Date(s.startTime)-900000 && +captureTime(p) <= +new Date(s.endTime)+900000;
    }).map(s => ({ start: s.startTime, end: s.endTime, candidate: s.visit.topCandidate })),
  }));
  await writeFile(resolve(privateOutput, 'matched-report.json'), JSON.stringify({ window: { start: new Date(start), end: new Date(end) }, photos: report }, null, 2));
  matched = report.filter(p => p.visits.length).length;
}
await mkdir(output, { recursive: true });
const published = {};
for (const stop of selection) {
  published[stop.slug] = [];
  for (const [index, photo] of stop.photos.entries()) {
    // Bare names remain compatible with the original selection; added photos use
    // travel_data-relative paths so identical camera filenames cannot collide.
    const source = resolve(photo.file === basename(photo.file) ? originalPhotos : input, photo.file);
    const metadata = photoByPath.get(source);
    if (!metadata) throw new Error(`Photo not found: ${photo.file}`);
    const id = `${stop.slug}-${String(index+1).padStart(2,'0')}`;
    const image = sharp(metadata.SourceFile).rotate();
    const result = await image.clone().resize({ width: 1440, height: 1440, fit: 'inside', withoutEnlargement: true }).webp({ quality: 80 }).toFile(resolve(output, `${id}.webp`));
    if (index === 0) await image.clone().resize({ width: 640, height: 640, fit: 'inside', withoutEnlargement: true }).webp({ quality: 78 }).toFile(resolve(output, `${id}-small.webp`));
    published[stop.slug].push({ src: `/images/travel/japan/${id}.webp`, ...(index === 0 ? { thumbnail: `/images/travel/japan/${id}-small.webp` } : {}), width: result.width, height: result.height, alt: photo.alt, capturedAt: captureTime(metadata).toISOString() });
  }
}
await writeFile(resolve(root, 'src/data/japan-photos.json'), JSON.stringify(published, null, 2)+'\n');
console.log(`Indexed ${photos.length} photos. Exported ${Object.values(published).flat().length} selected photos. ${matched === null ? 'Timeline was not read.' : `Matched ${matched} by time AND location.`} Authored MDX was not changed.`);
