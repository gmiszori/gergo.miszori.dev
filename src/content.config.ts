import { defineCollection } from 'astro:content';
import { z } from 'astro/zod';
import { glob } from 'astro/loaders';

// The brand's project palette; each project picks one (see the style artifact)
export const projectColors = [
  'blue',
  'orange',
  'violet',
  'teal',
  'green',
  'lime',
  'yellow',
  'pink',
] as const;

const projects = defineCollection({
  loader: glob({ pattern: '**/*.md', base: './src/content' }),
  schema: ({ image }) =>
    z
      .object({
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
        status: z.enum(['Live', 'Preview', 'In progress', 'Archived']).optional(),
        featured: z.boolean().default(false),
        color: z.enum(projectColors).optional(),
      })
      .refine((data) => data.type !== 'project' || data.color, {
        message: 'Every project needs a color from the brand palette',
        path: ['color'],
      }),
});

export const collections = { projects };
