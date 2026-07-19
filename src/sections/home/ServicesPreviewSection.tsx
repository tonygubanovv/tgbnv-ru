import { SectionHeader } from '../../components/ui/SectionHeader';
import { ServiceCard } from '../../components/ui/ServiceCard';
import { relativeHref } from '../../lib/relativeHref';

interface ServicesPreviewSectionProps {
  route: string;
}

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

export function ServicesPreviewSection({ route }: ServicesPreviewSectionProps) {
  return (
    <section className="section surface-soft">
      <div className="container">
        <SectionHeader
          eyebrow="Services"
          title="Service section headline"
          description="A compact summary of the service directions and why they matter."
        />

        <div className="grid three">
          {services.map((service, index) => (
            <ServiceCard description={service.description} key={`${service.title}-${index}`} number={index + 1} title={service.title} />
          ))}
        </div>

        <div className="section-action">
          <a href={relativeHref(route, '/services/')}>View all services</a>
        </div>
      </div>
    </section>
  );
}
