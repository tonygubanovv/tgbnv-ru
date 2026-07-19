import { ButtonLink } from '../components/ui/ButtonLink';
import { site } from '../config/site';
import { resumeCertifications, resumeExperience, resumeHighlights, resumeMeta, resumeSkills, resumeSummary } from '../content/resume';
import { typographText as tx } from '../lib/typograph';

export function ResumePage() {
  return (
    <>
      <section className="container page-hero resume-hero">
        <p className="eyebrow">{tx('Резюме')}</p>
        <h1 className="page-title">{tx('Губанов Антон, digital-маркетолог')}</h1>
        <p className="lead">{resumeSummary}</p>
        <div className="hero-actions">
          <ButtonLink href={site.contactTelegram}>Telegram</ButtonLink>
          <ButtonLink href={`mailto:${site.email}`} tone="secondary">{site.email}</ButtonLink>
        </div>
      </section>

      <section className="section">
        <div className="container resume-layout">
          <div className="resume-main">
            <h2>{tx('Опыт и фокус')}</h2>
            <div className="resume-timeline">
              {resumeExperience.map((item) => (
                <article className="resume-entry" key={`${item.company}-${item.period}`}>
                  <p className="resume-period">{item.period}</p>
                  <p className="resume-company">{item.company}</p>
                  <h3>{item.role}</h3>
                  <p>{item.description}</p>
                </article>
              ))}
            </div>
          </div>

          <aside className="resume-aside">
            <h2>{tx('Параметры')}</h2>
            <ul className="resume-list">
              {resumeMeta.map((item) => (
                <li key={item}>{item}</li>
              ))}
            </ul>

            <h2>{tx('Ключевые зоны')}</h2>
            <ul className="resume-list">
              {resumeHighlights.map((item) => (
                <li key={item}>{item}</li>
              ))}
            </ul>

            <h2>{tx('Навыки')}</h2>
            <div className="skill-tags">
              {resumeSkills.map((skill) => (
                <span key={skill}>{skill}</span>
              ))}
            </div>

            <h2>{tx('Сертификаты')}</h2>
            <ul className="resume-list">
              {resumeCertifications.map((item) => (
                <li key={item}>{item}</li>
              ))}
            </ul>
          </aside>
        </div>
      </section>
    </>
  );
}
