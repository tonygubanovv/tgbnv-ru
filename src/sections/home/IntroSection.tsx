import { typographText as tx } from '../../lib/typograph';

export function IntroSection() {
  return (
    <section className="section">
      <div className="container split-section">
        <div>
          <p className="eyebrow">{tx('Профиль')}</p>
          <h2>{tx('Маркетинг, продукт и технологии в одной рабочей системе')}</h2>
        </div>
        <div className="section-copy text-stack">
          <p>{tx('Основной фокус — сложные продукты, которые нужно быстро и точно объяснить клиенту, партнеру или рынку.')}</p>
          <p>
            {tx('В работе важны позиционирование, сайт, аналитика, SEO и контент, который помогает принять решение, а не просто заполняет страницы.')}
          </p>
          <p>
            {tx('На сайте собраны профессиональный профиль, заметки и рабочие наблюдения о B2B-маркетинге, кибербезопасности и digital-практике.')}
          </p>
        </div>
      </div>
    </section>
  );
}
