import { Footer } from '../components/layout/Footer';
import { Header } from '../components/layout/Header';
import { HomePage } from '../pages/HomePage';
import { NotFoundPage } from '../pages/NotFoundPage';
import { ResumePage } from '../pages/ResumePage';
import { normalizePath } from './routes';

interface AppProps {
  path: string;
}

export function App({ path }: AppProps) {
  const route = normalizePath(path);

  return (
    <>
      <Header route={route} />
      <main>
        <Route path={route} />
      </main>
      <Footer route={route} />
    </>
  );
}

function Route({ path }: { path: string }) {
  if (path === '/') return <HomePage route={path} />;
  if (path === '/resume/') return <ResumePage />;

  return <NotFoundPage />;
}
