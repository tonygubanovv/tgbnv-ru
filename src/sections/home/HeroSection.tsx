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
          <p className="eyebrow">{tx('Личный сайт')}</p>
          <h1 className="page-title">
            {tx('Digital-маркетинг для сложных')} <span className="hero-title-accent">B2B-продуктов</span>
          </h1>
          <p className="lead">
            {tx('Помогаю превращать технически сложные продукты в понятные страницы, контент, воронки и решения на данных. Основной контекст — B2B и кибербезопасность.')}
          </p>
          <div className="hero-actions">
            <ButtonLink href={relativeHref(route, '/resume/')}>{tx('Резюме')}</ButtonLink>
            <ButtonLink href={site.telegram} tone="secondary">{tx('Telegram-канал')}</ButtonLink>
          </div>
        </div>

        <aside className="hero-note" aria-label={tx('Профессиональный профиль')}>
          <dl>
            <div>
              <dt>{tx('Фокус')}</dt>
              <dd>{tx('B2B-маркетинг, сайты, SEO, аналитика, рекламные каналы и коммуникации для кибербеза.')}</dd>
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
