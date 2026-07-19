import { hydrateRoot } from 'react-dom/client';
import { App } from './app/App';
import './styles/global.css';

const root = document.getElementById('root');

if (!root) {
  throw new Error('Root element was not found.');
}

hydrateRoot(root, <App path={window.location.pathname} />);
