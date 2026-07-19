import { getPageMeta, type PageMeta } from '../app/routes';
import { site } from '../config/site';

type MetaAttribute = 'name' | 'property';

export function applyPageMeta(pathname: string) {
  const meta = getPageMeta(pathname);

  document.documentElement.lang = 'ru';
  document.title = meta.title;
  upsertMeta('name', 'description', meta.description);
  upsertMeta('name', 'robots', meta.robots);
  upsertLink('canonical', meta.canonical);

  upsertMeta('property', 'og:locale', 'ru_RU');
  upsertMeta('property', 'og:site_name', site.domain);
  upsertMeta('property', 'og:type', meta.ogType);
  upsertMeta('property', 'og:title', meta.ogTitle);
  upsertMeta('property', 'og:description', meta.ogDescription);
  upsertMeta('property', 'og:url', meta.ogUrl);
  upsertMeta('property', 'og:image', meta.ogImage);

  upsertMeta('name', 'twitter:card', meta.twitterCard);
  upsertMeta('name', 'twitter:title', meta.ogTitle);
  upsertMeta('name', 'twitter:description', meta.ogDescription);
  upsertMeta('name', 'twitter:image', meta.ogImage);
}

export function metaTags(meta: PageMeta) {
  return [
    `<title>${escapeHtml(meta.title)}</title>`,
    `<meta name="robots" content="${escapeAttribute(meta.robots)}">`,
    `<meta name="description" content="${escapeAttribute(meta.description)}">`,
    `<link rel="canonical" href="${escapeAttribute(meta.canonical)}">`,
    `<meta property="og:locale" content="ru_RU">`,
    `<meta property="og:site_name" content="${escapeAttribute(site.domain)}">`,
    `<meta property="og:type" content="${escapeAttribute(meta.ogType)}">`,
    `<meta property="og:title" content="${escapeAttribute(meta.ogTitle)}">`,
    `<meta property="og:description" content="${escapeAttribute(meta.ogDescription)}">`,
    `<meta property="og:url" content="${escapeAttribute(meta.ogUrl)}">`,
    `<meta property="og:image" content="${escapeAttribute(meta.ogImage)}">`,
    `<meta name="twitter:card" content="${escapeAttribute(meta.twitterCard)}">`,
    `<meta name="twitter:title" content="${escapeAttribute(meta.ogTitle)}">`,
    `<meta name="twitter:description" content="${escapeAttribute(meta.ogDescription)}">`,
    `<meta name="twitter:image" content="${escapeAttribute(meta.ogImage)}">`
  ].join('\n    ');
}

function upsertMeta(attribute: MetaAttribute, key: string, content: string) {
  const selector = `meta[${attribute}="${cssEscape(key)}"]`;
  const tag = document.head.querySelector<HTMLMetaElement>(selector) ?? document.createElement('meta');

  tag.setAttribute(attribute, key);
  tag.setAttribute('content', content);

  if (!tag.parentElement) document.head.append(tag);
}

function upsertLink(rel: string, href: string) {
  const selector = `link[rel="${cssEscape(rel)}"]`;
  const tag = document.head.querySelector<HTMLLinkElement>(selector) ?? document.createElement('link');

  tag.setAttribute('rel', rel);
  tag.setAttribute('href', href);

  if (!tag.parentElement) document.head.append(tag);
}

function cssEscape(value: string) {
  return value.replace(/"/g, '\\"');
}

function escapeHtml(value: string) {
  return value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

function escapeAttribute(value: string) {
  return escapeHtml(value);
}
