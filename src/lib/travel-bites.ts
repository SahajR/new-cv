import { getCollection } from 'astro:content';
import { travelCountries } from '../data/travel';

export async function getPublishedBites() {
  const entries = await getCollection('bites');
  return entries.map(entry => {
    const [countrySlug, slug, ...rest] = entry.id.split('/');
    const country = travelCountries.find(country => country.slug === countrySlug);
    if (!country || !slug || rest.length || !/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(slug)) {
      throw new Error(`Invalid bite path: ${entry.id}. Use a country folder and a lowercase, hyphenated filename.`);
    }
    return {
      entry, country, slug,
      href: `/travel/${country.slug}/bites/${slug}/`,
      cardId: `bite-${slug}`,
      transitionName: `bite-${country.slug}-${slug}`,
    };
  }).filter(bite => !bite.entry.data.draft)
    .sort((a, b) => a.entry.data.order - b.entry.data.order || a.entry.id.localeCompare(b.entry.id));
}

export type TravelBite = Awaited<ReturnType<typeof getPublishedBites>>[number];
