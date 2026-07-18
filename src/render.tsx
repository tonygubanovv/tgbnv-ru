import { renderToString } from 'react-dom/server';
import { App } from './ui/App';
import type { SiteData } from './types';

export function render(path: string, data: SiteData) {
  return renderToString(<App data={data} path={path} />);
}
