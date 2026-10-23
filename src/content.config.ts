import { defineCollection } from 'astro:content';
import { z } from 'astro/zod';
import { glob } from 'astro/loaders';

const projects = defineCollection({
  loader: glob({ pattern: '**/*.{md,mdx}', base: './src/content' }),
  schema: ({ image }) =>
    z.object({
      title: z.string(),
      date: z.coerce.date().optional(),
      desc: z.string().optional(),
      cover: image().optional(),
      coverLight: image().optional(),
      tags: z.array(z.string()).default([]),
      draft: z.boolean().default(false),
      type: z.enum(['note', 'project']).default('note'),
      url: z.string().url().optional(),
      repo: z.string().url().optional(),
      status: z.enum(['Live', 'In progress', 'Archived']).optional(),
      featured: z.boolean().default(false),
    }),
});

export const collections = { projects };
