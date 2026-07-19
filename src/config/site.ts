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
  name: 'Тони Губанов',
  domain: 't-gubanov.ru',
  url: 'https://t-gubanov.ru',
  description: 'Заголовок и описание сайта. Рыба-текст, который позже будет заменен на нормальное позиционирование.',
  email: 'tonygubanovv@yandex.ru',
  telegram: 'https://t.me/tonygubanovv'
};

export const navItems: NavItem[] = [
  { href: '/', label: 'Главная' },
  { href: '/services/', label: 'Услуги' }
];
