import { defineConfig } from 'astro/config';
import sitemap from '@astrojs/sitemap';

import mdx from '@astrojs/mdx';

export default defineConfig({
  site: 'https://miszori.dev',
  integrations: [sitemap(), mdx()],

  vite: {
    build: {
      assetsInlineLimit: 0,
    },
  },

  markdown: {
    shikiConfig: {
      theme: 'github-dark',
    },
  },
});
