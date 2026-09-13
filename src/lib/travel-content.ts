import { getCollection } from 'astro:content';
import { travelJournals, type JournalCountry } from '../data/travel-journals';

export async function getCountryStories(country: JournalCountry) {
  const journal = travelJournals[country];
  const entries = await getCollection('travel', entry => entry.data.country === country && !entry.data.draft);
  const seen = new Set<string>();
  for (const entry of entries) {
    if (seen.has(entry.data.place)) throw new Error(`Duplicate ${journal.name} story: ${entry.data.place}`);
    const photos = journal.photos[entry.data.place];
    if (!photos?.length || !photos[0].thumbnail) throw new Error(`Missing photographs or cover thumbnail for ${country}/${entry.data.place}`);
    seen.add(entry.data.place);
  }
  return journal.stops.flatMap(stop => {
    const story = entries.find(entry => entry.data.place === stop.id);
    return story ? [{ stop, story }] : [];
  });
}
