import { typographText as tx } from '../../lib/typograph';

export function IntroSection() {
  return (
    <section className="section">
      <div className="container split-section">
        <div>
          <p className="eyebrow">{tx('О странице')}</p>
          <h2>{tx('Личный сайт про опыт, работу и заметки в digital')}</h2>
        </div>
        <div className="section-copy text-stack">
          <p>{tx('Я занимаюсь digital-маркетингом и работаю со сложными B2B-продуктами, где важны понятная коммуникация, сайт, данные и системная работа с каналами.')}</p>
          <p>
            {tx('На этой странице — короткая навигация по моему профилю: резюме, опыт, результаты, контакты и Telegram-канал с рабочими наблюдениями.')}
          </p>
          <p>
            {tx('Формат сайта личный: профессиональный контекст, рабочие темы и ссылки, по которым можно быстро понять, чем я занимаюсь.')}
          </p>
        </div>
      </div>
    </section>
  );
}
