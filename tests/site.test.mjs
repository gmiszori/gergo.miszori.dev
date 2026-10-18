import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { test } from 'node:test';
import { runInNewContext } from 'node:vm';
import { formatProjectDate } from '../src/utils/date.ts';

const output = new URL('../dist/client/', import.meta.url);
const readOutput = (path) => readFileSync(new URL(path, output), 'utf8');
const pages = [
  ['index.html', 'en', 'Gergő Miszori'],
  ['de/index.html', 'de', 'Gergő Miszori'],
  ['hu/index.html', 'hu', 'Miszori Gergő'],
  ['projects/index.html', 'en', 'Projects & Notes'],
  ['projects/my-investing-strategy/index.html', 'en', null],
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
    runInNewContext(readOutput(bundle.slice(1)), {
      document: {
        getElementById: () => ({
          addEventListener: (_, handler) => {
            click = handler;
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
    click();
    assert.equal(theme, 'light');
    if (!blocked) assert.equal(saved, 'light');
    click();
    assert.equal(theme, 'dark');
  });
}

test('project date formatting preserves English UTC dates and missing values', () => {
  assert.equal(formatProjectDate(), '');
  assert.equal(
    formatProjectDate(new Date('2026-01-01T00:30:00+02:00')),
    'Dec 31, 2025'
  );
});
