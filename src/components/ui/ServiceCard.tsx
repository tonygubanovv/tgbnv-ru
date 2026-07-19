interface ServiceCardProps {
  number: number;
  title: string;
  description: string | string[];
}

export function ServiceCard({ number, title, description }: ServiceCardProps) {
  return (
    <article className="card service-card">
      <span className="card-number">{String(number).padStart(2, '0')}</span>
      <h3>{title}</h3>
      {Array.isArray(description)
        ? description.map((paragraph) => <p key={paragraph}>{paragraph}</p>)
        : <p>{description}</p>}
    </article>
  );
}
