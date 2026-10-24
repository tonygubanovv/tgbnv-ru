// The extension is required: `npm run smoke` loads this file through Node, not through Vite.
import { site } from '../config/site.ts';

/**
 * Любой адрес приводится к пути внутри сайта: https://agubanovv.ru/blog/slug/, /blog/slug/ и blog/slug/
 * дают одно и то же. Главная — пустая строка.
 */
const toPath = (address: string) => {
  const trimmed = address.replace(/^https?:\/\/[^/]+/i, '').replace(/^\/+/, '').replace(/\/+$/, '');
  return trimmed === '' ? '' : `${trimmed}/`;
};

/** Страницы документов закрыты от поиска всегда: `noindex`, вне sitemap и запрещены директивой Disallow в robots.txt. */
export const legalPaths = ['legal/', 'legal/consent/', 'legal/cookies/', 'legal/privacy/', 'consent/', 'cookies/', 'privacy/'];

/**
 * Всё, что поисковики не должны показывать: страницы документов плюс список владельца `site.search.closed`.
 * Закрытая страница получает `noindex, follow`, теряет canonical и исчезает из карты сайта.
 */
export const closedPaths = [...legalPaths, ...site.search.closed.map(toPath)];

export const isClosedPath = (path: string) => closedPaths.includes(toPath(path));

/**
 * Previous public addresses. The build leaves only a redirect page
 * at the old path, because those links were already shared before the move.
 */
export const movedPaths: Record<string, string> = {
  'privacy/': 'legal/privacy/',
  'cookies/': 'legal/cookies/',
  'consent/': 'legal/consent/',
  'telegram-ads-ib-vendor/': 'blog/telegram-ads-ib-vendor/',
  'salesbot-utm-amocrm/': 'blog/salesbot-utm-amocrm/',
  // Topic pages were dropped on 24.10.2026: topics filter /blog/ in place, so every old topic address lands on the blog.
  'blog/tags/54656c656772616d20416473/': 'blog/',
  'blog/tags/d09dd0b5d0b9d180d0bed181d0b5d182d0b8/': 'blog/',
  'blog/tags/53454f20262047454f/': 'blog/',
  'blog/tags/d09ad0b5d0b9d181d18b/': 'blog/',
  'blog/tags/telegram-ads/': 'blog/',
  'blog/tags/neuroseti/': 'blog/',
  'blog/tags/seo-geo/': 'blog/',
  'blog/tags/cases/': 'blog/',
};
