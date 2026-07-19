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
          <p className="eyebrow">Personal site</p>
          <h1 className="page-title">
            Clear headline about <span className="hero-title-accent">your work</span>
          </h1>
          <p className="lead">
            A short, human introduction for the homepage. Use this space to explain what you do, what kind of problems
            you work with, and why someone should continue reading.
          </p>
          <div className="hero-actions">
            <ButtonLink href={relativeHref(route, '/services/')}>Services</ButtonLink>
            <ButtonLink href={site.telegram} tone="secondary">Telegram</ButtonLink>
          </div>
        </div>

        <aside className="hero-note" aria-label="Quick facts">
          <p className="hero-note-label">Quick facts</p>
          <dl>
            <div>
              <dt>Focus</dt>
              <dd>A short line about your main professional direction.</dd>
            </div>
            <div>
              <dt>Experience</dt>
              <dd>A practical detail you can later replace with a real achievement.</dd>
            </div>
            <div>
              <dt>Contact</dt>
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
