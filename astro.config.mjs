import { defineConfig } from 'astro/config';
import sitemap from '@astrojs/sitemap';

import cloudflare from '@astrojs/cloudflare';

export default defineConfig({
  site: 'https://gergo.miszori.dev',
  integrations: [sitemap()],

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

  adapter: cloudflare(),
});