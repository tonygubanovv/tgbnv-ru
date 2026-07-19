import { site } from '../../config/site';
import { relativeHref } from '../../lib/relativeHref';
import { typographText as tx } from '../../lib/typograph';

interface FooterProps {
  route: string;
}

export function Footer({ route }: FooterProps) {
  return (
    <footer className="footer">
      <div className="container footer-inner">
        <div>
          <p className="footer-title">{site.name}</p>
          <p className="footer-text">{site.description}</p>
        </div>

        <div className="footer-links">
          <a href={relativeHref(route, '/services/')}>{tx('Услуги')}</a>
          <a href={site.telegram} rel="noreferrer">Telegram</a>
          <a href={`mailto:${site.email}`}>{site.email}</a>
        </div>
      </div>
    </footer>
  );
}
