import { getCollection } from 'astro:content';
import { japanStops } from '../data/japan';

export async function getJapanStories() {
  const entries = await getCollection('travel', entry => entry.data.country === 'japan' && !entry.data.draft);
  const seen = new Set<string>();
  for (const entry of entries) {
    if (seen.has(entry.data.place)) throw new Error(`Duplicate Japan story: ${entry.data.place}`);
    seen.add(entry.data.place);
  }
  return japanStops.flatMap(stop => {
    const story = entries.find(entry => entry.data.place === stop.id);
    return story ? [{ stop, story }] : [];
  });
}
