import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { parse, serialize } from 'parse5';
import vm from 'node:vm';
import { applyBlocks } from '../src/utils/blocks.ts';

const read = path => readFile(new URL(`../${path}`, import.meta.url), 'utf8');
const css = await read('src/styles/global.css');

test('design variables have a definition and token aliases have no dependency cycles', () => {
  const definitions = new Map();
  for (const match of css.matchAll(/(--[\w-]+)\s*:\s*([^;{}]+)[;}]/g)) {
    const deps = [...match[2].matchAll(/var\((--[\w-]+)/g)].map(item => item[1]);
    definitions.set(match[1], [...(definitions.get(match[1]) ?? []), ...deps]);
  }
  const runtime = new Set(['--toc-from', '--toc-to', '--tip-shift', '--cookie-notice-height', '--icon-size']);
  for (const match of css.matchAll(/var\((--[\w-]+)/g)) assert.ok(definitions.has(match[1]) || runtime.has(match[1]), `Undefined ${match[1]}`);
  function visit(name, path = []) {
    assert.ok(!path.includes(name), `Token cycle: ${[...path, name].join(' → ')}`);
    for (const dep of definitions.get(name) ?? []) visit(dep, [...path, name]);
  }
  for (const name of definitions.keys()) visit(name);
});

test('responsive breakpoints and image sizes remain aligned', async () => {
  const header = await read('src/components/Header.astro');
  const card = await read('src/components/ContentCard.astro');
  for (const width of [700, 1000]) assert.match(css, new RegExp(`max-width: ${width}px`));
  assert.match(css, /min-width: 1200px/);
  assert.match(header, /@media \(min-width: 1001px\)/);
  assert.match(card, /min-width: 1001px/);
  assert.match(card, /min-width: 701px/);
  assert.doesNotMatch(css, /@media[^{}]*var\(/);
});

test('owner typography ceiling: every numeric leading is at most 1.5', () => {
  for (const match of css.matchAll(/--leading-[\w-]+:\s*([\d.]+)\s*;/g)) {
    assert.ok(Number(match[1]) <= 1.5, match[0]);
  }
});

test('syntax highlighting emits semantic variables rather than a fixed dark palette', async () => {
  const config = await read('astro.config.mjs');
  for (const role of ['background', 'foreground', 'comment', 'string', 'keyword', 'function', 'constant', 'punctuation']) {
    assert.ok(config.includes(`var(--code-${role})`));
    assert.ok(css.includes(`--code-${role}:`));
  }
});

test('text, syntax, feedback and necessary control borders meet their contrast roles in both themes', () => {
  const colors = Object.fromEntries([...css.matchAll(/--color-([\w-]+):\s*(#[\da-f]{6});/g)].map(m => [m[1], m[2].slice(1).match(/../g).map(n => parseInt(n,16))]));
  const luminance = rgb => rgb.map(n => n / 255).map(n => n <= .04045 ? n / 12.92 : ((n + .055) / 1.055) ** 2.4).reduce((sum,n,i) => sum + n * [.2126,.7152,.0722][i],0);
  const contrast = (a,b) => { const [high,low] = [luminance(a),luminance(b)].sort((x,y) => y-x); return (high+.05)/(low+.05); };
  const mix = (a,b,part) => a.map((n,i) => n*part+b[i]*(1-part));
  // A prose link dims toward black in both themes, and the hover rule has to win over the visited one (owner, 24.10.2026).
  const shades = [...css.matchAll(/--link-(\w+):\s*color-mix\(in srgb, var\(--link\) (\d+)%, var\(--color-black\)\)/g)].map(m => [m[1], Number(m[2]) / 100]);
  assert.deepEqual(shades.map(([name]) => name), ['visited', 'hover'], 'Link states must darken the accent, not brighten it');
  assert.ok(css.indexOf('.prose a:visited') < css.indexOf('.prose a:hover'), 'Visited colour must not outrank the hover it darkens');
  for (const theme of [
    { bg:'paper', surfaces:['white','mist'], ink:'ink', muted:'olive', accent:'green', on:'white', syntax:['purple','blue','brown','red'] },
    { bg:'night', surfaces:['forest','moss','neutral','graphite'], ink:'snow', muted:'gray', accent:'lime', on:'on-lime', syntax:['lilac','sky','sand','rose'] },
  ]) {
    const surfaces = [colors[theme.bg], ...theme.surfaces.map(n=>colors[n])];
    for (const role of [theme.ink,theme.muted,theme.accent,...theme.syntax]) for (const surface of surfaces) {
      assert.ok(contrast(colors[role],surface)>=4.5, `${role} on ${surface}: ${contrast(colors[role],surface).toFixed(2)}`);
    }
    for (const [,weight] of shades) assert.ok(contrast(mix(colors[theme.accent],colors.black,weight),colors[theme.bg])>=4.5, `Link ${weight} on ${theme.bg}`);
    const tinted = mix(colors[theme.accent],colors[theme.bg],.1);
    assert.ok(contrast(mix(colors[theme.muted],colors[theme.ink],.95),tinted)>=4.5, 'Quote attribution on accent tint');
    for (const weight of [1,.85,.75]) {
      const fill = mix(colors[theme.accent],colors[theme.ink],weight);
      assert.ok(contrast(colors[theme.on],fill)>=4.5, `Button state ${weight}`);
    }
    for (const surface of surfaces) assert.ok(contrast(colors[theme.muted],surface)>=3, 'Interactive border');
  }
});

test('the meta row glyph is lifted onto the ink of the digits it stands beside', () => {
  // The calendar paints twelve rows against nine for the digits, so flex centring alone leaves its base stroke under the text
  // baseline. One whole pixel is the step that puts that stroke on the baseline; a fraction would smear the 1.6 px stroke.
  const shift = Number(css.match(/--meta-icon-shift:\s*(-?[\d.]+)px/)[1]);
  assert.ok(shift < 0 && shift >= -1, `Meta glyph must be lifted by at most one pixel, got ${shift}px`);
  assert.match(css, /\.meta-item \.icon \{ transform: translateY\(var\(--meta-icon-shift\)\); \}/);
});

test('inline notes expose a keyboard disclosure and preserve links on Escape', () => {
  const page = parse('<html><body><div class="prose"><p>Термин{{<a href="https://example.com">Источник</a>}}</p></div></body></html>');
  applyBlocks(page);
  const html = serialize(page);
  assert.match(html, /role="note"/);
  assert.doesNotMatch(html, /role="tooltip"/);
  const handlers = new Map();
  const attrs = new Map();
  const term = { setAttribute: (k,v) => attrs.set(k,v), removeAttribute: k => attrs.delete(k), addEventListener: (k,v) => handlers.set(`term:${k}`,v), click: () => handlers.get('click')({ preventDefault() {}, target: null }) };
  const tip = {
    setAttribute: (k,v) => attrs.set(k,v), removeAttribute: k => attrs.delete(k), hasAttribute: k => attrs.has(k), contains: () => false,
    querySelector: s => s === '.tip-term' ? term : { id: 'tip-1', style: { removeProperty() {} }, getBoundingClientRect: () => ({ width:0 }) },
    addEventListener: (k,v) => handlers.set(k,v),
  };
  const script = html.match(/<script>([\s\S]*?)<\/script>/)[1];
  vm.runInNewContext(script, { document: { querySelectorAll: () => [tip], addEventListener: (k,v) => handlers.set(`document:${k}`,v), activeElement: null }, window: { addEventListener() {} }, Element: class {} });
  assert.equal(attrs.get('role'), 'button');
  assert.equal(attrs.get('aria-controls'), 'tip-1');
  assert.equal(attrs.get('aria-expanded'), 'false');
  for (const key of ['Enter', ' ']) {
    handlers.get('term:keydown')({ key, preventDefault() {} });
    assert.equal(attrs.get('aria-expanded'), 'true');
    handlers.get('document:keydown')({ key:'Escape' });
    assert.equal(attrs.get('aria-expanded'), 'false');
    assert.equal(attrs.has('data-tip-open'), false);
  }
});
