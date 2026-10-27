// Renders the brand's generated images into public/: the link previews
// (site + one per project) and the GM favicons and app icons.
// Run with `pnpm brand-images` after adding or renaming a project.
import { readFileSync, readdirSync, writeFileSync, mkdirSync } from 'node:fs';
import satori from 'satori';
import { Resvg } from '@resvg/resvg-js';

const root = new URL('../', import.meta.url);
const read = (path) => readFileSync(new URL(path, root));
const write = (path, data) => {
  writeFileSync(new URL(path, root), data);
  console.log(`wrote ${path}`);
};

const fontFile = (subset, weight) =>
  read(
    `node_modules/@fontsource/instrument-sans/files/instrument-sans-${subset}-${weight}-normal.woff`
  );
// latin-ext (ő) is a separate face: satori falls back to it for missing glyphs
const fonts = [600, 700].flatMap((weight) =>
  ['latin', 'latin-ext'].map((subset) => ({
    name: subset === 'latin' ? 'Instrument Sans' : 'Instrument Sans Ext',
    data: fontFile(subset, weight),
    weight,
    style: 'normal',
  }))
);

// Dark-theme ink of each project colour (tokens: <colour>-ink, dark)
const projectInk = {
  blue: '#8197ff',
  orange: '#ff9a4d',
  violet: '#a98bff',
  teal: '#3fd6e0',
  green: '#3ddc97',
  lime: '#b6f04a',
  yellow: '#ffd84d',
  pink: '#ff86a8',
};

const BLACK = '#000000';
const TILE = '#0a0a0a';
const WHITE = '#f5f5f5';
const GREY = '#a3a3a3';

const el = (type, style, children) => ({ type, props: { style, children } });

async function toSvg(node, width, height) {
  return satori(node, { width, height, fonts });
}

async function toPng(node, width, height) {
  const svg = await toSvg(node, width, height);
  return new Resvg(svg, { fitTo: { mode: 'width', value: width } })
    .render()
    .asPng();
}

// ---------------------------------------------------------------------------
// Link previews (1200×630, plain black)
// ---------------------------------------------------------------------------
const ogFrame = (children) =>
  el(
    'div',
    {
      // Satori sizes boxes without their padding: 1200×630 overall
      width: 1200 - 144,
      height: 630 - 144,
      display: 'flex',
      flexDirection: 'column',
      justifyContent: 'space-between',
      padding: 72,
      background: BLACK,
      fontFamily: 'Instrument Sans',
    },
    children
  );

const ogTop = (text) =>
  el('div', { fontSize: 30, fontWeight: 600, color: GREY }, text);

const siteOg = ogFrame([
  ogTop('miszori.dev'),
  el(
    'div',
    {
      display: 'flex',
      flexDirection: 'column',
      fontSize: 152,
      fontWeight: 700,
      letterSpacing: -6.8,
      lineHeight: 1,
      color: WHITE,
    },
    [el('div', {}, 'Gergő'), el('div', { marginTop: -21 }, 'Miszori')]
  ),
]);

const projectOg = (name, host, ink) =>
  ogFrame([
    ogTop(host),
    el('div', { display: 'flex', flexDirection: 'column' }, [
      el(
        'div',
        {
          fontSize: 184,
          fontWeight: 700,
          letterSpacing: -9.2,
          lineHeight: 1,
          color: ink,
        },
        name
      ),
      el(
        'div',
        { marginTop: 28, fontSize: 30, fontWeight: 600, color: GREY },
        'by miszori.dev'
      ),
    ]),
  ]);

// Projects come from the content collection's frontmatter
function readProjects() {
  const dir = new URL('src/content/', root);
  return readdirSync(dir, { withFileTypes: true })
    .filter((d) => d.isDirectory())
    .flatMap((d) => {
      let source;
      try {
        source = readFileSync(new URL(`${d.name}/index.md`, dir), 'utf8');
      } catch {
        return [];
      }
      const front = source.match(/^---\n([\s\S]*?)\n---/)?.[1] ?? '';
      const field = (key) =>
        front.match(new RegExp(`^${key}:\\s*['"]?([^'"\\n]+)['"]?`, 'm'))?.[1];
      if (field('type') !== 'project' || field('draft') === 'true') return [];
      return [{ id: d.name, title: field('title'), color: field('color') }];
    });
}

// ---------------------------------------------------------------------------
// GM tile: favicons (rounded) and app icons (full bleed for masking)
// ---------------------------------------------------------------------------
const gmTile = (size, { rounded, letters }) =>
  el(
    'div',
    {
      width: '100%',
      height: '100%',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      background: TILE,
      borderRadius: rounded ? Math.round(size * 0.22) : 0,
      color: '#ffffff',
      fontFamily: 'Instrument Sans',
      fontWeight: 700,
      fontSize: Math.round(size * letters),
      letterSpacing: -size * letters * 0.06,
    },
    'GM'
  );

// A .ico that wraps PNG images (supported by every current browser)
function icoFromPngs(entries) {
  const header = Buffer.alloc(6);
  header.writeUInt16LE(0, 0);
  header.writeUInt16LE(1, 2);
  header.writeUInt16LE(entries.length, 4);
  let offset = 6 + 16 * entries.length;
  const dirs = entries.map(({ size, png }) => {
    const dir = Buffer.alloc(16);
    dir.writeUInt8(size >= 256 ? 0 : size, 0);
    dir.writeUInt8(size >= 256 ? 0 : size, 1);
    dir.writeUInt16LE(1, 4);
    dir.writeUInt16LE(32, 6);
    dir.writeUInt32LE(png.length, 8);
    dir.writeUInt32LE(offset, 12);
    offset += png.length;
    return dir;
  });
  return Buffer.concat([header, ...dirs, ...entries.map((e) => e.png)]);
}

// ---------------------------------------------------------------------------
write('public/og-image.png', await toPng(siteOg, 1200, 630));

mkdirSync(new URL('public/og/', root), { recursive: true });
for (const project of readProjects()) {
  const ink = projectInk[project.color];
  if (!ink) throw new Error(`${project.id}: unknown color "${project.color}"`);
  const name = project.title.replace(/\.miszori\.dev$/, '');
  write(
    `public/og/${project.id}.png`,
    await toPng(projectOg(name, project.title, ink), 1200, 630)
  );
}

const favicon = (size) => gmTile(size, { rounded: true, letters: 0.44 });
write('public/favicon.svg', await toSvg(favicon(64), 64, 64));
write('public/favicon.png', await toPng(favicon(48), 48, 48));
write('public/favicon-96x96.png', await toPng(favicon(96), 96, 96));
write(
  'public/favicon.ico',
  icoFromPngs(
    await Promise.all(
      [32, 48].map(async (size) => ({
        size,
        png: await toPng(favicon(size), size, size),
      }))
    )
  )
);

// iOS rounds the corners itself; maskable icons keep the letters in the safe zone
write(
  'public/apple-touch-icon.png',
  await toPng(gmTile(180, { rounded: false, letters: 0.42 }), 180, 180)
);
for (const size of [192, 512]) {
  write(
    `public/web-app-manifest-${size}x${size}.png`,
    await toPng(gmTile(size, { rounded: false, letters: 0.32 }), size, size)
  );
}
