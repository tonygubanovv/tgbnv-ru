import { ButtonLink } from '../../components/ui/ButtonLink';
import { site } from '../../config/site';

export function ContactSection() {
  return (
    <section className="section">
      <div className="container contact-band">
        <div>
          <p className="eyebrow">Контакт</p>
          <h2>Заголовок блока контакта</h2>
          <p>
            Описание рыба-текстом. Здесь можно написать, с какими вопросами лучше обращаться и что прислать первым
            сообщением.
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
