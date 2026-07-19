import { ServicesListSection } from '../sections/services/ServicesListSection';

export function ServicesPage() {
  return (
    <>
      <section className="container page-hero">
        <p className="eyebrow">Услуги</p>
        <h1 className="page-title">Направления, где могу быть полезен</h1>
        <p className="lead">
          Можно подключиться к отдельной задаче или разобрать путь клиента целиком: от первого знакомства с продуктом до
          заявки, аналитики и следующих улучшений.
        </p>
      </section>

      <ServicesListSection />
    </>
  );
}
