interface ServiceCardProps {
  number: number;
  title: string;
  description: string;
}

export function ServiceCard({ number, title, description }: ServiceCardProps) {
  return (
    <article className="card service-card">
      <span className="card-number">{String(number).padStart(2, '0')}</span>
      <h3>{title}</h3>
      <p>{description}</p>
    </article>
  );
}
