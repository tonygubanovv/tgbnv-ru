export interface SiteConfig {
  name: string;
  domain: string;
  url: string;
  description: string;
  email: string;
  telegram: string;
}

export interface NavItem {
  href: string;
  label: string;
}

export const site: SiteConfig = {
  name: 'Tony Gubanov',
  domain: 't-gubanov.ru',
  url: 'https://t-gubanov.ru',
  description: 'Personal website draft with notes, services, and selected work to be filled in later.',
  email: 'tonygubanovv@yandex.ru',
  telegram: 'https://t.me/tonygubanovv'
};

export const navItems: NavItem[] = [
  { href: '/', label: 'Home' },
  { href: '/services/', label: 'Services' }
];
