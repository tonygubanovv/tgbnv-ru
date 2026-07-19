import { SectionHeader } from '../../components/ui/SectionHeader';
import { typographText as tx } from '../../lib/typograph';

const steps = [
  {
    title: tx('Разобраться в задаче'),
    description: tx('Определяется проблема, цель и ограничения. Проверяются сайт, данные, текущие материалы и пользовательский путь.')
  },
  {
    title: tx('Собрать решение'),
    description: tx('Формируется структура работ: что нужно исправить, что проверить и какие данные потребуются.')
  },
  {
    title: tx('Передать результат'),
    description: tx('На выходе — понятные рекомендации, прототип, структура, текст, настройка или готовое решение, которое можно использовать в работе.')
  }
] as const;

export function ApproachSection() {
  return (
    <section className="section">
      <div className="container">
        <SectionHeader
          eyebrow={tx('Подход')}
          title={tx('Сначала проблема, потом решение')}
          description={tx('Мне важно сначала понять контекст, данные и ограничения, а уже потом предлагать изменения.')}
        />

        <div className="grid three">
          {steps.map((step, index) => (
            <article className="step-item" key={step.title}>
              <div className="step-item-top">
                <span className="step-number">{String(index + 1).padStart(2, '0')}</span>
              </div>
              <h3>{step.title}</h3>
              <p>{step.description}</p>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
