import { SectionHeader } from '../../components/ui/SectionHeader';

export function CasesPlaceholderSection() {
  return (
    <section className="section surface-dark">
      <div className="container">
        <SectionHeader
          eyebrow="Кейсы"
          title="Заголовок будущего блока кейсов"
          description="Пока блог и кейсы убраны. Здесь позже можно вернуть карточки кейсов, когда будет понятен формат контента."
        />
      </div>
    </section>
  );
}
