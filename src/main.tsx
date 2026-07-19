import { hydrateRoot } from 'react-dom/client';
import { App } from './app/App';
import { applyPageMeta } from './lib/headMeta';
import './styles/global.css';

const root = document.getElementById('root');

if (!root) {
  throw new Error('Root element was not found.');
}

applyPageMeta(window.location.pathname);
hydrateRoot(root, <App path={window.location.pathname} />);
