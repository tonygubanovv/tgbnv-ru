import { typographText as tx } from '../lib/typograph';

export function NotFoundPage() {
  return (
    <section className="container page-hero">
      <p className="eyebrow">404</p>
      <h1 className="page-title">{tx('Страница не найдена')}</h1>
      <p className="lead">{tx('Такой страницы на сайте пока нет.')}</p>
    </section>
  );
}
