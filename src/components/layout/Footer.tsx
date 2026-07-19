import { site } from '../../config/site';
import { externalLinkProps } from '../../lib/externalLink';
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
          <a href={relativeHref(route, '/resume/')}>{tx('Резюме')}</a>
          <a href={site.telegram} {...externalLinkProps(site.telegram)}>Telegram</a>
          <a href={site.contactTelegram} {...externalLinkProps(site.contactTelegram)}>{tx('Написать')}</a>
          <a href={`mailto:${site.email}`}>{site.email}</a>
        </div>
      </div>
    </footer>
  );
}
