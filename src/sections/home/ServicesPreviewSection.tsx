import { SectionHeader } from '../../components/ui/SectionHeader';
import { ServiceCard } from '../../components/ui/ServiceCard';
import { services } from '../../content/services';
import { relativeHref } from '../../lib/relativeHref';
import { typographText as tx } from '../../lib/typograph';

interface ServicesPreviewSectionProps {
  route: string;
}

export function ServicesPreviewSection({ route }: ServicesPreviewSectionProps) {
  return (
    <section className="section surface-soft">
      <div className="container">
        <SectionHeader
          eyebrow={tx('Чем могу быть полезен')}
          title={tx('Прикладная помощь с сайтом, контентом и аналитикой')}
          description={tx('Это не витрина пакетов, а направления задач, с которыми можно обратиться, если нужно спокойно разобраться и принять решение.')}
        />

        <div className="grid three">
          {services.map((service, index) => (
            <ServiceCard description={service.description} key={`${service.title}-${index}`} number={index + 1} title={service.title} />
          ))}
        </div>

        <div className="section-action">
          <a href={relativeHref(route, '/services/')}>{tx('Все услуги')}</a>
        </div>
      </div>
    </section>
  );
}
