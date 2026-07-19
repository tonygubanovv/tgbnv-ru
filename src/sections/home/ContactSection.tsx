import { ButtonLink } from '../../components/ui/ButtonLink';
import { site } from '../../config/site';

export function ContactSection() {
  return (
    <section className="section">
      <div className="container contact-band">
        <div>
          <p className="eyebrow">Контакты</p>
          <h2>Можно обсудить задачу</h2>
          <p>
            Лучше сразу написать, что хочется улучшить, какой продукт или сайт рассматривается и какой результат нужен.
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
