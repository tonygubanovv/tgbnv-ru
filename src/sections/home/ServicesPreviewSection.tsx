import { SectionHeader } from '../../components/ui/SectionHeader';
import { ServiceCard } from '../../components/ui/ServiceCard';
import { relativeHref } from '../../lib/relativeHref';

interface ServicesPreviewSectionProps {
  route: string;
}

const services = [
  {
    title: 'Название услуги',
    description: 'Описание услуги рыба-текстом. Что входит, какой результат получает человек, когда стоит обратиться.'
  },
  {
    title: 'Название услуги',
    description: 'Описание услуги рыба-текстом. Здесь будет второй понятный блок без лишних деталей.'
  },
  {
    title: 'Название услуги',
    description: 'Описание услуги рыба-текстом. Можно заменить на конкретное направление работы.'
  }
];

export function ServicesPreviewSection({ route }: ServicesPreviewSectionProps) {
  return (
    <section className="section surface-soft">
      <div className="container">
        <SectionHeader
          eyebrow="Услуги"
          title="Заголовок блока услуг"
          description="Короткое описание рыба-текстом: какие направления есть и чем они полезны."
        />

        <div className="grid three">
          {services.map((service, index) => (
            <ServiceCard description={service.description} key={`${service.title}-${index}`} number={index + 1} title={service.title} />
          ))}
        </div>

        <div className="section-action">
          <a href={relativeHref(route, '/services/')}>Смотреть все услуги</a>
        </div>
      </div>
    </section>
  );
}
