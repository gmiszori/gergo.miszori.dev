# gergo.miszori.dev

A lightweight, multilingual personal portfolio built with Astro.

## 🚀 Live Demo

- **Primary:** [https://gergo.miszori.dev](https://gergo.miszori.dev)
- **Legacy:** [https://gergo.miszori.hu](https://gergo.miszori.hu) _(redirects to primary)_

---

## 🛠️ Evolution & Architecture

The site originally started as a simple, hand-crafted static project built with vanilla **HTML, CSS, and JavaScript**.

To support scaling features, cleaner maintainability, and top-tier performance, the site underwent a complete architectural rebuild:

- **Framework Shift (Vanilla → Astro):** Rebuilt with Astro to enable component-driven UI, type-safe i18n routing (`en`, `de`, `hu`).
- **Edge Hosting (Cloudflare Workers):** Pre-rendered Astro pages are served as static assets through the Cloudflare adapter and Wrangler configuration.
- **Domain Rebrand:** Transitioned primary domain from `.hu` to `.dev` to better reflect a tech and software engineering focus.

---

## ⚡ Tech Stack

- **Framework:** [Astro v7](https://astro.build/)
- **Language:** TypeScript
- **Hosting:** [Cloudflare Workers](https://workers.cloudflare.com/)

---

## 💻 Local Development

```bash
# Install dependencies
pnpm install

# Start local development server
pnpm dev

# Build for production
pnpm build
```

## Security & Maintenance

- Security remediation updates Astro to 7.4.0, Sharp to 0.35.5, the Cloudflare adapter to 14.4.0, Wrangler to 4.151.1, and sitemap support to 3.7.4, within their existing major versions. The lockfile also refreshes vulnerable transitive packages (`js-yaml`, `svgo`, `undici`, `devalue`, `http-cache-semantics`, `source-map-js`, `smol-toml`, and `fast-uri`). Run `pnpm audit` to recheck current advisories; a clean audit is not proof that the application has no vulnerabilities.
- [Security headers](public/_headers) apply to Cloudflare-served static assets. Dynamically rendered Worker responses would need equivalent response headers.
- Executable scripts are external: [the synchronous theme initializer](public/theme-init.js) runs before rendering, and [the build configuration](astro.config.mjs) disables automatic asset inlining. The CSP disallows inline JavaScript and event handlers, base URL changes, embedded objects, framing, and form submissions. Cloudflare Web Analytics remains allowed.
- Inline styles remain allowed for Markdown content and syntax highlighting. Translation strings are rendered as escaped text rather than raw HTML.
- Theme selection accepts only `light` or `dark` and continues working if browser storage is unavailable.
- Locale navigation and localized routes use [the shared language map](src/i18n/ui.ts). Project pages share [UTC date formatting](src/utils/date.ts).
- Run `pnpm test` to build and run the Node regression tests in [tests/site.test.mjs](tests/site.test.mjs): generated routes, languages, single main landmarks, external script delivery, security headers, theme storage failures, and UTC date formatting. No additional test dependencies are required.
- `pnpm check` is currently blocked by the existing TypeScript 7 dependency: Astro's checker requires the programmatic API available in TypeScript 6.x.
