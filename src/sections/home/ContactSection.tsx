import { ButtonLink } from '../../components/ui/ButtonLink';
import { site } from '../../config/site';

export function ContactSection() {
  return (
    <section className="section">
      <div className="container contact-band">
        <div>
          <p className="eyebrow">Contact</p>
          <h2>Contact section headline</h2>
          <p>
            A short note about what kind of questions are worth discussing and what to include in the first message.
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
