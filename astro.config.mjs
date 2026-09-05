import { defineConfig } from 'astro/config';
import sitemap from '@astrojs/sitemap';

import cloudflare from '@astrojs/cloudflare';

import mdx from '@astrojs/mdx';

export default defineConfig({
  site: 'https://gergo.miszori.dev',
  integrations: [sitemap(), mdx()],

  markdown: {
    shikiConfig: {
      theme: 'github-dark',
    },
  },

  i18n: {
    locales: ['en', 'de', 'hu'],
    defaultLocale: 'en',
    routing: {
      prefixDefaultLocale: false,
    },
  },

  adapter: cloudflare({
    imageService: 'compile',
  }),

  redirects: {
    '/hu/projects': '/projects',
    '/de/projects': '/projects',
    '/en/projects': '/projects',
    '/en': '/',
  },
});
