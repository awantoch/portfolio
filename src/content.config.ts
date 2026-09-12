import { defineCollection } from 'astro:content';
import { glob } from 'astro/loaders';
import { z } from 'astro/zod';

const journal = defineCollection({
  loader: glob({ pattern: '**/*.mdx', base: './src/content/journal' }),
  schema: z.object({
    title: z.string(),
    publishedAt: z.string().refine((value) => !Number.isNaN(Date.parse(value)), {
      message: 'publishedAt must be a valid date',
    }),
    summary: z.string(),
    image: z.string().optional(),
    draft: z.boolean().default(false),
  }),
});

export const collections = { journal };
