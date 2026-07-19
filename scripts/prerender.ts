import fs from 'node:fs/promises';
import path from 'node:path';
import { pageDescription, pageRoutes, pageTitle } from '../src/app/routes';
import { site } from '../src/config/site';
import { render } from '../src/render';

const distDir = path.join(process.cwd(), 'dist');
const injectionsDir = path.join(process.cwd(), 'src', 'injections');

interface HtmlInjections {
  head: string;
  bodyStart: string;
}

function assetPath(pathname: string, asset: string) {
  const depth = pathname === '/' ? 0 : pathname.split('/').filter(Boolean).length;
  const prefix = depth === 0 ? './' : '../'.repeat(depth);
  return `${prefix}${asset}`;
}

function htmlDocument(pathname: string, appHtml: string, assets: string[], injections: HtmlInjections) {
  const title = pageTitle(pathname);
  const description = pageDescription();
  const assetTags = assets.map((asset) => {
    const href = assetPath(pathname, asset);
    if (asset.endsWith('.css')) return `<link rel="stylesheet" href="${href}">`;
    if (asset.endsWith('.js')) return `<script type="module" src="${href}"></script>`;
    return '';
  }).join('\n    ');

  return `<!doctype html>
<html lang="ru">
  <head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>${title}</title>
    <meta name="robots" content="noindex, nofollow, noarchive">
    <meta name="description" content="${description}">
    ${assetTags}
    ${injections.head}
  </head>
  <body>
    ${injections.bodyStart}
    <div id="root">${appHtml}</div>
  </body>
</html>`;
}

async function getAssets() {
  const manifestPath = path.join(distDir, '.vite', 'manifest.json');
  const source = await fs.readFile(manifestPath, 'utf8');
  const manifest = JSON.parse(source) as Record<string, { file: string; css?: string[] }>;
  const entry = manifest['index.html'] ?? manifest['src/main.tsx'];
  return [entry.file, ...(entry.css ?? [])];
}

async function readOptionalFile(filePath: string) {
  try {
    return await fs.readFile(filePath, 'utf8');
  } catch (error) {
    if ((error as NodeJS.ErrnoException).code === 'ENOENT') return '';
    throw error;
  }
}

async function readInjections(): Promise<HtmlInjections> {
  const [head, bodyStart] = await Promise.all([
    readOptionalFile(path.join(injectionsDir, 'head.html')),
    readOptionalFile(path.join(injectionsDir, 'body-start.html'))
  ]);

  return { head: head.trim(), bodyStart: bodyStart.trim() };
}

async function writePage(pathname: string, assets: string[], injections: HtmlInjections) {
  const outputPath = pathname === '/'
    ? path.join(distDir, 'index.html')
    : path.join(distDir, pathname, 'index.html');

  await fs.mkdir(path.dirname(outputPath), { recursive: true });
  await fs.writeFile(outputPath, htmlDocument(pathname, render(pathname), assets, injections), 'utf8');
}

function sitemapPath(pathname: string) {
  return `${site.url}${pathname === '/' ? '/' : pathname}`;
}

async function writeSitemap() {
  const urls = pageRoutes.map((route) => `  <url>
    <loc>${sitemapPath(route)}</loc>
  </url>`).join('\n');

  const sitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urls}
</urlset>
`;

  await fs.writeFile(path.join(distDir, 'sitemap.xml'), sitemap, 'utf8');
}

async function main() {
  const assets = await getAssets();
  const injections = await readInjections();

  await Promise.all(pageRoutes.map((route) => writePage(route, assets, injections)));
  await writeSitemap();
}

await main();
