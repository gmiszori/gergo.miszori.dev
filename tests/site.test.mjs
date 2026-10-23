import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { test } from 'node:test';
import { runInNewContext } from 'node:vm';
import { formatProjectDate } from '../src/utils/date.ts';

const output = new URL('../dist/', import.meta.url);
const readOutput = (path) => readFileSync(new URL(path, output), 'utf8');
const pages = [
  ['index.html', 'en', 'Gergő Miszori'],
  ['de/index.html', 'de', 'Gergő Miszori'],
  ['hu/index.html', 'hu', 'Miszori Gergő'],
  ['projects/index.html', 'en', 'Notes & Projects'],
  ['projects/my-investing-strategy/index.html', 'en', null],
  ['404.html', 'en', 'Page not found'],
];

for (const [path, lang, heading] of pages) {
  test(`${path}: accessible landmarks, locales and CSP-compatible scripts`, () => {
    const html = readOutput(path);
    assert.match(html, new RegExp(`<html[^>]* lang="${lang}"`));
    assert.equal([...html.matchAll(/<main(?:\s|>)/g)].length, 1);
    if (heading) assert.ok(html.includes(heading));
    assert.ok(html.includes('<script src="/theme-init.js"></script>'));
    for (const script of html.matchAll(
      /<script\b([^>]*)>([\s\S]*?)<\/script>/g
    )) {
      if (script[1].includes('type="application/ld+json"')) {
        assert.doesNotThrow(() => JSON.parse(script[2]));
        continue;
      }
      assert.match(script[1], /\bsrc="/);
      assert.equal(script[2].trim(), '');
      const src = script[1].match(/\bsrc="([^"]+)"/)[1];
      if (src.startsWith('/')) assert.ok(readOutput(src.slice(1)).length > 0);
      else
        assert.equal(
          new URL(src).origin,
          'https://static.cloudflareinsights.com'
        );
    }
  });
}

test('CSP forbids executable inline scripts, base URLs, objects and forms', () => {
  const headers = readOutput('_headers');
  assert.match(
    headers,
    /script-src 'self' https:\/\/static\.cloudflareinsights\.com;/
  );
  for (const directive of [
    'script-src-attr',
    'base-uri',
    'object-src',
    'form-action',
    'frame-ancestors',
  ]) {
    assert.ok(headers.includes(`${directive} 'none';`));
  }
});

for (const [saved, dark, expected, blocked] of [
  ['light', true, 'light', false],
  ['dark', false, 'dark', false],
  [null, true, 'dark', false],
  [null, false, 'light', false],
  ['invalid', false, 'light', false],
  [null, true, 'dark', true],
  [null, false, 'light', true],
]) {
  test(`theme initialization: saved=${saved}, dark=${dark}, blocked=${blocked}`, () => {
    let actual;
    runInNewContext(readOutput('theme-init.js'), {
      localStorage: {
        getItem() {
          if (blocked) throw new Error('Storage unavailable');
          return saved;
        },
      },
      window: { matchMedia: () => ({ matches: dark }) },
      document: {
        documentElement: {
          setAttribute(name, value) {
            assert.equal(name, 'data-theme');
            actual = value;
          },
        },
      },
    });
    assert.equal(actual, expected);
  });
}

for (const blocked of [false, true]) {
  test(`theme toggle remains functional with storage blocked=${blocked}`, () => {
    const html = readOutput('index.html');
    const bundle = [
      ...html.matchAll(/<script\b[^>]*src="(\/_astro\/[^"]+)"/g),
    ][0][1];
    let theme = 'dark';
    let saved;
    let click;
    let pressed;
    runInNewContext(readOutput(bundle.slice(1)), {
      document: {
        getElementById: () => ({
          addEventListener: (_, handler) => {
            click = handler;
          },
          setAttribute: (name, value) => {
            assert.equal(name, 'aria-pressed');
            pressed = value;
          },
        }),
        documentElement: {
          getAttribute: () => theme,
          setAttribute: (_, value) => {
            theme = value;
          },
        },
      },
      localStorage: {
        setItem(_, value) {
          if (blocked) throw new Error('Storage unavailable');
          saved = value;
        },
      },
    });
    assert.equal(pressed, 'true');
    click();
    assert.equal(theme, 'light');
    assert.equal(pressed, 'false');
    if (!blocked) assert.equal(saved, 'light');
    click();
    assert.equal(theme, 'dark');
    assert.equal(pressed, 'true');
  });
}

const locales = {
  'index.html': 'en_US',
  'de/index.html': 'de_DE',
  'hu/index.html': 'hu_HU',
};
for (const [path, ogLocale] of Object.entries(locales)) {
  test(`${path}: hreflang alternates and og:locale`, () => {
    const html = readOutput(path);
    for (const [lang, href] of [
      ['en', '/'],
      ['de', '/de/'],
      ['hu', '/hu/'],
      ['x-default', '/'],
    ]) {
      assert.match(
        html,
        new RegExp(
          `<link rel="alternate" hreflang="${lang}" href="https://gergo\\.miszori\\.dev${href}"`
        )
      );
    }
    assert.ok(
      html.includes(`<meta property="og:locale" content="${ogLocale}"`)
    );
  });
}

test('pages share the large social preview image', () => {
  const html = readOutput('projects/index.html');
  assert.ok(html.includes('content="https://gergo.miszori.dev/og-image.png"'));
  assert.ok(html.includes('content="summary_large_image"'));
  assert.ok(!html.includes('hreflang'));
  assert.ok(readFileSync(new URL('og-image.png', output)).length > 0);
});

test('404 page is not indexed or listed in the sitemap', () => {
  assert.ok(readOutput('404.html').includes('content="noindex"'));
  assert.ok(!readOutput('sitemap-0.xml').includes('404'));
});

test('legacy locale routes redirect permanently', () => {
  const redirects = readOutput('_redirects');
  for (const from of ['/en', '/en/projects', '/de/projects', '/hu/projects']) {
    assert.match(redirects, new RegExp(`^${from}\\s+/\\S*\\s+301$`, 'm'));
  }
});

test('project date formatting preserves English UTC dates and missing values', () => {
  assert.equal(formatProjectDate(), '');
  assert.equal(
    formatProjectDate(new Date('2026-01-01T00:30:00+02:00')),
    'Dec 31, 2025'
  );
});
