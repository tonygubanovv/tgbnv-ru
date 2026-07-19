import { ButtonLink } from '../../components/ui/ButtonLink';
import { site } from '../../config/site';
import { typographText as tx } from '../../lib/typograph';

export function TelegramSection() {
  return (
    <section className="section telegram-section section-warm">
      <div className="container telegram-band">
        <div>
          <p className="eyebrow">Telegram-канал</p>
          <h2>{tx('Канал с короткими заметками и наблюдениями')}</h2>
          <p>
            {tx('Туда удобно выносить мысли, которые еще не стали большими статьями: разборы интерфейсов, заметки про аналитику, SEO, ИИ-видимость и понятность B2B-продуктов.')}
          </p>
        </div>

        <div className="telegram-actions">
          <ButtonLink href={site.telegram}>{tx('Открыть Telegram')}</ButtonLink>
        </div>
      </div>
    </section>
  );
}
