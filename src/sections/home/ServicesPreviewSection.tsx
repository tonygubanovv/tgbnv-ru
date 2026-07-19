import { SectionHeader } from '../../components/ui/SectionHeader';
import { ServiceCard } from '../../components/ui/ServiceCard';
import { relativeHref } from '../../lib/relativeHref';

interface ServicesPreviewSectionProps {
  route: string;
}

const services = [
  {
    title: 'Сайт и структура',
    description: [
      'Анализ страниц, навигации, форм, пользовательских сценариев и логики подачи продукта.',
      'На выходе — список конкретных изменений, которые помогут сделать сайт понятнее, удобнее и полезнее для продаж.'
    ]
  },
  {
    title: 'SEO и контент',
    description: [
      'Работа со структурой страниц, поисковыми запросами, метаданными, микроразметкой и текстами.',
      'Цель — повысить видимость сайта и помочь пользователю быстрее найти нужную информацию.'
    ]
  },
  {
    title: 'Аналитика и точки роста',
    description: [
      'Настройка и проверка аналитики, событий, целей и пользовательских сценариев.',
      'Результат — понимание, откуда приходят пользователи, где теряются и какие изменения стоит проверять в первую очередь.'
    ]
  }
];

export function ServicesPreviewSection({ route }: ServicesPreviewSectionProps) {
  return (
    <section className="section surface-soft">
      <div className="container">
        <SectionHeader
          eyebrow="Чем могу быть полезен"
          title="Прикладная помощь с сайтом, контентом и аналитикой"
          description="Это не витрина пакетов, а направления задач, с которыми можно обратиться, если нужно спокойно разобраться и принять решение."
        />

        <div className="grid three">
          {services.map((service, index) => (
            <ServiceCard description={service.description} key={`${service.title}-${index}`} number={index + 1} title={service.title} />
          ))}
        </div>

        <div className="section-action">
          <a href={relativeHref(route, '/services/')}>Все услуги</a>
        </div>
      </div>
    </section>
  );
}
