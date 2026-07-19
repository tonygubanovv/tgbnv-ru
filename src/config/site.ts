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
  description: 'Личный сайт о digital-маркетинге, сайтах, аналитике и работе со сложными B2B-продуктами.',
  email: 'tonygubanovv@yandex.ru',
  telegram: 'https://t.me/tonygubanovv'
};

export const navItems: NavItem[] = [
  { href: '/', label: 'Главная' },
  { href: '/services/', label: 'Услуги' }
];
