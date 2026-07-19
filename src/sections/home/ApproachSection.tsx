import { SectionHeader } from '../../components/ui/SectionHeader';

const steps = [
  {
    title: 'Разобраться в задаче',
    description: 'Определяется проблема, цель и ограничения. Проверяются сайт, данные, текущие материалы и пользовательский путь.'
  },
  {
    title: 'Собрать решение',
    description: 'Формируется структура работ: что нужно исправить, что проверить и какие данные потребуются.'
  },
  {
    title: 'Передать результат',
    description: 'На выходе — понятные рекомендации, прототип, структура, текст, настройка или готовое решение, которое можно использовать в работе.'
  }
];

export function ApproachSection() {
  return (
    <section className="section">
      <div className="container">
        <SectionHeader
          eyebrow="Подход"
          title="Сначала проблема, потом решение"
          description="Мне важно сначала понять контекст, данные и ограничения, а уже потом предлагать изменения."
        />

        <div className="grid three">
          {steps.map((step, index) => (
            <article className="step-item" key={step.title}>
              <span>{String(index + 1).padStart(2, '0')}</span>
              <h3>{step.title}</h3>
              <p>{step.description}</p>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
