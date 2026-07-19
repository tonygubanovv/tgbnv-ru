import { site } from '../config/site';
import { typographText as tx } from '../lib/typograph';

export const pageRoutes = ['/', '/resume/'] as const;

export type PageRoute = typeof pageRoutes[number];

export function normalizePath(path: string) {
  const cleanPath = path.split('?')[0]?.split('#')[0] || '/';
  const withSlash = cleanPath.startsWith('/') ? cleanPath : `/${cleanPath}`;

  if (withSlash === '/index.html') return '/';
  if (withSlash.endsWith('/index.html')) return withSlash.replace(/index\.html$/, '');
  if (/\.[a-z0-9]+$/i.test(withSlash)) return withSlash;

  return withSlash.endsWith('/') ? withSlash : `${withSlash}/`;
}

export function pageTitle(pathname: string) {
  const titles: Record<string, string> = {
    '/': `${site.name} | ${site.domain}`,
    '/resume/': `${tx('Резюме')} | ${site.name}`
  };

  return titles[normalizePath(pathname)] ?? site.name;
}

export function pageDescription() {
  return site.description;
}
