# miszori.dev

My personal website: one page with my projects, notes and a short about, plus a page per note. It is built with Astro and pre-rendered to static pages served from Cloudflare's edge, with no server code. The code was written with AI under my direction.

![Social preview of miszori.dev: the name Gergő Miszori in white on black](public/og-image.png)

[![License: MIT](https://img.shields.io/badge/license-MIT-blue.svg)](LICENSE)
![Astro](https://img.shields.io/badge/built%20with-Astro-BC52EE)
![TypeScript](https://img.shields.io/badge/language-TypeScript-3178C6)
![Cloudflare Workers](https://img.shields.io/badge/hosted%20on-Cloudflare%20Workers-F38020)

## Features

- **Projects and notes.** Each entry is a Markdown or MDX file in `src/content/`, with an optional cover image that has light and dark variants. Every project picks one colour from the brand palette (`color` in its frontmatter), which colours its sheet on the home page and its link preview.
- **Light and dark theme.** The theme follows the system setting and can be switched by hand. It keeps working when browser storage is blocked.
- **Fast static pages.** Every page is pre-rendered at build time and served as a static asset, so there is nothing to run or patch on a server.
- **Search and sharing ready.** Pages include a sitemap, structured data and a large social preview image. `pnpm brand-images` renders the previews (the site's and one per project) and the favicons from the brand font; run it after adding a project.
- **Old links keep working.** Legacy domains, the former `/en`, `/de` and `/hu` routes, and the old `/projects` pages redirect permanently to the current pages.

## Quick start

You need Node.js 22.12 or later and pnpm.

```bash
pnpm install
```

```bash
pnpm dev
```

Open http://localhost:4321.

Run the tests with:

```bash
pnpm test
```

It builds the site and runs the Node regression tests in [tests/site.test.mjs](tests/site.test.mjs). They cover the generated routes, social preview metadata, the 404 page, redirects, script delivery, security headers and theme storage failures. Type-check with `pnpm check`.

## How it works

```
Browser ─► Cloudflare edge ─► static assets (dist/)
```

| Directory | What |
|-----------|------|
| `src/pages/` | Routes: the home page, one page per note under `/notes/`, and the 404 page. |
| `src/content/` | Projects and notes, one folder per entry with its `index.md` and images. |
| `src/components/`, `src/layouts/` | Astro components and the shared page layout. |
| `src/styles/` | The brand's colour and type tokens. |
| `public/` | Files copied as they are: icons, the social preview images, the theme initializer, [`_headers`](public/_headers) and [`_redirects`](public/_redirects). |
| `scripts/` | [`brand-images.mjs`](scripts/brand-images.mjs), which generates the social preview images and favicons. |
| `tests/` | Node regression tests that run against the built site. |

## Deploying

The site is an assets-only Cloudflare Worker, configured in [wrangler.jsonc](wrangler.jsonc). It serves `miszori.dev`, and keeps `gergo.miszori.dev` attached so a Cloudflare Redirect Rule can send it to `miszori.dev`.

1. Sign in to Cloudflare with `pnpm wrangler login`.
2. Build and deploy:
   ```bash
   pnpm deploy
   ```

To update, run `pnpm deploy` again. There is no server state, so a deploy loses nothing.

## Security

- **Security headers on every response.** [public/_headers](public/_headers) sets HSTS, a strict Content Security Policy and framing protection. They also apply to the 404 page, because everything is a static asset.
- **No inline JavaScript.** The CSP blocks inline scripts and event handlers, base URL changes, embedded objects, framing and form submissions. Scripts are external files, and [the build configuration](astro.config.mjs) turns off asset inlining so this holds. Only Cloudflare Web Analytics is allowed from outside the site.
- **Escaped text.** Strings are rendered as escaped text, not raw HTML. Inline styles stay allowed because Markdown content and syntax highlighting need them.
- **Validated theme input.** The theme setting accepts only `light` or `dark`, so stored values can't inject anything.

Run `pnpm audit` after updating dependencies. A clean audit does not prove the site has no vulnerabilities. TypeScript is pinned to 5.x because `@astrojs/check` doesn't support TypeScript 7 yet.

## License

The code is [MIT](LICENSE). The content, images and visual design are all rights reserved; [LICENSE](LICENSE) lists exactly what that covers.
