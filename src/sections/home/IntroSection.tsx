import { typographText as tx } from '../../lib/typograph';

export function IntroSection() {
  return (
    <section className="section">
      <div className="container split-section">
        <div>
          <p className="eyebrow">{tx('Обо мне')}</p>
          <h2>{tx('Работаю на стыке маркетинга, продукта и технологий')}</h2>
        </div>
        <div className="section-copy text-stack">
          <p>{tx('Основной фокус — сложные продукты, которые трудно быстро объяснить клиенту, партнеру или рынку.')}</p>
          <p>
            {tx('В работе важны понятное позиционирование, удобный сайт, корректная аналитика и контент, который помогает принять решение, а не просто заполняет страницы.')}
          </p>
          <p>
            {tx('На этом сайте будут заметки, разборы, подходы к работе и примеры задач, которые помогают думать о продукте системно.')}
          </p>
        </div>
      </div>
    </section>
  );
}
