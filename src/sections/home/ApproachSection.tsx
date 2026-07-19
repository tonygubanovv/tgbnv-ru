import { SectionHeader } from '../../components/ui/SectionHeader';

const steps = [
  {
    title: 'Шаг первый',
    description: 'Описание рыба-текстом. Что происходит на первом этапе и какой результат появляется.'
  },
  {
    title: 'Шаг второй',
    description: 'Описание рыба-текстом. Как устроена работа, какие материалы нужны, как принимаются решения.'
  },
  {
    title: 'Шаг третий',
    description: 'Описание рыба-текстом. Что человек получает в конце и как это можно использовать дальше.'
  }
];

export function ApproachSection() {
  return (
    <section className="section">
      <div className="container">
        <SectionHeader
          eyebrow="Подход"
          title="Заголовок блока про процесс"
          description="Короткое описание рыба-текстом: как вы работаете, чтобы задача была понятной и управляемой."
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
