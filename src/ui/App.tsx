import type { BlogItem, CaseItem, ContentItem, SiteData } from '../types';

interface AppProps {
  data: SiteData;
  path: string;
}

const nav = [
  { href: '/cases/', label: 'Кейсы' },
  { href: '/blog/', label: 'Статьи' },
  { href: '/services/', label: 'Услуги' },
  { href: '/career/', label: 'Карьера' },
  { href: '/about/', label: 'О себе' }
];

export function App({ data, path }: AppProps) {
  const route = normalizePath(path);

  return (
    <>
      <Header />
      <main>
        <Route data={data} path={route} />
      </main>
      <Footer data={data} />
    </>
  );
}

function Route({ data, path }: AppProps) {
  if (path === '/') return <Home data={data} />;
  if (path === '/blog/') return <Listing title="Статьи" eyebrow="Блог" description="Практические материалы про аналитику, автоматизацию, AI и продуктовый подход." items={data.blog} />;
  if (path === '/cases/') return <Listing title="Кейсы" eyebrow="Практика" description="Разборы задач, решений, результатов и выводов." items={data.cases} />;
  if (path === '/services/') return <Services />;
  if (path === '/career/') return <Career />;
  if (path === '/about/') return <About />;
  if (path === '/contacts/') return <Contacts data={data} />;

  const blogPost = matchContent(path, '/blog/', data.blog);
  if (blogPost) return <ContentPage item={blogPost} label="Статья" />;

  const casePost = matchContent(path, '/cases/', data.cases);
  if (casePost) return <ContentPage item={casePost} label="Кейс" />;

  return <NotFound />;
}

function Header() {
  return (
    <header className="site-header">
      <div className="container header-inner">
        <a className="brand" href="/" aria-label="На главную">
          <span className="brand-mark">TG</span>
          <span>t-gubanov.ru</span>
        </a>
        <nav className="nav" aria-label="Основная навигация">
          {nav.map((item) => (
            <a href={item.href} key={item.href}>
              {item.label}
            </a>
          ))}
        </nav>
        <a className="button primary header-cta" href="/contacts/">
          Обсудить задачу
        </a>
      </div>
    </header>
  );
}

function Footer({ data }: { data: SiteData }) {
  return (
    <footer className="footer">
      <div className="container footer-inner">
        <div>
          <p className="footer-title">{data.site.name}</p>
          <p className="footer-text">{data.site.description}</p>
        </div>
        <div className="footer-links">
          <a href="/admin/">Редактор</a>
          <a href="/rss.xml">RSS</a>
          <a href="/contacts/">Контакты</a>
        </div>
      </div>
    </footer>
  );
}

function Home({ data }: { data: SiteData }) {
  const featured = [...data.cases, ...data.blog].slice(0, 3);

  return (
    <>
      <section className="hero">
        <div className="container hero-grid">
          <div>
            <p className="eyebrow">AI, аналитика, автоматизация</p>
            <h1 className="page-title">Помогаю превращать сложные процессы в понятные цифровые системы.</h1>
            <p className="lead">Кейсы, статьи и услуги: от аналитики и продуктовой упаковки до внедрения AI-инструментов в реальные рабочие процессы.</p>
            <div className="hero-actions">
              <a className="button primary" href="/cases/">Смотреть кейсы</a>
              <a className="button secondary" href="/services/">Услуги</a>
            </div>
          </div>
          <div className="hero-panel" aria-label="Ключевые направления">
            {['Кейсы вместо обещаний', 'Статьи с практикой', 'Услуги понятно'].map((title, index) => (
              <div key={title}>
                <span>0{index + 1}</span>
                <strong>{title}</strong>
                <p>{index === 0 ? 'Задача, решение, результат и выводы.' : index === 1 ? 'Материалы для сайта и Telegram.' : 'Конкретные направления и быстрый контакт.'}</p>
              </div>
            ))}
          </div>
        </div>
      </section>
      <section className="section">
        <div className="container">
          <div className="section-head">
            <div>
              <p className="eyebrow">Публикации</p>
              <h2>Свежие кейсы и статьи</h2>
            </div>
            <a className="button secondary" href="/blog/">Все статьи</a>
          </div>
          <div className="grid three">
            {featured.map((item) => <EntryCard item={item} key={`${item.collection}-${item.slug}`} />)}
          </div>
        </div>
      </section>
    </>
  );
}

function Listing({ title, eyebrow, description, items }: { title: string; eyebrow: string; description: string; items: ContentItem[] }) {
  return (
    <section className="container section">
      <p className="eyebrow">{eyebrow}</p>
      <h1 className="page-title">{title}</h1>
      <p className="lead">{description}</p>
      <div className="grid three listing">
        {items.map((item) => <EntryCard item={item} key={`${item.collection}-${item.slug}`} />)}
      </div>
    </section>
  );
}

function EntryCard({ item }: { item: ContentItem }) {
  return (
    <article className="card entry-card">
      <div className="card-meta">
        <time dateTime={item.pubDate}>{formatDate(item.pubDate)}</time>
        {isCaseItem(item) && item.result ? <span>{item.result}</span> : null}
      </div>
      <h2><a href={`/${item.collection}/${item.slug}/`}>{item.title}</a></h2>
      <p>{item.description}</p>
      <div className="tags">
        {item.tags.map((tag) => <span key={tag}>{tag}</span>)}
      </div>
    </article>
  );
}

function ContentPage({ item, label }: { item: ContentItem; label: string }) {
  return (
    <article className="container article-shell">
      <header className="article-header">
        <p className="eyebrow">{label}</p>
        <h1 className="page-title">{item.title}</h1>
        <p className="lead">{item.description}</p>
        <div className="article-meta">
          <time dateTime={item.pubDate}>{formatDate(item.pubDate)}</time>
          {item.telegram ? <span>Готово для Telegram</span> : null}
        </div>
      </header>
      <div className="article-grid">
        <div className="prose" dangerouslySetInnerHTML={{ __html: item.html }} />
        <Toc html={item.html} />
      </div>
    </article>
  );
}

function Toc({ html }: { html: string }) {
  const headings = [...html.matchAll(/<h([23]) id="([^"]+)">(.+?)<\/h[23]>/g)].map((match) => ({
    depth: Number(match[1]),
    id: match[2],
    text: stripHtml(match[3])
  }));

  if (!headings.length) return null;

  return (
    <aside className="toc" aria-label="Содержание">
      <p>Содержание</p>
      <nav>
        {headings.map((heading) => (
          <a className={`depth-${heading.depth}`} href={`#${heading.id}`} key={heading.id}>{heading.text}</a>
        ))}
      </nav>
    </aside>
  );
}

function Services() {
  const services = [
    ['Аудит процессов', 'Разбор текущего процесса, узких мест и возможностей для автоматизации.'],
    ['AI-инструменты', 'Подбор и внедрение AI-сценариев, которые помогают в реальной работе.'],
    ['Аналитика и дашборды', 'Структура данных, понятные метрики и интерфейсы для решений.'],
    ['Упаковка кейсов', 'Превращение опыта в ясные кейсы, статьи и публичные материалы.']
  ];

  return (
    <section className="container section">
      <p className="eyebrow">Услуги</p>
      <h1 className="page-title">Несколько понятных направлений вместо списка “делаю все”.</h1>
      <p className="lead">Базовая структура услуг. Формулировки можно уточнить после выбора аудитории и офферов.</p>
      <div className="grid two listing">
        {services.map(([title, text]) => (
          <article className="card service-card" key={title}>
            <h2>{title}</h2>
            <p>{text}</p>
            <a href="/contacts/">Обсудить</a>
          </article>
        ))}
      </div>
    </section>
  );
}

function Career() {
  return <StaticPage eyebrow="Опыт" title="Карьера и профессиональный контекст." description="Страница под таймлайн ролей, ключевые проекты, компетенции и результаты." />;
}

function About() {
  return <StaticPage eyebrow="О себе" title="Профессиональный профиль без лишней биографии." description="Позиционирование, опыт, сильные стороны, подход к проектам и сферы, где есть практический результат." />;
}

function Contacts({ data }: { data: SiteData }) {
  return (
    <section className="container section">
      <p className="eyebrow">Контакты</p>
      <h1 className="page-title">Если задача уже понятна, можно сразу написать.</h1>
      <p className="lead">На старте лучше использовать прямые контакты. Форму можно добавить позже через безопасный внешний сервис.</p>
      <div className="card contact-card">
        <a className="button primary" href={data.site.telegram} rel="noreferrer">Telegram</a>
        <a className="button secondary" href={`mailto:${data.site.email}`}>Email</a>
      </div>
    </section>
  );
}

function StaticPage({ eyebrow, title, description }: { eyebrow: string; title: string; description: string }) {
  return (
    <section className="container section">
      <p className="eyebrow">{eyebrow}</p>
      <h1 className="page-title">{title}</h1>
      <p className="lead">{description}</p>
      <div className="grid two listing">
        <div className="card"><h2>Подход</h2><p>Разобраться в задаче, отделить полезное от шумного, собрать решение, которое можно поддерживать.</p></div>
        <div className="card"><h2>Фокус</h2><p>Аналитика, автоматизация, AI-инструменты и рабочие процессы.</p></div>
      </div>
    </section>
  );
}

function NotFound() {
  return <StaticPage eyebrow="404" title="Страница не найдена." description="Такого адреса на сайте нет." />;
}

function normalizePath(path: string) {
  if (!path.startsWith('/')) return `/${path}`;
  return path.endsWith('/') ? path : `${path}/`;
}

function matchContent<T extends ContentItem>(path: string, prefix: string, items: T[]) {
  const slug = path.replace(prefix, '').replace(/\/$/, '');
  return items.find((item) => item.slug === slug);
}

function formatDate(value: string) {
  return new Intl.DateTimeFormat('ru-RU', { day: 'numeric', month: 'long', year: 'numeric' }).format(new Date(value));
}

function stripHtml(value: string) {
  return value.replace(/<[^>]*>/g, '');
}

function isCaseItem(item: ContentItem): item is CaseItem {
  return item.collection === 'cases';
}
