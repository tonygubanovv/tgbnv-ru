import { hydrateRoot } from 'react-dom/client';
import { App } from './ui/App';
import './styles/global.css';
import type { SiteData } from './types';

declare global {
  interface Window {
    __SITE_DATA__?: SiteData;
  }
}

const root = document.getElementById('root');

if (!root || !window.__SITE_DATA__) {
  throw new Error('Site data was not found.');
}

hydrateRoot(root, <App data={window.__SITE_DATA__} path={window.location.pathname} />);
