import { ServicesListSection } from '../sections/services/ServicesListSection';

export function ServicesPage() {
  return (
    <>
      <section className="container page-hero">
        <p className="eyebrow">Services</p>
        <h1 className="page-title">Service page headline</h1>
        <p className="lead">
          A concise overview of the problems this page will cover, who the services are for, and what kind of outcomes
          a client can expect.
        </p>
      </section>

      <ServicesListSection />
    </>
  );
}
