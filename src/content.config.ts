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
    visited: z.string().regex(/^\d{4}-\d{2}-\d{2}$/).optional(),
    dateLabel: z.string().optional(),
    draft: z.boolean().default(true),
  }).refine(entry => travelJournals[entry.country].stops.some(stop => stop.id === entry.place), { message: 'Unknown landmark for this country', path: ['place'] }),
});
// Bites belong to a country through their folder, independently of map stops.
const bites = defineCollection({
  loader: glob({ pattern: '**/*.{md,mdx}', base: './src/content/bites' }),
  schema: ({ image }) => z.object({
    title: z.string().min(1),
    description: z.string().min(1),
    cover: image(),
    imageAlt: z.string().min(1),
    coverPosition: z.string().regex(/^(?:100|\d{1,2})% (?:100|\d{1,2})%$/).default('50% 50%'),
    order: z.number().int().nonnegative().default(0),
    draft: z.boolean().default(true),
  }),
});
const hobbies = defineCollection({
  loader: glob({ pattern: '**/*.{md,mdx}', base: './src/content/hobbies' }),
  schema: z.object({
    title: z.string().min(1),
    description: z.string().min(1),
    order: z.number().int().nonnegative(),
    album: z.string().min(1),
    illustration: z.string().startsWith('/images/hobbies/'),
    illustrationAlt: z.string().min(1),
    illustrationWidth: z.number().positive().default(1000),
    illustrationHeight: z.number().positive().default(667),
  }),
});
export const collections = { travel, bites, hobbies };
