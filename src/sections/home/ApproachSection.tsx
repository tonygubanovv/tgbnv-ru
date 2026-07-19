import { SectionHeader } from '../../components/ui/SectionHeader';

const steps = [
  {
    title: 'First step',
    description: 'A short explanation of what happens first and what becomes clearer after this stage.'
  },
  {
    title: 'Second step',
    description: 'A practical note about how the work is organized and what inputs are needed.'
  },
  {
    title: 'Third step',
    description: 'A result-oriented description of what the client receives and how it can be used.'
  }
];

export function ApproachSection() {
  return (
    <section className="section">
      <div className="container">
        <SectionHeader
          eyebrow="Approach"
          title="Process section headline"
          description="A concise explanation of how you make work clear, structured, and manageable."
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
