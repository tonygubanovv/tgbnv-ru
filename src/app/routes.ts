import { site } from '../config/site';
import { typographText as tx } from '../lib/typograph';

export const pageRoutes = ['/', '/resume/'] as const;

export type PageRoute = typeof pageRoutes[number];

export interface PageMeta {
  path: PageRoute;
  title: string;
  description: string;
  robots: string;
  canonical: string;
  ogTitle: string;
  ogDescription: string;
  ogType: 'website' | 'profile';
  ogUrl: string;
  ogImage: string;
  twitterCard: 'summary' | 'summary_large_image';
}

const closedRobots = 'noindex, nofollow, noarchive, nosnippet, noimageindex';

export const pageMeta: Record<PageRoute, PageMeta> = {
  '/': {
    path: '/',
    title: tx('Губанов Антон | Digital-маркетолог'),
    description: site.description,
    robots: closedRobots,
    canonical: site.url,
    ogTitle: tx('Губанов Антон | Digital-маркетолог'),
    ogDescription: site.description,
    ogType: 'website',
    ogUrl: site.url,
    ogImage: `${site.url}/icon-512.png`,
    twitterCard: 'summary'
  },
  '/resume/': {
    path: '/resume/',
    title: tx('Резюме | Губанов Антон'),
    description: tx('Резюме Губанова Антона: опыт в digital-маркетинге, B2B, кибербезопасности, сайтах, SEO, аналитике и CRM.'),
    robots: closedRobots,
    canonical: `${site.url}/resume/`,
    ogTitle: tx('Резюме | Губанов Антон'),
    ogDescription: tx('Опыт, результаты, инструменты и сертификаты Губанова Антона.'),
    ogType: 'profile',
    ogUrl: `${site.url}/resume/`,
    ogImage: `${site.url}/icon-512.png`,
    twitterCard: 'summary'
  }
};

export function normalizePath(path: string) {
  const cleanPath = path.split('?')[0]?.split('#')[0] || '/';
  const withSlash = cleanPath.startsWith('/') ? cleanPath : `/${cleanPath}`;

  if (withSlash === '/index.html') return '/';
  if (withSlash.endsWith('/index.html')) return withSlash.replace(/index\.html$/, '');
  if (/\.[a-z0-9]+$/i.test(withSlash)) return withSlash;

  return withSlash.endsWith('/') ? withSlash : `${withSlash}/`;
}

export function pageTitle(pathname: string) {
  return getPageMeta(pathname).title;
}

export function pageDescription() {
  return pageMeta['/'].description;
}

export function getPageMeta(pathname: string) {
  const route = normalizePath(pathname);
  if (isPageRoute(route)) return pageMeta[route];

  return {
    ...pageMeta['/'],
    title: tx('Страница не найдена | Губанов Антон'),
    description: tx('Такой страницы на сайте нет.'),
    canonical: site.url,
    ogTitle: tx('Страница не найдена | Губанов Антон'),
    ogDescription: tx('Такой страницы на сайте нет.')
  };
}

function isPageRoute(route: string): route is PageRoute {
  return pageRoutes.includes(route as PageRoute);
}
