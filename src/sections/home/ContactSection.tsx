import { ButtonLink } from '../../components/ui/ButtonLink';
import { site } from '../../config/site';
import { typographText as tx } from '../../lib/typograph';

export function ContactSection() {
  return (
    <section className="section contact-section">
      <div className="container contact-band">
        <div>
          <p className="eyebrow">{tx('Контакты')}</p>
          <h2>{tx('Можно обсудить задачу')}</h2>
          <p>
            {tx('Лучше сразу написать, что хочется улучшить, какой продукт или сайт рассматривается и какой результат нужен.')}
          </p>
        </div>

        <div className="contact-actions">
          <ButtonLink href={site.telegram}>Telegram</ButtonLink>
          <ButtonLink href={`mailto:${site.email}`} tone="secondary">{site.email}</ButtonLink>
        </div>
      </div>
    </section>
  );
}
