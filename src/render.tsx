import { renderToString } from 'react-dom/server';
import { App } from './app/App';

export function render(path: string) {
  return renderToString(<App path={path} />);
}
