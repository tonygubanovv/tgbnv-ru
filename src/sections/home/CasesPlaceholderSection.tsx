import { SectionHeader } from '../../components/ui/SectionHeader';

export function CasesPlaceholderSection() {
  return (
    <section className="section surface-dark">
      <div className="container">
        <SectionHeader
          eyebrow="Проекты"
          title="Разборы, проекты и рабочие заметки"
          description="Здесь позже будут собраны примеры задач, наблюдения и выводы по сайтам, аналитике, SEO, B2B-маркетингу и ИИ-видимости."
        />
      </div>
    </section>
  );
}
