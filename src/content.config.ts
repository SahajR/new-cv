import { defineCollection } from 'astro:content';
import { z } from 'astro/zod';
import { glob } from 'astro/loaders';
import { journalCountries, travelJournals } from './data/travel-journals';

const travel = defineCollection({
  loader: glob({ pattern: '**/*.mdx', base: './src/content/travel' }),
  schema: z.object({
    country: z.enum(journalCountries),
    place: z.string().min(1),
    title: z.string().min(1),
    caption: z.string().min(1),
    visited: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
    dateLabel: z.string().optional(),
    draft: z.boolean().default(true),
  }).refine(entry => travelJournals[entry.country].stops.some(stop => stop.id === entry.place), { message: 'Unknown landmark for this country', path: ['place'] }),
});
export const collections = { travel };
