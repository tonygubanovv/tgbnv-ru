import { ButtonLink } from '../../components/ui/ButtonLink';
import { SectionHeader } from '../../components/ui/SectionHeader';
import { resumeHighlights, resumeSummary } from '../../content/resume';
import { relativeHref } from '../../lib/relativeHref';
import { typographText as tx } from '../../lib/typograph';

interface ResumePreviewSectionProps {
  route: string;
}

export function ResumePreviewSection({ route }: ResumePreviewSectionProps) {
  return (
    <section className="section surface-soft">
      <div className="container">
        <SectionHeader
          eyebrow={tx('Резюме')}
          title={tx('Профессиональный профиль вместо витрины услуг')}
          description={resumeSummary}
        />

        <div className="resume-highlight-grid">
          {resumeHighlights.map((item, index) => (
            <article className="resume-highlight" key={item}>
              <span>{String(index + 1).padStart(2, '0')}</span>
              <p>{item}</p>
            </article>
          ))}
        </div>

        <div className="section-action">
          <ButtonLink href={relativeHref(route, '/resume/')} tone="secondary">{tx('Открыть резюме')}</ButtonLink>
        </div>
      </div>
    </section>
  );
}
