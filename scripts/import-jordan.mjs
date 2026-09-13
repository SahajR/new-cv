// Rebuild the selected Jordan photos. Source folders and metadata remain private.
// The supplied Timeline begins in 2024; these photographs are from 2023.
import { execFileSync } from 'node:child_process';
import { readFile, writeFile, mkdir } from 'node:fs/promises';
import { resolve } from 'node:path';
import sharp from 'sharp';

const root = resolve(import.meta.dirname, '..');
const input = resolve(root, 'travel_data');
const output = resolve(root, 'public/images/travel/jordan');
const selection = JSON.parse(await readFile(resolve(root, 'scripts/jordan-photo-selection.json'), 'utf8'));
const folders = ['amman', 'jordan', 'wadi_rum', 'aqaba', 'dead_sea'];
const metadata = JSON.parse(execFileSync('exiftool', ['-json', '-n', '-DateTimeOriginal', '-OffsetTimeOriginal', '-GPSLatitude', '-GPSLongitude', '-ext', 'jpg', '-ext', 'png', ...folders.map(folder => resolve(input, folder))], { maxBuffer: 4 * 1024 * 1024 }).toString());
const byPath = new Map(metadata.map(photo => [photo.SourceFile, photo]));
const published = {};
await mkdir(output, { recursive: true });
for (const stop of selection) {
  published[stop.slug] = [];
  for (const [index, photo] of stop.photos.entries()) {
    const source = resolve(input, photo.file);
    const meta = byPath.get(source);
    if (!meta || !/^\d{4}:\d{2}:\d{2} \d{2}:\d{2}:\d{2}$/.test(meta.DateTimeOriginal ?? '') || !/^[+-]\d{2}:\d{2}$/.test(meta.OffsetTimeOriginal ?? '')) throw new Error(`Missing or incomplete capture metadata: ${photo.file}`);
    const capturedAt = new Date(meta.DateTimeOriginal.replace(/^(\d{4}):(\d{2}):(\d{2}) /, '$1-$2-$3T') + meta.OffsetTimeOriginal).toISOString();
    const id = `${stop.slug}-${String(index+1).padStart(2, '0')}`;
    const image = sharp(source).rotate();
    const result = await image.clone().resize({ width: 1440, height: 1440, fit: 'inside', withoutEnlargement: true }).webp({ quality: 80 }).toFile(resolve(output, `${id}.webp`));
    if (index === 0) await image.clone().resize({ width: 640, height: 640, fit: 'inside', withoutEnlargement: true }).webp({ quality: 78 }).toFile(resolve(output, `${id}-small.webp`));
    published[stop.slug].push({ src: `/images/travel/jordan/${id}.webp`, ...(index === 0 ? { thumbnail: `/images/travel/jordan/${id}-small.webp` } : {}), width: result.width, height: result.height, alt: photo.alt, capturedAt });
  }
}
await writeFile(resolve(root, 'src/data/jordan-photos.json'), JSON.stringify(published, null, 2)+'\n');
await mkdir(resolve(input, 'jordan-import'), { recursive: true });
await writeFile(resolve(input, 'jordan-import/metadata.json'), JSON.stringify(metadata, null, 2)+'\n');
console.log(`Inspected ${metadata.length} still images. Exported ${Object.values(published).flat().length} selected photographs across ${selection.length} places. Timeline and authored MDX were not changed.`);
