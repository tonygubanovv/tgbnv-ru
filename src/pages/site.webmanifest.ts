import { site } from '../config/site';
import { typograph } from '../utils/typography';
import { url } from '../utils/urls';

// Served at /site.webmanifest: the icon set browsers use for home-screen shortcuts.
// No theme colour is declared — the site follows the system theme instead of tinting the browser.
const manifest = {
  name: typograph(site.name),
  short_name: typograph(site.name),
  description: typograph(site.hero.description),
  lang: site.locale.language,
  start_url: url(),
  scope: url(),
  display: 'browser',
  icons: [
    { src: url('favicon-16x16.png'), sizes: '16x16', type: 'image/png' },
    { src: url('favicon-32x32.png'), sizes: '32x32', type: 'image/png' },
    { src: url('favicon.ico'), sizes: '48x48', type: 'image/x-icon' },
    { src: url('apple-touch-icon.png'), sizes: '180x180', type: 'image/png' },
  ],
};

export const GET = () =>
  new Response(`${JSON.stringify(manifest, null, 2)}\n`, { headers: { 'Content-Type': 'application/manifest+json; charset=utf-8' } });
