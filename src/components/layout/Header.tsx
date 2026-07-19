import { navItems, site } from '../../config/site';
import { relativeHref } from '../../lib/relativeHref';

interface HeaderProps {
  route: string;
}

export function Header({ route }: HeaderProps) {
  return (
    <header className="site-header">
      <div className="container header-inner">
        <a className="brand" href={relativeHref(route, '/')} aria-label="На главную">
          <span className="brand-mark">TG</span>
          <span>{site.domain}</span>
        </a>

        <nav className="nav" aria-label="Основная навигация">
          {navItems.map((item) => (
            <a className={route === item.href ? 'active' : undefined} href={relativeHref(route, item.href)} key={item.href}>
              {item.label}
            </a>
          ))}
        </nav>

        <a className="button primary header-cta" href={site.telegram} rel="noreferrer">
          Telegram
        </a>
      </div>
    </header>
  );
}
