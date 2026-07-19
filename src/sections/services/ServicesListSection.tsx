import { ServiceCard } from '../../components/ui/ServiceCard';

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
