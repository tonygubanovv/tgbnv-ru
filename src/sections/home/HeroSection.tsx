import { ButtonLink } from '../../components/ui/ButtonLink';
import { site } from '../../config/site';
import { relativeHref } from '../../lib/relativeHref';
import { typographText as tx } from '../../lib/typograph';

interface HeroSectionProps {
  route: string;
}

export function HeroSection({ route }: HeroSectionProps) {
  return (
    <section className="hero">
      <div className="container hero-inner hero-inner-simple">
        <div className="hero-copy">
          <p className="eyebrow">{tx('Личная страница')}</p>
          <h1 className="page-title">
            {tx('Губанов Антон,')} <span className="hero-title-accent">digital-маркетолог</span>
          </h1>
          <p className="lead">
            {tx('Здесь собраны мой профессиональный профиль, резюме и заметки о B2B-маркетинге, кибербезопасности, сайтах, SEO, аналитике и работе со сложными продуктами.')}
          </p>
          <div className="hero-actions">
            <ButtonLink href={relativeHref(route, '/resume/')}>{tx('Резюме')}</ButtonLink>
            <ButtonLink href={site.telegram} tone="secondary">{tx('Telegram-канал')}</ButtonLink>
          </div>
        </div>

        <aside className="hero-note" aria-label={tx('О странице')}>
          <dl>
            <div>
              <dt>{tx('Профиль')}</dt>
              <dd>{tx('Digital-маркетинг, B2B, кибербезопасность, сайты, SEO, аналитика и рекламные каналы.')}</dd>
            </div>
            <div>
              <dt>{tx('Telegram-канал')}</dt>
              <dd>{site.telegramDescription}</dd>
            </div>
            <div>
              <dt>{tx('Ссылка')}</dt>
              <dd>
                <a href={site.telegram} target="_blank" rel="noreferrer">{site.telegramTitle}</a>
              </dd>
            </div>
          </dl>
        </aside>
      </div>
    </section>
  );
}
