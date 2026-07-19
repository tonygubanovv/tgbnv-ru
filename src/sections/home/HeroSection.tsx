import { ButtonLink } from '../../components/ui/ButtonLink';
import { site } from '../../config/site';
import { relativeHref } from '../../lib/relativeHref';

interface HeroSectionProps {
  route: string;
}

export function HeroSection({ route }: HeroSectionProps) {
  return (
    <section className="hero">
      <div className="container hero-inner">
        <div className="hero-copy">
          <p className="eyebrow">Личный сайт</p>
          <h1 className="page-title">
            О маркетинге, сайтах и аналитике сложных <span className="hero-title-accent">B2B-продуктов</span>
          </h1>
          <p className="lead">
            Здесь собираю опыт, рабочие заметки и подход к задачам, где нужно понятнее объяснить продукт, улучшить сайт
            и разобраться в данных.
          </p>
          <div className="hero-actions">
            <ButtonLink href={relativeHref(route, '/services/')}>Услуги</ButtonLink>
            <ButtonLink href={site.telegram} tone="secondary">Telegram</ButtonLink>
          </div>
        </div>

        <aside className="hero-note" aria-label="Коротко">
          <p className="hero-note-label">Коротко</p>
          <dl>
            <div>
              <dt>Фокус</dt>
              <dd>B2B-маркетинг, сайты, SEO, аналитика и ИИ-видимость.</dd>
            </div>
            <div>
              <dt>Интерес</dt>
              <dd>Как сложные продукты становятся понятнее для клиентов, команды и рынка.</dd>
            </div>
            <div>
              <dt>Связаться</dt>
              <dd>
                <a href={site.telegram} rel="noreferrer">Telegram</a>
              </dd>
            </div>
          </dl>
        </aside>
      </div>
    </section>
  );
}
