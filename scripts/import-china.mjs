// Rebuild the selected China photos. Source folders and metadata remain private.
// Place groups are based on the supplied photo GPS and visual inspection; Timeline is not read.
import { execFileSync } from 'node:child_process';
import { readFile, writeFile, mkdir } from 'node:fs/promises';
import { resolve, parse } from 'node:path';
import { createHash } from 'node:crypto';
import sharp from 'sharp';

const root = resolve(import.meta.dirname, '..');
const input = resolve(root, 'travel_data');
const output = resolve(root, 'public/images/travel/china');
const selection = JSON.parse(await readFile(resolve(root, 'scripts/china-photo-selection.json'), 'utf8'));
const folders = ['china'];
const metadata = JSON.parse(execFileSync('exiftool', ['-json', '-n', '-DateTimeOriginal', '-OffsetTimeOriginal', '-GPSLatitude', '-GPSLongitude', '-ext', 'jpg', '-ext', 'png', '-ext', 'heic', ...folders.map(folder => resolve(input, folder))], { maxBuffer: 4 * 1024 * 1024 }).toString());
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
    let decodable = source;
    if (/\.heic$/i.test(source)) {
      // macOS ImageIO decodes iPhone HEIC files that the bundled Sharp cannot.
      // Hash the source so a changed original can never reuse an older conversion.
      const key = createHash('sha256').update(await readFile(source)).digest('hex').slice(0, 12);
      const cache = resolve(input, 'china-import/converted');
      await mkdir(cache, { recursive: true });
      decodable = resolve(cache, `${parse(source).name}-${key}.jpg`);
      try { await sharp(decodable).stats(); }
      catch {
        execFileSync('sips', ['-s', 'format', 'jpeg', source, '--out', decodable]);
        // ImageIO can return success without image pixels when sandboxed.
        // Verify before publishing; rerun with ImageIO access if this fails.
        await sharp(decodable).stats();
      }
    }
    const image = sharp(decodable).rotate();
    const result = await image.clone().resize({ width: 1440, height: 1440, fit: 'inside', withoutEnlargement: true }).webp({ quality: 80 }).toFile(resolve(output, `${id}.webp`));
    if (index === 0) await image.clone().resize({ width: 640, height: 640, fit: 'inside', withoutEnlargement: true }).webp({ quality: 78 }).toFile(resolve(output, `${id}-small.webp`));
    published[stop.slug].push({ src: `/images/travel/china/${id}.webp`, ...(index === 0 ? { thumbnail: `/images/travel/china/${id}-small.webp` } : {}), width: result.width, height: result.height, alt: photo.alt, capturedAt });
  }
}
await writeFile(resolve(root, 'src/data/china-photos.json'), JSON.stringify(published, null, 2)+'\n');
await mkdir(resolve(input, 'china-import'), { recursive: true });
await writeFile(resolve(input, 'china-import/metadata.json'), JSON.stringify(metadata, null, 2)+'\n');
console.log(`Inspected ${metadata.length} still images. Exported ${Object.values(published).flat().length} selected photographs across ${selection.length} places. Timeline and authored MDX were not changed.`);
