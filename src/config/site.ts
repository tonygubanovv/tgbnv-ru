/** Shared blog topics in their public display order. */
export const blogTags = ['Статьи', 'Кейсы'] as const;

/** Latin tokens the topic filter puts into data attributes, independent of the displayed names. */
export const blogTagSlugs: Record<(typeof blogTags)[number], string> = {
  'Статьи': 'articles',
  'Кейсы': 'cases',
};

/** Real destinations shared by desktop and mobile navigation. */
export const mainMenu = [
  { label: 'Блог', path: 'blog/', description: 'Статьи, кейсы и эксперименты', icon: 'article' },
  { label: 'Рекомендую', path: 'recommend/', description: 'Сервисы, которыми пользуюсь сам', icon: 'star' },
  { label: 'Навыки', path: 'skills/', description: 'Направления работы и инструменты', icon: 'tag' },
] as const;

/** Skills shown as plain text labels on the /skills/ page. */
export const skillGroups = [
  {
    title: 'Интернет-реклама',
    skills: ['Яндекс Директ', 'Telegram Ads', 'VK Ads', 'Посевы в Telegram', 'TGStat', 'Лидогенерация', 'Тестирование креативов', 'Оптимизация кампаний'],
  },
  {
    title: 'Развитие сайтов',
    skills: ['Ведение бэклога', 'Постановка ТЗ', 'Приоритизация', 'Контроль разработки', 'Приёмка и тестирование', 'Релиз-ноутсы', 'Улучшение интерфейсов', 'Tilda', 'GitHub Pages'],
  },
  {
    title: 'SEO и поиск',
    skills: ['SEO', 'Техническая оптимизация', 'Структура и контент сайта', 'Яндекс Вебмастер', 'Google Search Console', 'Bing Webmaster Tools', 'IndexNow', 'GEO'],
  },
  {
    title: 'Веб- и сквозная аналитика',
    skills: ['Яндекс Метрика', 'Google Analytics 4', 'Roistat', 'Настройка аналитики', 'Сегменты и фильтры', 'Вебвизор', 'UTM-разметка', 'Атрибуция источников', 'Анализ конверсий', 'Анализ качества трафика', 'Разбор аномалий'],
  },
  {
    title: 'Материалы для продаж',
    skills: ['Продуктовые презентации', 'Структура и сценарий презентаций', 'Материалы для клиентов', 'Описание возможностей продуктов', 'Контент для email-аутрича', 'Согласование с продуктовыми командами'],
  },
  {
    title: 'CRM и автоматизация',
    skills: ['amoCRM', 'Salesbot amoCRM', 'Telegram-боты', 'Передача параметров в CRM', 'Сегментация клиентской базы', 'Контроль входящих лидов', 'Анализ качества лидов', 'Mango Office'],
  },
  {
    title: 'Email-маркетинг',
    skills: ['Sendsay', 'Unisender', 'Email-рассылки', 'Email-аутрич', 'Сегментация базы', 'Доставляемость писем', 'Разбор SMTP-ошибок', 'Аналитика рассылок'],
  },
  {
    title: 'Управление репутацией',
    skills: ['Яндекс Карты', '2ГИС', 'Google Карты', 'Работа с отзывами', 'Карточки организаций'],
  },
  {
    title: 'Рабочие процессы',
    skills: ['B2B-маркетинг', 'Маркетинг ИБ-продуктов', 'Работа с продажами', 'Работа с разработчиками и дизайнерами', 'Кросс-функциональные задачи', 'ИИ-инструменты'],
  },
] as const;

/** Share destinations use ordinary links; no third-party widgets are loaded. */
export const shareServices = [
  { label: 'Telegram', icon: 'telegram-plane', endpoint: 'https://t.me/share/url', urlParam: 'url', titleParam: 'text' },
  { label: 'ВКонтакте', icon: 'vk', endpoint: 'https://vk.com/share.php', urlParam: 'url', titleParam: 'title' },
] as const;

/** Personal recommendations and the owner's exact referral addresses. */
export const recommendations = [
  { name: 'Карта Пэй', url: 'https://bank.yandex.ru/invite?refid=h681fG9uAGv', description: 'Любимый банк с кешбэком баллами Плюса и Сейвом для накоплений.' },
  { name: 'Плати по миру', url: 'https://platipomiru.com/?code=XVSQGOLB', description: 'Зарубежная карта для оплаты подписок на нейронки.' },
  { name: 'Tilda', url: 'https://tilda.ru/?r=7536403', description: 'Самый удобный и продвинутый конструктор сайтов.' },
  { name: 'Timeweb Cloud', url: 'https://timeweb.cloud/r/kt656114', description: 'Хостинг/сервера для сайтов, ботов и прочих проектов.' },
  { name: 'Keys.so', url: 'https://www.keys.so/ru/?p=57950', description: 'Набор инструментов для SEO и разведки рекламы конкурентов' },
  { name: 'Seopapa', url: 'https://seopapa.com/agbnv', description: 'SEO-продвижение в Яндексе через поведенческие факторы.' },
  { name: 'Vitamin.tools', url: 'https://vitamin.tools/?ref2=385b1e94-9fe4-4d17-a54f-9f7c00414dbb', description: 'Рекламные кабинеты и сервисы' },
  { name: 'TGStat', url: 'https://tgstat.ru/x/X2eGo', description: 'Сервис для аналитики и поиска Telegram-каналов.' },
  { name: 'Salebot', url: 'https://salebot.pro/l/152537', description: 'Конструктор воронок и ботов в Telegram.' },
  { name: 'Qoder', url: 'https://qoder.com/activities?referral_code=6ree2iTPEJoqWyE5vT0rlQmByyvt4amO', description: 'Китайская приложуха для вайб-кодинга (есть бесплатная моделька).' },
] as const;

/** Set each public contact once. Missing values are not rendered anywhere. */
export const links = {
  telegram: 'https://t.me/tonygubanovv' as string | undefined,
  email: 'tonygubanovv@yandex.ru' as string | undefined,
  privacyEmail: 'tonygubanovv@yandex.ru',
};
/** Owner, 24.10.2026: email first, Telegram second — the order every list of contacts follows. */
export const contactLinks = () => [
  ...(links.email ? [{ key: 'email', label: links.email, url: `mailto:${links.email}` }] : []),
  ...(links.telegram ? [{ key: 'telegram', label: 'Telegram', url: links.telegram }] : []),
];

export const site = {
  name: 'Антон Губанов',
  author: 'Антон Губанов',
  role: 'Digital-маркетолог',
  locale: { language: 'ru-RU', openGraph: 'ru_RU', countryCode: 'RU', countryName: 'Россия' },
  hero: {
    title: 'Антон Губанов.',
    accent: 'Digital-маркетолог.',
    description: 'Дневник B2B-маркетолога в кибербезе. Мысли, кейсы, практика.',
  },
  about: {
    intro: 'Привет! Я Антон, диджитал-маркетолог. Работаю в компании в сфере ИБ (информационной безопасности) и занимаюсь продвижением сложных B2B-продуктов.',
    more: [
      'Занимаюсь рекламой, сайтом, аналитикой и работой с клиентской базой. Смотрю, как всё это связано: от первого знакомства с продуктом до заявки и разговора с продажами. Пробую разные подходы и разбираюсь, что помогает получать результат.',
      'А здесь делюсь опытом, мыслями и тем, что удалось проверить на практике. Пишу про маркетинг, технологии и инструменты, с которыми работаю. Собираю свои статьи, кейсы и наблюдения — чтобы было куда вернуться самому и чем поделиться с другими.',
    ],
  },
  navigation: mainMenu.map(({ label, path }) => ({ label, path })),
  // Индексация сайтом владеет этот блок. indexingEnabled: false закрывает весь сайт сразу.
  // closed — отдельные страницы: впиши адрес как в браузере, и он закроется от поисковика
  // (страница получит noindex и исчезнет из карты сайта). Для посетителя она останется открытой.
  // Страницы документов закрыты всегда, их сюда вписывать не нужно — список в src/utils/routes.ts.
  search: {
    indexingEnabled: true as boolean,
    closed: ['https://agubanovv.ru/blog/telegram-ads-ib-vendor/'],
  },
  analytics: { yandexId: 113586660 as number | undefined, privacyApproved: true },
  /** Public ownership tokens for search engines; rendered in every page <head>. */
  verification: {
    yandex: '1a79001ad80f627e',
    google: '6XETKa1QzG373kEImKULNHN9I-I0iV8mRj2orvuqKxM',
    bing: '5B5199D1ACA69B0BBDE7153766706793',
  },
  legal: {
    operatorName: 'Губанов Антон Андреевич',
    operatorStatus: 'самозанятый',
    updated: '2026-10-22',
    consentVersion: '2026-10-22.1',
    consentDays: 180,
  },
} as const;
