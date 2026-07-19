interface ServiceCardProps {
  number: number;
  title: string;
  description: string | string[];
}

export function ServiceCard({ description, number, title }: ServiceCardProps) {
  return (
    <article className="card service-card">
      <div className="service-card-top">
        <span className="card-number">{String(number).padStart(2, '0')}</span>
      </div>
      <h3>{title}</h3>
      {Array.isArray(description)
        ? description.map((paragraph) => <p key={paragraph}>{paragraph}</p>)
        : <p>{description}</p>}
    </article>
  );
}
