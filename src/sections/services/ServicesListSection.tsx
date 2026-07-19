import { ServiceCard } from '../../components/ui/ServiceCard';
import { services } from '../../content/services';

export function ServicesListSection() {
  return (
    <section className="section">
      <div className="container">
        <div className="grid three">
          {services.map((service, index) => (
            <ServiceCard description={service.description} key={`${service.title}-${index}`} number={index + 1} title={service.title} />
          ))}
        </div>
      </div>
    </section>
  );
}
