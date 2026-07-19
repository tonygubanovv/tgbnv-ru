import { ServicesListSection } from '../sections/services/ServicesListSection';

export function ServicesPage() {
  return (
    <>
      <section className="container page-hero">
        <p className="eyebrow">Услуги</p>
        <h1 className="page-title">Заголовок страницы услуг</h1>
        <p className="lead">
          Описание рыба-текстом. Здесь будет короткое объяснение, какие задачи можно обсудить и для кого эти услуги.
        </p>
      </section>

      <ServicesListSection />
    </>
  );
}
