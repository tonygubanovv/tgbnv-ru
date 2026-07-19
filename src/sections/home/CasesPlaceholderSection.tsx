import { SectionHeader } from '../../components/ui/SectionHeader';
import { typographText as tx } from '../../lib/typograph';

export function CasesPlaceholderSection() {
  return (
    <section className="section section-dark projects-section">
      <div className="container">
        <SectionHeader
          eyebrow={tx('Проекты')}
          title={tx('Разборы, проекты и рабочие заметки')}
          description={tx('Здесь позже будут собраны примеры задач, наблюдения и выводы по сайтам, аналитике, SEO, B2B-маркетингу и ИИ-видимости.')}
        />
      </div>
    </section>
  );
}
