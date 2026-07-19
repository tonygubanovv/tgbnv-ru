import { normalizePath } from '../app/routes';

export function relativeHref(fromRoute: string, href: string) {
  if (isExternalHref(href)) return href;

  const target = normalizeHref(href.startsWith('/') ? href : `/${href}`);
  const fromSegments = normalizePath(fromRoute).split('/').filter(Boolean);
  const targetSegments = target.split('/').filter(Boolean);
  const prefix = fromSegments.length === 0 ? './' : '../'.repeat(fromSegments.length);

  if (targetSegments.length === 0) return prefix;

  return `${prefix}${targetSegments.join('/')}${target.endsWith('/') ? '/' : ''}`;
}

function normalizeHref(href: string) {
  if (/\.[a-z0-9]+$/i.test(href)) return href;
  return normalizePath(href);
}

function isExternalHref(href: string) {
  return /^https?:\/\//.test(href) || href.startsWith('mailto:') || href.startsWith('tel:') || href.startsWith('#');
}
