import { typographText as tx } from '../lib/typograph';

export interface SiteConfig {
  name: string;
  domain: string;
  url: string;
  description: string;
  email: string;
  telegram: string;
  contactTelegram: string;
  telegramTitle: string;
  telegramDescription: string;
}

export interface NavItem {
  href: string;
  label: string;
}

export const site: SiteConfig = {
  name: 'Губанов Антон',
  domain: 't-gubanov.ru',
  url: 'https://t-gubanov.ru',
  description: tx('Digital-маркетолог в B2B и кибербезе: сайт, контент, SEO, аналитика, воронка и понятная упаковка сложных продуктов.'),
  email: 'tonygubanovv@yandex.ru',
  telegram: 'https://t.me/+FYu_-k3qpokwODg6',
  contactTelegram: 'https://t.me/tonygubanovv',
  telegramTitle: tx('Digital-маркетолог | Губанов Антон'),
  telegramDescription: tx('Дневник B2B-маркетолога в кибербезе. Мысли, кейсы, практика.')
};

export const navItems: NavItem[] = [
  { href: '/', label: tx('Главная') },
  { href: '/resume/', label: tx('Резюме') }
];
