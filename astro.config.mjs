import { defineConfig } from 'astro/config';
import sitemap from '@astrojs/sitemap';

export default defineConfig({
  site: 'https://miszori.dev',
  integrations: [sitemap()],

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
