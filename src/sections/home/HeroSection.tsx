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
          <p className="eyebrow">О себе</p>
          <h1 className="page-title">
            Заголовок главной <span className="hero-title-accent">страницы</span>
          </h1>
          <p className="lead">
            Описание рыба-текстом. Здесь будет короткое объяснение, кто вы, чем занимаетесь и почему человеку стоит
            остаться на сайте.
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
              <dd>Описание рыба-текстом про направление работы.</dd>
            </div>
            <div>
              <dt>Опыт</dt>
              <dd>Короткая строка, которую можно заменить на реальный факт.</dd>
            </div>
            <div>
              <dt>Контакт</dt>
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
