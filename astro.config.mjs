import { defineConfig } from 'astro/config';
import tailwindcss from '@tailwindcss/vite';
import sitemap from '@astrojs/sitemap';
import { copyFile, writeFile } from 'node:fs/promises';
import { sitemapMeta } from './src/utils/sitemapMeta.ts';
import { isClosedPath, movedPaths } from './src/utils/routes.ts';
import { site } from './src/config/site.ts';

const origin = 'https://agubanovv.ru';

export default defineConfig({
  site: origin,
  base: '/',
  trailingSlash: 'always',
  output: 'static',
  // Shiki accepts a TextMate theme with CSS variables. Generated spans follow the page theme,
  // including system/no-JS mode; the actual colour values live only in global.css.
  markdown: {
    shikiConfig: {
      theme: {
        name: 'agubanov',
        type: 'dark',
        colors: { 'editor.background': 'var(--code-background)', 'editor.foreground': 'var(--code-foreground)' },
        tokenColors: [
          { scope: ['comment', 'punctuation.definition.comment'], settings: { foreground: 'var(--code-comment)' } },
          { scope: ['string'], settings: { foreground: 'var(--code-string)' } },
          { scope: ['keyword', 'storage'], settings: { foreground: 'var(--code-keyword)' } },
          { scope: ['entity.name.function', 'support.function'], settings: { foreground: 'var(--code-function)' } },
          { scope: ['constant', 'support.constant'], settings: { foreground: 'var(--code-constant)' } },
          { scope: ['punctuation'], settings: { foreground: 'var(--code-punctuation)' } },
        ],
      },
    },
  },
  // Covers arrive as 2,7 MB PNGs, so the build re-encodes them and the browser picks a variant by width.
  // Sharp stays on purpose: the owner asked for optimization on 22.10.2026, do not put the noop service back.
  image: { service: { entrypoint: 'astro/assets/services/sharp' } },
  integrations: [
    ...(site.search.indexingEnabled ? [sitemap({
      filter: (page) => !isClosedPath(new URL(page).pathname) && !Object.hasOwn(movedPaths, new URL(page).pathname.replace(/^\//, '')) && !page.endsWith('/404/') && !page.endsWith('/404.html'),
      serialize: (item) => ({ ...item, ...sitemapMeta(new URL(item.url).pathname) }),
    })] : []),
    {
      name: 'sitemap-public-alias',
      hooks: {
        'astro:build:done': async ({ dir }) => {
          if (!site.search.indexingEnabled) {
            const empty = '<?xml version="1.0" encoding="UTF-8"?><urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"></urlset>';
            await writeFile(new URL('sitemap-0.xml', dir), empty);
            await writeFile(new URL('sitemap-index.xml', dir), '<?xml version="1.0" encoding="UTF-8"?><sitemapindex xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"><sitemap><loc>https://agubanovv.ru/sitemap-0.xml</loc></sitemap></sitemapindex>');
          }
          // The owner reads /sitemap.xml in the webmaster consoles, so it must list the pages themselves,
          // not an index with one link to a second file.
          await copyFile(new URL('sitemap-0.xml', dir), new URL('sitemap.xml', dir));
        },
      },
    },
    {
      name: 'page-redirects',
      hooks: {
        // The same redirects work in development and in the static GitHub Pages build.
        'astro:config:setup': ({ injectRoute }) => {
          for (const from of Object.keys(movedPaths)) {
            injectRoute({ pattern: `/${from.replace(/\/$/, '')}`, entrypoint: new URL('./src/layouts/RedirectLayout.astro', import.meta.url), prerender: true });
          }
        },
      },
    },
  ],
  vite: { plugins: [tailwindcss()] },
});
