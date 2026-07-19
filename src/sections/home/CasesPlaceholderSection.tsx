import { SectionHeader } from '../../components/ui/SectionHeader';

export function CasesPlaceholderSection() {
  return (
    <section className="section surface-dark">
      <div className="container">
        <SectionHeader
          eyebrow="Work"
          title="Future work section headline"
          description="A placeholder for future case studies, selected projects, or notes once the content format is clear."
        />
      </div>
    </section>
  );
}
