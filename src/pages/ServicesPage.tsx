import { typographText as tx } from '../lib/typograph';
import { ServicesListSection } from '../sections/services/ServicesListSection';

export function ServicesPage() {
  return (
    <>
      <section className="container page-hero">
        <p className="eyebrow">{tx('Услуги')}</p>
        <h1 className="page-title">{tx('Направления, где могу быть полезен')}</h1>
        <p className="lead">
          {tx('Можно подключиться к отдельной задаче или разобрать путь клиента целиком: от первого знакомства с продуктом до заявки, аналитики и следующих улучшений.')}
        </p>
      </section>

      <ServicesListSection />
    </>
  );
}
