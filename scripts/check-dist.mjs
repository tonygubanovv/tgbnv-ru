/** Checks the actual static output for the approved custom domain. */
import { readFile, access, readdir } from 'node:fs/promises';
import { site, mainMenu, blogTagSlugs } from '../src/config/site.ts';
import { closedPaths, legalPaths, movedPaths } from '../src/utils/routes.ts';
import { readingMinutes } from '../src/utils/reading.ts';
import { contentChangeDate, frontmatterDate } from '../src/utils/lastmod.ts';
import { checkAnalytics } from './check-analytics.mjs';
import { parse } from 'parse5';
import { parseSeoTable, seoPath } from '../src/utils/seoTable.ts';
import { typograph } from '../src/utils/typography.ts';
import { isDocumentationPath } from './check-documentation.mjs';


const dist = new URL('../dist/', import.meta.url);
const expectedBase = '/';
const canonicalPrefix = 'https://agubanovv.ru/';
const errors = [];
const seoPages = parseSeoTable(await readFile(new URL('../content/seo.md', import.meta.url), 'utf8'));
const usedSeoPaths = new Set();

const home = await readFile(new URL('index.html', dist), 'utf8');
errors.push(...checkAnalytics(home, site, new URL(canonicalPrefix).hostname));

function elements(root) {
  const result = [];
  const visit = node => {
    if (node.tagName) result.push(node);
    node.childNodes?.forEach(visit);
  };
  visit(root);
  return result;
}
// Actual DOM text, as read by search tools and copy/paste; CSS line breaks add no spaces.
function textChunks(node, keepHidden = false) {
  if (node.nodeName === '#text') return [node.value];
  if (['svg', 'script', 'style', 'sup', 'sub'].includes(node.tagName)) return [];
  // A closed tooltip card is invisible and never copied with the sentence, so its words are not part of the text.
  if (!keepHidden && node.attrs?.some(attr => attr.name === 'role' && attr.value === 'tooltip')) return [];
  return (node.childNodes ?? []).flatMap(child => textChunks(child, keepHidden));
}
// What a reader gets out of the article body with the tags taken away, so a hidden card is read where it stands.
function proseText(node) {
  if (node.nodeName === '#text') return [node.value];
  if (['pre', 'code', 'script', 'style', 'svg'].includes(node.tagName)) return [];
  return (node.childNodes ?? []).flatMap(proseText);
}
const normalizeText = value => value.replace(/\s+/gu, ' ').trim();
const homeH1 = elements(parse(home)).find(node => node.tagName === 'h1');
if (normalizeText(textChunks(homeH1).join('')) !== normalizeText(`${site.hero.title} ${site.hero.accent}`)) {
  errors.push('Home H1 text is joined or differs from the configured title');
}

async function exists(path) {
  try { await access(new URL(path, dist)); return true; }
  catch { return false; }
}

const countMatches = (text, line) => text.split('\n').filter(entry => entry === line).length;

// Browsers and search engines also request the conventional ICO address directly.
if (await exists('favicon.ico')) {
  const ico = await readFile(new URL('favicon.ico', dist));
  if (ico.length < 6 || ico.readUInt16LE(0) !== 0 || ico.readUInt16LE(2) !== 1 || ico.readUInt16LE(4) !== 3) {
    errors.push('favicon.ico must be a real ICO with 16, 32 and 48 px images');
  } else {
    for (const [index, size] of [16, 32, 48].entries()) {
      const entry = 6 + index * 16;
      if (ico.length < entry + 16 || ico[entry] !== size || ico[entry + 1] !== size || ico.readUInt32LE(entry + 12) + ico.readUInt32LE(entry + 8) > ico.length) {
        errors.push(`Invalid favicon.ico image: ${size}px`);
      }
    }
  }
} else errors.push('Missing dist/favicon.ico');
// A home-screen shortcut is built from the declared sizes only, so each raster has to match its own name.
for (const [file, side] of [['favicon-16x16.png', 16], ['favicon-32x32.png', 32], ['apple-touch-icon.png', 180]]) {
  if (!await exists(file)) { errors.push(`Missing dist/${file}`); continue; }
  const png = await readFile(new URL(file, dist));
  // PNG stores width and height as big-endian uint32 in the IHDR chunk right after the signature.
  if (png.length < 24 || png.readUInt32BE(16) !== side || png.readUInt32BE(20) !== side) errors.push(`dist/${file} must be ${side}x${side}`);
}
const headLinks = elements(parse(home)).filter(node => node.tagName === 'link');
for (const [rel, href] of [
  ['icon', `${expectedBase}favicon.svg`],
  ['icon', `${expectedBase}favicon.ico`],
  ['apple-touch-icon', `${expectedBase}apple-touch-icon.png`],
  ['manifest', `${expectedBase}site.webmanifest`],
]) {
  if (!headLinks.some(node => node.attrs?.some(attr => attr.name === 'rel' && attr.value === rel) && node.attrs?.some(attr => attr.name === 'href' && attr.value === href))) {
    errors.push(`The page head must link ${rel} ${href}`);
  }
}
// Android reads the icon set only from the manifest, so its own addresses have to resolve in the build.
try {
  const manifest = JSON.parse(await readFile(new URL('site.webmanifest', dist), 'utf8'));
  if (!manifest.name || !Array.isArray(manifest.icons) || manifest.icons.length === 0) errors.push('dist/site.webmanifest must name the site and list icons');
  for (const icon of manifest.icons ?? []) {
    if (!await exists(icon.src.replace(/^\//u, ''))) errors.push(`dist/site.webmanifest points at a missing file: ${icon.src}`);
  }
} catch { errors.push('dist/site.webmanifest must be valid JSON'); }
if (!await exists('recommend/index.html')) errors.push('Missing recommendations page');

for (const path of ['index.html', 'blog/index.html', '404.html', 'robots.txt', 'robots-yandex.txt', '4705095550820effb099a08c420e8464.txt', 'privacy/index.html', 'cookies/index.html', 'consent/index.html', 'legal/index.html', 'legal/privacy/index.html', 'legal/cookies/index.html', 'legal/consent/index.html', 'sitemap-0.xml']) {
  if (!await exists(path)) errors.push(`Missing dist/${path}`);
}

// A mistyped address in the owner's list must never leave a page silently open.
for (const path of closedPaths) {
  if (!await exists(`${path}index.html`)) errors.push(`Closed address has no page in this build: /${path}`);
}

// The owner publishes every text material only under /blog/; the site root may hold a redirect stub alone.
for (const name of await readdir(new URL('../content/blog/', import.meta.url), { withFileTypes: true })) {
  if (!name.isDirectory()) continue;
  const slug = name.name;
  if (!await exists(`blog/${slug}/index.html`)) errors.push(`Publication is not served under /blog/: /${slug}/`);
  if (await exists(`${slug}/index.html`) && !movedPaths[`${slug}/`]) errors.push(`Publication escaped /blog/ to the site root: /${slug}/`);
}
if (!await exists('sitemap-index.xml') || !await exists('sitemap.xml')) {
  errors.push('Missing sitemap-index.xml or its sitemap.xml alias');
}

async function walk(dirUrl) {
  const entries = await readdir(dirUrl, { withFileTypes: true });
  const pages = [];
  for (const entry of entries) {
    const fileUrl = new URL(entry.name + (entry.isDirectory() ? '/' : ''), dirUrl);
    if (entry.isDirectory()) pages.push(...await walk(fileUrl));
    else if (entry.name.endsWith('.html')) pages.push(fileUrl);
  }
  return pages;
}

for (const [from, to] of Object.entries(movedPaths)) {
  if (!await exists(`${from}index.html`)) errors.push(`Missing redirect page: /${from}`);
  if (!await exists(`${to}index.html`)) errors.push(`Redirect destination does not exist: /${from} -> /${to}`);
}

// Topics are filters on the blog page instead of pages of their own, so the chips and the cards have to agree.
{
  const attr = (node, name) => node.attrs.find(entry => entry.name === name)?.value;
  const blogPage = elements(parse(await readFile(new URL('blog/index.html', dist), 'utf8')));
  const chips = new Set(blogPage.filter(node => node.tagName === 'button' && attr(node, 'data-topic') !== undefined).map(node => attr(node, 'data-topic')));
  const cardTopics = blogPage.filter(node => node.tagName === 'article').flatMap(node => (attr(node, 'data-topics') ?? '').split(' ').filter(Boolean));
  for (const topic of chips) if (!cardTopics.includes(topic)) errors.push(`Topic filter chip has no article on /blog/: ${topic}`);
  for (const topic of cardTopics) if (!chips.has(topic)) errors.push(`Article topic has no filter chip on /blog/: ${topic}`);
}

const indexedTitles = new Map();
const indexedDescriptions = new Map();
for (const page of await walk(dist)) {
  const html = await readFile(page, 'utf8');
  const path = page.pathname.split('/dist/').at(-1) ?? page.pathname;
  const moved = Object.entries(movedPaths).find(([from]) => path === `${from}index.html`);
  if (moved) {
    const [, to] = moved;
    if (!html.includes(`url=${expectedBase}${to}`)) errors.push(`Old address does not redirect to its destination: ${path}`);
    if (!html.includes(`rel="canonical" href="${canonicalPrefix}${to}"`)) errors.push(`Redirect has an incorrect canonical: ${path}`);
    if (!html.includes(`href="${expectedBase}${to}"`)) errors.push(`Redirect has no working fallback link: ${path}`);
    if (!/<meta\b[^>]*name="robots"[^>]*content="noindex/i.test(html)) errors.push(`Redirect stub must stay out of search results: ${path}`);
    continue;
  }
  const nodes = elements(parse(html));
  const key = seoPath(path.replace(/index\.html$/, ''));
  const meta = seoPages.get(key);
  usedSeoPaths.add(key);
  if (!meta) errors.push(`Missing row in content/seo.md: ${key}`);
  else {
    const attribute = (node, name) => node.attrs.find(attr => attr.name === name)?.value;
    const values = name => nodes.filter(node => node.tagName === 'meta' && (attribute(node, 'name') === name || attribute(node, 'property') === name)).map(node => attribute(node, 'content'));
    const title = nodes.filter(node => node.tagName === 'title');
    if (title.length !== 1 || textChunks(title[0]).join('') !== typograph(meta.title)) errors.push(`Title differs from content/seo.md: ${path}`);
    for (const [name, expected] of [['description', meta.description], ['og:title', meta.title], ['twitter:title', meta.title], ['og:description', meta.description], ['twitter:description', meta.description]]) {
      const found = values(name);
      if (found.length !== 1 || found[0] !== typograph(expected)) errors.push(`Missing, duplicate or incorrect ${name}: ${path}`);
    }
    const keywords = values('keywords');
    if (meta.keywords ? keywords.length !== 1 || keywords[0] !== typograph(meta.keywords) : keywords.length !== 0) errors.push(`Keywords differ from content/seo.md: ${path}`);
  }
  if (path.startsWith('blog/') && nodes.some(node => node.attrs.some(attr => attr.name === 'class' && attr.value.split(/\s+/).includes('prose')))) {
    const share = nodes.find(node => node.attrs.some(attr => attr.name === 'data-article-share'));
    const address = `${canonicalPrefix}${path.replace(/index\.html$/, '')}`;
    const copy = share && elements(share).find(node => node.attrs.some(attr => attr.name === 'data-copy-article' && attr.value === address));
    if (!copy) errors.push(`Missing clean article copy address: ${path}`);
    const links = share ? elements(share).filter(node => node.tagName === 'a') : [];
    const expectedShares = ['https://t.me/share/url', 'https://vk.com/share.php'];
    if (links.length !== expectedShares.length) errors.push(`Expected only Telegram and VK article sharing destinations: ${path}`);
    for (const endpoint of expectedShares) {
      const href = links.map(node => node.attrs.find(attr => attr.name === 'href')?.value).find(value => value?.split('?')[0] === endpoint);
      const target = href && new URL(href);
      if (!target || target.searchParams.get('url') !== address) {
        errors.push(`Share destination has an incorrect article address: ${path} -> ${endpoint}`);
      }
    }
  }
  for (const node of nodes.filter(node => node.tagName === 'a')) {
    const attr = name => node.attrs.find(item => item.name === name)?.value ?? '';
    if (attr('href').startsWith('mailto:') && (/\bbutton\b/.test(attr('class')) || attr('role') === 'button')) {
      errors.push(`Email must be a plain mailto link, never a button: ${path}`);
    }
    const target = new URL(attr('href'), canonicalPrefix);
    if (target.origin === new URL(canonicalPrefix).origin && isDocumentationPath(target.pathname)) errors.push(`Internal link exposes project documentation: ${path} -> ${attr('href')}`);
    if (/^https?:$/.test(target.protocol) && target.origin !== new URL(canonicalPrefix).origin) {
      const rel = attr('rel').split(/\s+/);
      if (attr('target') !== '_blank' || !rel.includes('noopener') || !rel.includes('noreferrer')) {
        errors.push(`External link must open safely in a new tab: ${path} -> ${attr('href')}`);
      }
    }
  }
  // Two words that stand next to each other stay two words: neither an inline tag nor a hidden card may grow them together.
  for (const keepHidden of [false, true]) {
    for (const node of nodes.filter(node => /^(h[1-6]|p|figcaption|button)$/.test(node.tagName))) {
      const chunks = textChunks(node, keepHidden).filter(Boolean);
      for (let index = 1; index < chunks.length; index++) {
        if (/[\p{L}\p{N}.!?]$/u.test(chunks[index - 1]) && /^[\p{L}\p{N}]/u.test(chunks[index])) {
          errors.push(`Missing text separator in ${node.tagName}: ${path} -> ${chunks[index - 1].slice(-30)}|${chunks[index].slice(0, 30)}`);
        }
      }
    }
  }
  // The marker syntax is a private note between the owner and the renderer: none of it may reach a reader or a crawler.
  for (const prose of nodes.filter(node => (node.attrs?.find(item => item.name === 'class')?.value ?? '').split(/\s+/).includes('prose'))) {
    const text = proseText(prose).join('');
    for (const leaked of [':::', '{{', '}}']) {
      if (text.includes(leaked)) errors.push(`Shortcode syntax leaked into the article text: ${path} -> ${leaked}`);
    }
  }
  // A quote's author stands outside the quoted words, so no search engine takes the name for part of the quotation.
  for (const quote of nodes.filter(node => node.tagName === 'blockquote')) {
    if (elements(quote).some(node => node.tagName === 'figcaption')) errors.push(`A quote's author sits inside the quoted words: ${path}`);
  }
  const pagePath = path.replace(/index\.html$/, '');
  const isClosedPage = closedPaths.includes(pagePath) || path.endsWith('404.html');
  const isDocumentPage = legalPaths.includes(pagePath) || path.endsWith('404.html');
  const isNoindex = /<meta\b[^>]*name="robots"[^>]*content="noindex/i.test(html);
  if ((html.match(/<h1\b/gi) ?? []).length !== 1) errors.push(`Expected exactly one H1: ${path}`);
  if (!nodes.some(node => node.tagName === 'html' && node.attrs.some(attr => attr.name === 'lang' && attr.value === site.locale.language))) errors.push(`Missing Russian regional page language: ${path}`);
  if (!nodes.some(node => node.tagName === 'meta' && node.attrs.some(attr => attr.name === 'property' && attr.value === 'og:locale') && node.attrs.some(attr => attr.name === 'content' && attr.value === site.locale.openGraph))) errors.push(`Missing Russian Open Graph locale: ${path}`);
  for (const nav of nodes.filter(node => node.tagName === 'nav' && node.attrs.some(attr => attr.name === 'aria-label' && attr.value === 'Основная навигация'))) {
    const menuLinks = elements(nav).filter(node => node.tagName === 'a').map(node => node.attrs.find(attr => attr.name === 'href')?.value);
    for (const item of mainMenu) if (!menuLinks.includes(`${expectedBase}${item.path}`)) errors.push(`Missing static navigation link: ${path} -> ${item.path}`);
    if (menuLinks.some(href => href?.startsWith(`${expectedBase}blog/tags/`))) errors.push(`Blog topics must stay out of the header menu: ${path}`);
  }
  if (!/<meta\b[^>]*name="description"[^>]*content="[^"]+"/i.test(html)) errors.push(`Missing description: ${path}`);
  if (/href=["']#["']/i.test(html)) errors.push(`Placeholder link: ${path}`);
  const analyticsEnabled = site.analytics.privacyApproved && Number.isSafeInteger(site.analytics.yandexId) && Number(site.analytics.yandexId) > 0;
  if (analyticsEnabled) {
    if ((html.match(/metrika\/tag\.js/g) ?? []).length !== 1 || !html.includes(`const counterId = ${site.analytics.yandexId};`)) errors.push(`Missing or duplicate approved Metrika counter: ${path}`);
    if (!html.includes('data-cookie-notice') || !html.includes('data-cookie-accept') || !html.includes('data-cookie-decline')) errors.push(`Missing explicit consent controls: ${path}`);
    if (!html.includes('startAnalytics(choice)') || !html.includes('location.hostname !== publicHostname')) errors.push(`Missing consent/host analytics guard: ${path}`);
  } else if (/mc\.yandex\.ru/.test(html)) errors.push(`Unapproved Metrika counter: ${path}`);
  if (/mc\.yandex\.ru\/watch\/|clarity\.ms/i.test(html)) errors.push(`Unconditional pixel or removed tracker found: ${path}`);
  // Pages closed from indexing carry noindex instead of a canonical.
  if (!isClosedPage) {
    const canonical = html.match(/<link\b[^>]*rel=["']canonical["'][^>]*href=["']([^"']+)/i)
      ?? html.match(/<link\b[^>]*href=["']([^"']+)["'][^>]*rel=["']canonical["']/i);
    if (!canonical || canonical[1] !== canonicalPrefix + pagePath) {
      errors.push(`Missing/incorrect canonical: ${path}`);
    }
  }
  if (!isNoindex && meta) {
    for (const [seen, value, name] of [[indexedTitles, meta.title, 'title'], [indexedDescriptions, meta.description, 'description']]) {
      const normalized = normalizeText(typograph(value)).toLocaleLowerCase('ru');
      if (seen.has(normalized)) errors.push(`Duplicate indexed ${name}: ${seen.get(normalized)} and ${path}`);
      seen.set(normalized, path);
    }
    if (!html.includes('max-image-preview:large')) errors.push(`Large search image previews are not enabled: ${path}`);
  }
  const expectCrumbs = !isDocumentPage && path !== 'index.html';
  const hasCrumbs = /<nav class="breadcrumbs"/i.test(html);
  if (expectCrumbs !== hasCrumbs) errors.push(`Breadcrumbs ${hasCrumbs ? 'rendered where they should not be' : 'missing'}: ${path}`);
  if (!site.search.indexingEnabled && !isNoindex) errors.push(`Global indexing lock missing: ${path}`);
  if (site.search.indexingEnabled && isNoindex && !isClosedPage) errors.push(`Page is noindex but not listed as closed: ${path}`);
  if (!isNoindex && closedPaths.includes(pagePath)) errors.push(`Closed page lost its noindex mark: ${path}`);
  const graphs = html.match(/<script type="application\/ld\+json"[^>]*>([\s\S]*?)<\/script>/gi) ?? [];
  const structured = graphs.flatMap(script => {
    const graph = JSON.parse(script.replace(/^<script[^>]*>/i, '').replace(/<\/script>$/i, ''));
    return graph['@graph'] ?? [graph];
  });
  if (nodes.some(node => node.tagName === 'article' && node.attrs.some(attr => attr.name === 'class' && attr.value.split(/\s+/).includes('publication')))) {
    const article = structured.find(graph => ['BlogPosting', 'Article'].includes(graph['@type']));
    if (!article || article.mainEntityOfPage !== canonicalPrefix + pagePath || !article.headline || !article.image || !article.datePublished || !article.dateModified || !article.author?.url || article.author?.name !== site.author) {
      errors.push(`Missing or incomplete article structured data: ${path}`);
    }
    // The owner removed the printed byline (24.10.2026): the author lives only in structured data, and the header row keeps the
    // date plus one chip per topic, which has to land the reader back in the blog with that filter already applied.
    const header = nodes.find(node => node.tagName === 'header' && (node.attrs?.find(attr => attr.name === 'class')?.value ?? '').split(/\s+/).includes('publication-header'));
    if (!header) errors.push(`Article has no header block: ${path}`);
    else {
      if (/Автор/.test(textChunks(header).join(''))) errors.push(`Article header still prints a byline: ${path}`);
      const chips = elements(header).filter(node => node.tagName === 'a' && (node.attrs?.find(attr => attr.name === 'class')?.value ?? '').split(/\s+/).includes('tag'));
      if (!chips.length) errors.push(`Article header carries no topic chip: ${path}`);
      const topicSlugs = new Set(Object.values(blogTagSlugs));
      for (const chip of chips) {
        const [page, query] = (chip.attrs?.find(attr => attr.name === 'href')?.value ?? '').split('?');
        if (page !== '/blog/' || !topicSlugs.has(new URLSearchParams(query).get('topic') ?? '')) errors.push(`Article topic chip does not return to a filtered blog: ${path}`);
      }
      // The printed reading time has to be the body's own: nobody types it, so a mismatch means the number stopped being derived.
      const items = elements(header).filter(node => (node.attrs?.find(attr => attr.name === 'class')?.value ?? '').split(/\s+/).includes('meta-item'));
      const printed = items.map(node => textChunks(node).join('').trim()).find(value => /^\d+\s+мин$/u.test(value)) ?? '';
      const source = await readFile(new URL(`../content/blog/${pagePath.split('/')[1]}/index.md`, import.meta.url), 'utf8');
      if (!printed || Number(printed.match(/^\d+/u)[0]) !== readingMinutes(source.replace(/^---\r?\n[\s\S]*?\r?\n---\r?\n/, ''))) {
        errors.push(`Article reading time is missing or does not match its body: ${path}`);
      }
      // Both technical items are a glyph plus text; a bare number or a bare date means the pair lost its icon.
      for (const item of items) if (!elements(item).some(node => node.tagName === 'svg')) errors.push(`Article meta item has no glyph: ${path}`);
      if (items.length < 2) errors.push(`Article header carries fewer than two meta items: ${path}`);
    }
  }
  if (path === 'index.html' && !structured.some(graph => graph['@type'] === 'Person' && graph.name === site.author)) errors.push('Home page must identify the real author');
  if (path === 'index.html' && !structured.some(graph => graph['@type'] === 'WebSite' && graph.inLanguage === site.locale.language && graph.audience?.geographicArea?.identifier === site.locale.countryCode)) errors.push('WebSite must declare Russian language and the Russian audience');
  for (const script of graphs) {
    const json = JSON.parse(script.replace(/^<script[^>]*>/i, '').replace(/<\/script>$/i, '').replace(/\\u003c/g, '<'));
    if (json['@type'] !== 'BreadcrumbList') continue;
    const items = json.itemListElement ?? [];
    const nav = html.match(/<nav class="breadcrumbs"[\s\S]*?<\/nav>/i);
    if (!nav || items.length !== (nav[0].match(/<a\b/gi) ?? []).length + 1) errors.push(`BreadcrumbList does not match the visible trail: ${path}`);
    if (items[0]?.name !== 'Главная' || items[0]?.item !== 'https://agubanovv.ru/') errors.push(`Breadcrumb trail must start with the home page: ${path}`);
    items.forEach((item, index) => {
      if (item.position !== index + 1) errors.push(`Breadcrumb position drift: ${path}`);
      const isLast = index === items.length - 1;
      if (isLast === Boolean(item.item)) errors.push(`Breadcrumb link handling is wrong: ${path} -> ${item.name}`);
      if (item.item && !item.item.startsWith(canonicalPrefix)) errors.push(`Breadcrumb URL outside the approved domain: ${path} -> ${item.item}`);
    });
  }

  const re = /\b(?:href|src)=["'](\/[^"']*)["']/g;
  for (const match of html.matchAll(re)) {
    const value = match[1];
    if (!value.startsWith(expectedBase)) errors.push(`Root-absolute asset/link not base-aware: ${path} -> ${value}`);
  }
  // Follow the actual generated local links, including fragments and asset files.
  const links = /\b(?:href|src)=["']([^"']+)["']/g;
  for (const match of html.matchAll(links)) {
    const value = match[1].replace(/&amp;/g, '&');
    const pageUrl = new URL(path === 'index.html' ? '' : path.replace(/index\.html$/, ''), canonicalPrefix);
    const target = new URL(value, pageUrl);
    if (target.origin !== new URL(canonicalPrefix).origin) continue;
    if (!target.pathname.startsWith(expectedBase)) {
      errors.push(`Local link escapes base: ${path} -> ${value}`);
      continue;
    }
    let targetPath = decodeURIComponent(target.pathname.slice(expectedBase.length));
    if (!targetPath || targetPath.endsWith('/')) targetPath += 'index.html';
    if (!await exists(targetPath)) {
      errors.push(`Broken local link/asset: ${path} -> ${value}`);
    } else if (target.hash && targetPath.endsWith('.html')) {
      const targetHtml = await readFile(new URL(targetPath, dist), 'utf8');
      const id = decodeURIComponent(target.hash.slice(1));
      if (!targetHtml.includes(`id="${id}"`) && !targetHtml.includes(`id='${id}'`)) errors.push(`Broken fragment: ${path} -> ${value}`);
    }
  }
  for (const match of html.matchAll(/<img\b[^>]*>/gi)) {
    if (!/\balt=["'][^"']*["']/i.test(match[0])) errors.push(`Image without alt: ${path}`);
    if (!/\bwidth=/i.test(match[0]) || !/\bheight=/i.test(match[0])) errors.push(`Image without dimensions: ${path}`);
  }
  for (const match of html.matchAll(/<meta\b[^>]*property="og:image"[^>]*content="([^"]+)"/gi)) {
    const imageUrl = new URL(match[1]);
    if (imageUrl.origin === new URL(canonicalPrefix).origin && !await exists(imageUrl.pathname.slice(expectedBase.length))) errors.push(`Missing OG image: ${path}`);
  }
}

const robots = await readFile(new URL('robots.txt', dist), 'utf8');
if (!robots.includes(`Sitemap: ${canonicalPrefix}sitemap.xml`)) errors.push('Incorrect robots sitemap URL');
if (!/^User-agent: \*$/m.test(robots)) errors.push('robots.txt has no universal group');
if (!/^User-agent: Yandex$/m.test(robots)) errors.push('robots.txt has no Yandex group');
for (const cancelled of ['Host:', 'Noindex:', 'Crawl-delay:']) {
  if (robots.includes(cancelled)) errors.push(`robots.txt uses the unsupported directive ${cancelled}`);
}
const cleanParams = [...robots.matchAll(/^Clean-param: (\S+) (\/\S*)$/gm)];
if (!cleanParams.length) errors.push('robots.txt has no Clean-param for Yandex');
const ignored = new Set(cleanParams.flatMap(([, params]) => params.split('&')));
for (const required of ['utm_source', 'utm_medium', 'utm_campaign', 'utm_term', 'utm_content', 'gclid', 'msclkid', 'fbclid', 'yclid']) {
  if (!ignored.has(required)) errors.push(`Clean-param does not ignore ${required}`);
}
for (const [, params] of cleanParams) {
  if (params.length > 500) errors.push(`Clean-param exceeds the 500 character limit: ${params.slice(0, 40)}…`);
  for (const name of params.split('&')) if (!/^[a-z0-9_-]+$/.test(name)) errors.push(`Clean-param name is not a lowercase token: ${name}`);
}
const yandexFile = await readFile(new URL('robots-yandex.txt', dist), 'utf8');
if (!robots.includes(yandexFile.split('\n\n').at(-2))) errors.push('robots-yandex.txt drifts from the Yandex group in robots.txt');
for (const path of site.search.indexingEnabled ? legalPaths : []) {
  if (countMatches(robots, `Disallow: /${path}`) !== 2) errors.push(`Document page is not disallowed in both robot groups: /${path}`);
  if (countMatches(yandexFile, `Disallow: /${path}`) !== 1) errors.push(`Document page is missing from the Yandex file: /${path}`);
}

// Sitemap dates come from the article files and from the history of their folders, never from the build clock.
const articles = new Map();
for (const name of await readdir(new URL('../content/blog/', import.meta.url), { withFileTypes: true })) {
  if (!name.isDirectory()) continue;
  const published = frontmatterDate(await readFile(new URL(`../content/blog/${name.name}/index.md`, import.meta.url), 'utf8'), 'date');
  if (!published) continue;
  articles.set(`blog/${name.name}/`, { published, changed: contentChangeDate(process.cwd(), `content/blog/${name.name}`, published) });
}
const newestContent = [...articles.values()].map(article => article.changed).sort().at(-1);

const sitemapPart = await readFile(new URL('sitemap-0.xml', dist), 'utf8');
const entries = [...sitemapPart.matchAll(/<url>([\s\S]*?)<\/url>/g)];
if (!site.search.indexingEnabled && entries.length) errors.push('Disabled indexing must have an empty sitemap');
if (!site.search.indexingEnabled && /^Disallow:/m.test(robots)) errors.push('Crawlers must be able to read the global noindex');
if (site.search.indexingEnabled && !entries.length) errors.push('The sitemap is empty while indexing is enabled');
for (const path of closedPaths) {
  if (sitemapPart.includes(`<loc>${canonicalPrefix}${path}</loc>`)) errors.push(`Closed page is still in the sitemap: /${path}`);
}
for (const [, body] of entries) {
  const loc = body.match(/<loc>([^<]+)<\/loc>/)?.[1] ?? '';
  if (loc && isDocumentationPath(new URL(loc).pathname)) errors.push(`Project documentation in sitemap: ${loc}`);
  if (!loc.startsWith(canonicalPrefix)) errors.push(`Sitemap URL outside the approved domain: ${loc}`);
  if (!/<priority>/.test(body)) errors.push(`Sitemap URL without priority: ${loc}`);
  const lastmod = body.match(/<lastmod>([^<]+)<\/lastmod>/)?.[1];
  const path = loc.slice(canonicalPrefix.length);
  const article = articles.get(path);
  if (!lastmod) {
    if (article) errors.push(`Article in the sitemap without lastmod: ${loc}`);
    continue;
  }
  if (Date.parse(`${lastmod}T00:00:00Z`) > Date.now() + 86_400_000) errors.push(`Sitemap lastmod is in the future: ${loc} -> ${lastmod}`);
  if (article) {
    if (lastmod !== article.changed) errors.push(`Sitemap lastmod is not the day this article's content changed: ${loc} -> ${lastmod}, expected ${article.changed}`);
    if (lastmod < article.published) errors.push(`Sitemap lastmod is earlier than the publication date: ${loc} -> ${lastmod}`);
  } else if (path === '' || path === 'blog/') {
    if (newestContent && lastmod !== newestContent) errors.push(`Sitemap lastmod of ${path || 'the home page'} is not the newest content change: ${lastmod}, expected ${newestContent}`);
  } else {
    errors.push(`Sitemap lastmod on a page whose date the build does not derive: ${loc} -> ${lastmod}`);
  }
}
if (/<lastmod>[^<]*T/.test(sitemapPart)) errors.push('Sitemap lastmod must be a plain day, without a time');

const sitemap = await exists('sitemap.xml') ? await readFile(new URL('sitemap.xml', dist), 'utf8') : '';
if (sitemap !== sitemapPart) errors.push('sitemap.xml is not the page list of this build');
if (!sitemap.includes('<urlset')) errors.push('sitemap.xml must list the pages themselves, not an index of files');

const indexedPages = [];
for (const page of await walk(dist)) {
  const path = page.pathname.split('/dist/').at(-1) ?? page.pathname;
  if (path.endsWith('404.html')) continue;
  if (/<meta\b[^>]*name="robots"[^>]*content="noindex/i.test(await readFile(page, 'utf8'))) continue;
  indexedPages.push(path.replace(/index\.html$/, ''));
}
const listed = new Set(entries.map(([, body]) => body.match(/<loc>([^<]+)<\/loc>/)?.[1] ?? ''));
for (const path of indexedPages) {
  if (!listed.has(canonicalPrefix + path)) errors.push(`Indexed page is missing from the sitemap: /${path}`);
}
for (const loc of listed) {
  if (!indexedPages.includes(loc.slice(canonicalPrefix.length))) errors.push(`Sitemap offers a page that is not indexable in this build: ${loc}`);
}

if (await exists('sitemap-index.xml')) {
  for (const match of (await readFile(new URL('sitemap-index.xml', dist), 'utf8')).matchAll(/<loc>([^<]+)<\/loc>/g)) {
    if (!match[1].startsWith(canonicalPrefix) || !await exists(match[1].slice(canonicalPrefix.length))) errors.push(`Broken sitemap reference: ${match[1]}`);
  }
}
if (!await exists('CNAME') || (await readFile(new URL('CNAME', dist), 'utf8')).trim() !== new URL(canonicalPrefix).hostname) errors.push('CNAME does not match the approved custom domain');
for (const name of await readdir(dist)) {
  if (/^\.env|\.(pem|key|p12|pfx)$/i.test(name)) errors.push(`Sensitive file in dist: ${name}`);
}

for (const path of seoPages.keys()) {
  if (!usedSeoPaths.has(path)) errors.push(`content/seo.md contains a page missing from this build: ${path}`);
}
async function checkPublicFiles(directory, prefix = '') {
  for (const entry of await readdir(directory, { withFileTypes: true })) {
    const path = `${prefix}${entry.name}`;
    if (isDocumentationPath(path)) errors.push(`Project documentation or Markdown source in dist: ${path}`);
    if (entry.isDirectory()) await checkPublicFiles(new URL(`${entry.name}/`, directory), `${path}/`);
  }
}
await checkPublicFiles(dist);
if (errors.length) {
  console.error('Static site checks failed:\n' + errors.map(e => '- ' + e).join('\n'));
  process.exitCode = 1;
} else {
  console.log('Static site smoke checks passed.');
}
