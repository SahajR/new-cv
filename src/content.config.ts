import { defineCollection } from 'astro:content';
import { z } from 'astro/zod';
import { glob } from 'astro/loaders';
import { japanStops } from './data/japan';

const travel = defineCollection({
  loader: glob({ pattern: '**/*.mdx', base: './src/content/travel' }),
  schema: z.object({
    country: z.literal('japan'),
    place: z.string().refine(id => japanStops.some(stop => stop.id === id), 'Unknown Japan landmark'),
    title: z.string().min(1),
    caption: z.string().min(1),
    visited: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
    dateLabel: z.string().optional(),
    draft: z.boolean().default(true),
  }),
});
export const collections = { travel };
