import { ServiceCard } from '../../components/ui/ServiceCard';

const services = [
  {
    title: 'Service title',
    description: 'A short service description with the problem, the process, and the expected result.'
  },
  {
    title: 'Service title',
    description: 'A second service description written as a useful placeholder, not generic filler.'
  },
  {
    title: 'Service title',
    description: 'A third service description that can later become a real offer or consulting format.'
  }
];

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
