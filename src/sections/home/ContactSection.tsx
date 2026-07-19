import { ButtonLink } from '../../components/ui/ButtonLink';
import { site } from '../../config/site';
import { typographText as tx } from '../../lib/typograph';

export function ContactSection() {
  return (
    <section className="section contact-section">
      <div className="container contact-band">
        <div>
          <p className="eyebrow">{tx('Контакты')}</p>
          <h2>{tx('Связаться со мной')}</h2>
          <p>
            {tx('Для связи удобнее Telegram. Почта тоже доступна, если нужен более формальный формат переписки.')}
          </p>
        </div>

        <div className="contact-actions">
          <ButtonLink href={site.contactTelegram}>Telegram</ButtonLink>
          <ButtonLink href={`mailto:${site.email}`} tone="secondary">{site.email}</ButtonLink>
        </div>
      </div>
    </section>
  );
}
