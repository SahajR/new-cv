// Run once to migrate the legacy albums; the built site has no sibling-repo dependency.
import { mkdir, writeFile } from 'node:fs/promises';
import { resolve } from 'node:path';
import sharp from 'sharp';

const legacy = resolve(process.argv[2] ?? '../is-me/public');
const albums = {
  'scuba-diving': { title: 'Scuba diving', files: ['scuba/scuba_0.JPG', 'scuba/scuba_1.png', 'scuba/scuba_2.jpg', 'scuba/scuba_3.png', 'scuba/scuba_4.JPG', 'scuba/scuba_5.png', 'scuba/scuba_6.png', 'scuba/scuba_7.JPG'] },
  skydiving: { title: 'Skydiving and wind tunneling', files: ['skydive/sky_2.png', 'skydive/sky_0.png', 'skydive/sky_3.png', 'skydive/sky_5.png', 'skydive/sky_6.png', 'skydive/sky_1.png', 'skydive/sky_8.png'] },
  equestrianism: { title: 'Horse riding', files: ['eq/eq_1.png', 'eq/eq_2.png', 'eq/eq_3.png', 'eq/eq_4.png', 'eq/eq_5.png'] },
  motocross: { title: 'Motocross', files: ['mx/mx_soon.png', resolve('raw_images/albums/mx/mx_other.png')] },
};
const manifest = {};
for (const [slug, album] of Object.entries(albums)) {
  const directory = `public/images/hobbies/${slug}`;
  await mkdir(directory, { recursive: true });
  manifest[slug] = [];
  for (const [index, file] of album.files.entries()) {
    const name = String(index + 1).padStart(2, '0');
    const source = resolve(legacy, file);
    const photo = await sharp(source).rotate().resize({ width: 1600, height: 1600, fit: 'inside', withoutEnlargement: true }).webp({ quality: 84 }).toFile(`${directory}/${name}.webp`);
    await sharp(source).rotate().resize({ width: 360, height: 360, fit: 'inside', withoutEnlargement: true }).webp({ quality: 78 }).toFile(`${directory}/${name}-small.webp`);
    manifest[slug].push({ src: `/images/hobbies/${slug}/${name}.webp`, thumbnail: `/images/hobbies/${slug}/${name}-small.webp`, width: photo.width, height: photo.height, alt: `${album.title} — photograph ${index + 1} from my album` });
  }
}
await writeFile('src/data/hobby-photos.json', `${JSON.stringify(manifest, null, 2)}\n`);
console.log(`Imported ${Object.values(manifest).flat().length} hobby photographs.`);
