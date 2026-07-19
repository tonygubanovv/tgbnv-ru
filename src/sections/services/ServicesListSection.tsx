import { ServiceCard } from '../../components/ui/ServiceCard';

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
