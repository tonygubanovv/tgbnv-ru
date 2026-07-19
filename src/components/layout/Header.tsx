import { navItems, site } from '../../config/site';
import { externalLinkProps } from '../../lib/externalLink';
import { relativeHref } from '../../lib/relativeHref';
import { typographText as tx } from '../../lib/typograph';

interface HeaderProps {
  route: string;
}

export function Header({ route }: HeaderProps) {
  return (
    <header className="site-header">
      <div className="container header-inner">
        <a className="brand" href={relativeHref(route, '/')} aria-label={tx('На главную')}>
          <img className="brand-mark" src={relativeHref(route, '/logo.svg')} alt="" aria-hidden="true" />
          <span>{site.domain}</span>
        </a>

        <nav className="nav" aria-label={tx('Основная навигация')}>
          {navItems.map((item) => (
            <a className={route === item.href ? 'active' : undefined} href={relativeHref(route, item.href)} key={item.href}>
              {item.label}
            </a>
          ))}
        </nav>

        <a className="button primary header-cta" href={site.telegram} {...externalLinkProps(site.telegram)}>
          {tx('Канал')}
        </a>
      </div>
    </header>
  );
}
