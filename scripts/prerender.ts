import fs from 'node:fs/promises';
import path from 'node:path';
import { render } from '../src/render';
import { loadSiteData } from '../src/content/markdown';
import type { ContentItem, SiteData } from '../src/types';

const distDir = path.join(process.cwd(), 'dist');

function pageTitle(pathname: string, data: SiteData) {
  const item = findContent(pathname, data);
  if (item) return `${item.title} | ${data.site.name}`;

  const titles: Record<string, string> = {
    '/': `${data.site.name} | ${data.site.description}`,
    '/blog/': `Статьи | ${data.site.name}`,
    '/cases/': `Кейсы | ${data.site.name}`,
    '/services/': `Услуги | ${data.site.name}`,
    '/career/': `Карьера | ${data.site.name}`,
    '/about/': `О себе | ${data.site.name}`,
    '/contacts/': `Контакты | ${data.site.name}`
  };

  return titles[pathname] ?? data.site.name;
}

function pageDescription(pathname: string, data: SiteData) {
  return findContent(pathname, data)?.description ?? data.site.description;
}

function publicUrl(pathname: string, data: SiteData) {
  const baseUrl = data.site.url.replace(/\/$/, '');
  const pathPart = pathname === '/' ? '/' : pathname;
  return `${baseUrl}${pathPart}`;
}

function findContent(pathname: string, data: SiteData): ContentItem | undefined {
  const all = [...data.blog, ...data.cases];
  return all.find((item) => pathname === `/${item.collection}/${item.slug}/`);
}

function escapeJson(data: SiteData) {
  return JSON.stringify(data).replace(/</g, '\\u003c');
}

function assetPath(pathname: string, asset: string) {
  const depth = pathname === '/' ? 0 : pathname.split('/').filter(Boolean).length;
  const prefix = depth === 0 ? './' : '../'.repeat(depth);
  return `${prefix}${asset}`;
}

function htmlDocument(pathname: string, appHtml: string, data: SiteData, assets: string[]) {
  const canonical = publicUrl(pathname, data);
  const title = pageTitle(pathname, data);
  const description = pageDescription(pathname, data);
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
    <meta name="description" content="${description}">
    <link rel="canonical" href="${canonical}">
    <meta property="og:type" content="${findContent(pathname, data) ? 'article' : 'website'}">
    <meta property="og:site_name" content="${data.site.name}">
    <meta property="og:title" content="${title}">
    <meta property="og:description" content="${description}">
    <meta property="og:url" content="${canonical}">
    <meta property="og:image" content="${publicUrl('/og-default.svg', data)}">
    <meta name="twitter:card" content="summary_large_image">
    ${assetTags}
  </head>
  <body>
    <div id="root">${appHtml}</div>
    <script>window.__SITE_DATA__=${escapeJson(data)}</script>
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

async function writePage(pathname: string, data: SiteData, assets: string[]) {
  const filePath = path.join(distDir, pathname, 'index.html');
  const outputPath = pathname === '/' ? path.join(distDir, 'index.html') : filePath;
  await fs.mkdir(path.dirname(outputPath), { recursive: true });
  await fs.writeFile(outputPath, htmlDocument(pathname, render(pathname, data), data, assets), 'utf8');
}

async function writeTextFile(relativePath: string, content: string) {
  await fs.writeFile(path.join(distDir, relativePath), content, 'utf8');
}

async function main() {
  const data = await loadSiteData();
  const assets = await getAssets();
  const routes = [
    '/',
    '/blog/',
    '/cases/',
    '/services/',
    '/career/',
    '/about/',
    '/contacts/',
    ...data.blog.map((item) => `/blog/${item.slug}/`),
    ...data.cases.map((item) => `/cases/${item.slug}/`)
  ];

  await Promise.all(routes.map((route) => writePage(route, data, assets)));

  const sitemap = routes.map((route) => `<url><loc>${publicUrl(route, data)}</loc></url>`).join('');
  await writeTextFile('sitemap.xml', `<?xml version="1.0" encoding="UTF-8"?><urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">${sitemap}</urlset>`);

  const rss = data.blog.map((item) => {
    const url = publicUrl(`/blog/${item.slug}/`, data);
    return `<item><title><![CDATA[${item.title}]]></title><description><![CDATA[${item.description}]]></description><link>${url}</link><guid>${url}</guid><pubDate>${new Date(item.pubDate).toUTCString()}</pubDate></item>`;
  }).join('');
  await writeTextFile('rss.xml', `<?xml version="1.0" encoding="UTF-8"?><rss version="2.0"><channel><title>${data.site.name}</title><description>${data.site.description}</description><link>${data.site.url}</link>${rss}</channel></rss>`);
}

await main();
