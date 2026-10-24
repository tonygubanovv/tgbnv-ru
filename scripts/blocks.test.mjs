import test from 'node:test';
import { runInNewContext } from 'node:vm';
import assert from 'node:assert/strict';
import { parse, parseFragment, serialize } from 'parse5';
import { applyBlocks } from '../src/utils/blocks.ts';

// A fragment, not a whole page: these checks are about the article body, and a page without <body> carries no script.
const render = body => {
  const document = parseFragment(`<div class="prose">${body}</div>`);
  applyBlocks(document);
  return serialize(document);
};

test('Quote marker becomes a card whose speaker stands outside the quoted words', () => {
  const result = render('<p>:::цитата Иван Иванов, руководитель отдела</p><p>Текст <strong>цитаты</strong>.</p><p>:::</p>');
  assert.match(result, /<figure class="quote">\s*<blockquote>\s*<p>Текст <strong>цитаты<\/strong>\.<\/p>\s*<\/blockquote>\s*<figcaption class="quote-by">/u);
  assert.match(result, /<span class="quote-name">Иван Иванов<\/span>\s*<span class="quote-role">руководитель отдела<\/span><\/figcaption>/u);
  assert.doesNotMatch(result, /:::/u);
  // The HTML spec keeps an attribution out of the blockquote, so search engines quote the words and not the name.
  const quoted = /<blockquote>([\s\S]*?)<\/blockquote>/u.exec(result)?.[1] ?? '';
  assert.ok(quoted.includes('Текст'), 'the words are inside the blockquote');
  assert.ok(!quoted.includes('quote-name'), 'the speaker is not inside the blockquote');
});

test('Markers work without blank lines, and a note carries text only', () => {
  const result = render('<p>:::note Важно\nПервый абзац.\n\nВторой абзац.\n:::</p>');
  assert.match(result, /<aside class="note"><div class="note-body"><p>Важно<\/p><p>Первый абзац\./u);
  assert.match(result, /Второй абзац\.<\/p><\/div><\/aside>/u);
  assert.doesNotMatch(result, /note-title/u);
  // The round mark in the gutter is CSS decoration: no empty node of it travels in the page text.
  assert.doesNotMatch(result, /note-mark|aria-hidden/u);
  // Lines written straight under a marker stay one paragraph, and their words never grow together.
  assert.match(result, /Первый абзац\.\s+Второй абзац\./u);
});

test('An accent quote is the same card filled with the accent colour', () => {
  const result = render('<p>:::цитата-акцент Анна Петрова, основатель</p><p>Текст <em>цитаты</em>.</p><p>:::</p>');
  assert.match(result, /<figure class="quote accent">\s*<blockquote>\s*<p>Текст <em>цитаты<\/em>\.<\/p>\s*<\/blockquote>\s*<figcaption class="quote-by">\s*<span class="quote-name">Анна Петрова<\/span>\s*<span class="quote-role">основатель<\/span>/u);
  assert.match(render('<p>:::quote-accent Кто-то</p><p>Текст.</p><p>:::</p>'), /<figure class="quote accent">/u);
  // A bare :::акцент is not a block name: the card must stay a quote, so the old short word is not accepted.
  assert.match(render('<p>:::акцент Кто-то</p><p>Текст.</p><p>:::</p>'), /<p>:::акцент Кто-то<\/p>/u);
});

test('A picture with a caption becomes one figure, from an italic line or from the title', () => {
  const italic = render('<p><img src="/a.webp" alt="А"></p><p><em>Подпись курсивом.</em></p>');
  assert.equal(italic.match(/<figcaption>Подпись курсивом\.<\/figcaption>/gu)?.length, 1);
  assert.match(italic, /<figure><img src="\/a\.webp" alt="А">\s*<figcaption>/u);
  assert.doesNotMatch(italic, /<em>/u);
  const titled = render('<p><img src="/a.webp" alt="А" title="Подпись из title"></p>');
  assert.match(titled, /<figure><img src="\/a\.webp" alt="А">\s*<figcaption>Подпись из title<\/figcaption><\/figure>/u);
  assert.doesNotMatch(titled, /title="/u);
});

test('A broken marker stays on the page as the text he wrote', () => {
  const unclosed = render('<p>:::цитата Кто-то</p><p>Текст без конца.</p>');
  assert.match(unclosed, /<p>:::цитата Кто-то<\/p>/u);
  assert.match(unclosed, /<p>Текст без конца\.<\/p>/u);
  assert.doesNotMatch(unclosed, /blockquote/u);
  const unknown = render('<p>:::unknown Название</p><p>Текст.</p>');
  assert.match(unknown, /<p>:::unknown Название<\/p><p>Текст\.<\/p>/u);
  assert.doesNotMatch(unknown, /aside/u);
});

test('Only article content is rewritten, the rest of the page is untouched', () => {
  const outside = parse('<main><p>:::цитата Кто-то</p><p>Текст.</p><p>:::</p></main>');
  applyBlocks(outside);
  assert.match(serialize(outside), /<p>:::цитата Кто-то<\/p>/u);
  const code = render('<pre><code>:::цитата Кто-то\nТекст.\n:::</code></pre>');
  assert.match(code, /:::цитата Кто-то\nТекст\.\n:::/u);
  assert.doesNotMatch(code, /blockquote/u);
});

test('A marker after a word hides the note in a card', () => {
  const result = render('<p>Мы меряем UTM{{метка в адресе ссылки}} в кампаниях.</p>');
  assert.match(result, /Мы меряем <span class="tip"><span tabindex="0" aria-describedby="tip-1" class="tip-term">UTM<\/span><span class="tip-bubble" role="note" aria-label="Пояснение" id="tip-1"> метка в адресе ссылки<\/span>/u);
  assert.match(result, /<\/span> в кампаниях\.<\/p>/u);
  assert.doesNotMatch(result, /\{\{/u);
  // The card is not part of the sentence: with the hidden card taken away the words read in their own order.
  const visible = result.replace(/<span class="tip-bubble"[\s\S]*?<\/span>/gu, '').replace(/<[^>]+>/gu, '');
  assert.match(visible, /Мы меряем UTM в кампаниях\./u);
  // A crawler that only strips the tags reads two words here, not one long one.
  assert.match(result.replace(/<[^>]+>/gu, ''), /UTM метка в адресе ссылки/u);
});

test('The dot after the word stays in the sentence, a marked-up word becomes the hint itself', () => {
  const fullStop = render('<p>Метрика.{{счётник на сайте}}</p>');
  assert.match(fullStop, /<span tabindex="0" aria-describedby="tip-1" class="tip-term">Метрика<\/span><span class="tip-bubble" role="note" aria-label="Пояснение" id="tip-1"> счётник на сайте<\/span><\/span>\./u);
  const bold = render('<p>Про <strong>лид</strong>{{клик по объявлению}}</p>');
  assert.match(bold, /<span class="tip"><strong tabindex="0" aria-describedby="tip-1" class="tip-term">лид<\/strong>/u);
});

test('Two markers on one line get their own cards, and each card is numbered', () => {
  const result = render('<p>Лид{{кто оставил заявку}} и UTM{{метка в ссылке}}</p>');
  assert.equal(result.match(/class="tip-bubble"/gu)?.length, 2);
  assert.match(result, /aria-describedby="tip-2"/u);
});

test('A marker with nothing to hide, no word before it, or no closing brace stays as written', () => {
  assert.match(render('<p>Пусто {{}} тут.</p>'), /<p>Пусто \{\{\}\} тут\.<\/p>/u);
  assert.match(render('<p>{{пояснение}} в начале строки.</p>'), /<p>\{\{пояснение\}\} в начале строки\.<\/p>/u);
  assert.match(render('<p>Сломанное {{пояснение</p>'), /\{\{пояснение<\/p>/u);
});

test('A hidden note may carry a link, and the link keeps working inside the card', () => {
  const result = render('<p>Мы меряем UTM{{метка в <a href="https://example.com" target="_blank" rel="noopener noreferrer">адресе</a> ссылки}} в кампаниях.</p>');
  assert.match(result, /<span class="tip-bubble" role="note" aria-label="Пояснение" id="tip-1"> метка в <a href="https:\/\/example\.com" target="_blank" rel="noopener noreferrer">адресе<\/a> ссылки<\/span>/u);
  assert.match(result, /Мы меряем <span class="tip"><span tabindex="0" aria-describedby="tip-1" class="tip-term">UTM<\/span>/u);
  assert.doesNotMatch(result, /\{\{|\}\}/u);
  assert.match(result, /<\/span> в кампаниях\.<\/p>/u);
});

test('Markdown glues a bare address and the closing braces into one link: the card still opens, the address stays clean', () => {
  const result = render('<p>Бот на базе Salesbot{{Именно Salesbot, а не Salebot от <a href="https://salebot.pro%7D%7D" target="_blank" rel="noopener noreferrer">https://salebot.pro}}</a>, то источники теряются.</p>');
  assert.match(result, /<span class="tip-bubble" role="note" aria-label="Пояснение" id="tip-1"> Именно Salesbot, а не Salebot от <a href="https:\/\/salebot\.pro" target="_blank" rel="noopener noreferrer">https:\/\/salebot\.pro<\/a><\/span>/u);
  assert.match(result, /class="tip-term">Salesbot<\/span>/u);
  assert.doesNotMatch(result, /%7D|salebot\.pro\}\}/u);
  assert.match(result, /<\/span>, то источники теряются\.<\/p>/u);
});

test('A card opened by a tap goes away as soon as the page scrolls', () => {
  const page = parse('<html><body><div class="prose"><p>Термин{{пояс}}</p></div></body></html>');
  applyBlocks(page);
  const html = serialize(page);
  assert.match(html, /addEventListener\('scroll', closeOnScroll/u);
  assert.match(html, /passive: true, capture: true/u);
  // Hover survives the scroll on both a cursor and a finger, so the close stows every card and only a new
  // pointer, keyboard or tap wakes it again; the word the keyboard reader sits on keeps its card.
  assert.match(html, /setAttribute\('data-tip-stowed'/u);
  assert.match(html, /removeAttribute\('data-tip-stowed'/u);
  assert.match(html, /addEventListener\('pointermove'/u);
  assert.match(html, /pointerType === 'mouse'/u);
  assert.match(html, /activeElement[\s\S]*closest\('\.tip'\)/u);
});

test('Headings, code and links never take the marker, and the page gets the tap script once', () => {
  const page = parse('<html><body><div class="prose"><h2>Заголовок{{пояс}}</h2><p><code>UTM{{пояс}}</code></p><p><a href="https://example.com">ссылка{{пояс}}</a></p><p>Обычный термин{{пояс}}</p></div></body></html>');
  applyBlocks(page);
  const html = serialize(page);
  assert.match(html, /<h2>Заголовок\{\{пояс\}\}<\/h2>/u);
  assert.match(html, /<code>UTM\{\{пояс\}\}<\/code>/u);
  assert.match(html, /<a href="https:\/\/example\.com">ссылка\{\{пояс\}\}<\/a>/u);
  assert.equal(html.match(/class="tip-term"/gu)?.length, 1);
  // The script travels with the marker, keeps its own text intact and appears once per page.
  assert.equal(html.match(/querySelectorAll\('\.tip'\)/gu)?.length, 1);
  assert.doesNotMatch(html, /&lt;/u);
});

test('A spoiler keeps its words in the sentence and only the cover is added', () => {
  const result = render('<p>Я проверил логи: ==ИИ-шкам на него абсолютно плевать)== внутри.</p>');
  assert.match(result, /<span class="spoiler"><span class="spoiler-text">ИИ-шкам на него абсолютно плевать\)<\/span><\/span> внутри\./u);
  assert.doesNotMatch(result, /==/u);
  // A crawler that only takes the tags away reads the whole sentence, the covered words included.
  assert.equal(result.replace(/<[^>]+>/gu, ''), 'Я проверил логи: ИИ-шкам на него абсолютно плевать) внутри.');
});

test('Markdown cuts a line with emphasis into pieces: the cover still spans them', () => {
  const result = render('<p><strong>Спойлер:</strong> ==вот <em>что</em> было внутри==.</p>');
  assert.match(result, /<strong>Спойлер:<\/strong> <span class="spoiler"><span class="spoiler-text">вот <em>что<\/em> было внутри<\/span><\/span>\./u);
  // A link written between the markers stays a link, so the revealed sentence still works.
  assert.match(render('<p>==ответ в <a href="https://example.com">логах</a>==.</p>'), /<span class="spoiler-text">ответ в <a href="https:\/\/example\.com">логах<\/a><\/span>/u);
});

test('Several spoilers on one page each get their own cover', () => {
  const result = render('<p>Первый ==скрыт== и второй ==тоже скрыт==.</p><p>Третий ==в другом абзаце==.</p>');
  assert.equal(result.match(/class="spoiler-text"/gu)?.length, 3);
  assert.match(result, /Первый <span class="spoiler">.*<\/span> и второй <span class="spoiler">/u);
});

test('A marker with nothing to hide or no pair at the end stays as written', () => {
  assert.match(render('<p>Пусто ==== тут.</p>'), /<p>Пусто ==== тут\.<\/p>/u);
  assert.match(render('<p>Сломанное ==метка</p>'), /<p>Сломанное ==метка<\/p>/u);
});

test('The spoiler never takes a heading, code or a link, and its scripts come once', () => {
  const page = parse('<html><head></head><body><div class="prose"><h2>Заголовок ==пояс==</h2><p><code>a == b</code></p><p><a href="https://example.com">ссылка ==пояс==</a></p><p>Обычные ==слова==.</p></div></body></html>');
  applyBlocks(page);
  const html = serialize(page);
  assert.match(html, /<h2>Заголовок ==пояс==<\/h2>/u);
  assert.match(html, /<code>a == b<\/code>/u);
  assert.match(html, /<a href="https:\/\/example\.com">ссылка ==пояс==<\/a>/u);
  assert.equal(html.match(/class="spoiler"/gu)?.length, 1);
  // The cover is switched on in the head before the article paints, and the tap script travels with the marker.
  assert.equal(html.match(/dataset\.spoiler = 'on'/gu)?.length, 1);
  assert.ok(html.indexOf("dataset.spoiler = 'on'") < html.indexOf('class="prose"'), 'the flag must come before the article');
  assert.equal(html.match(/querySelectorAll\('\.spoiler'\)/gu)?.length, 1);
});

test('A page with a card but no inline markers ships no script at all', () => {
  const page = parse('<html><head></head><body><div class="prose"><p>:::заметка Важно</p><p>:::</p></div></body></html>');
  applyBlocks(page);
  assert.doesNotMatch(serialize(page), /<script>/u);
});


test('Spoilers reveal independently, restore inner links and stop handling Space after opening', () => {
  const page = parse('<html><head></head><body><div class="prose"><p>==first== ==second==</p></div></body></html>');
  applyBlocks(page);
  const scripts = [...serialize(page).matchAll(/<script>([\s\S]*?)<\/script>/gu)].map(match => match[1]);
  const node = () => ({
    attrs: new Map(), listeners: new Map(),
    setAttribute(key, value) { this.attrs.set(key, value); },
    getAttribute(key) { return this.attrs.get(key) ?? null; },
    hasAttribute(key) { return this.attrs.has(key); },
    removeAttribute(key) { this.attrs.delete(key); },
    addEventListener(key, handler) { this.listeners.set(key, handler); },
    removeEventListener(key) { this.listeners.delete(key); },
    click() { this.listeners.get('click')?.({ preventDefault() {} }); },
    after(item) { this.announcement = item; },
  });
  const covers = ['first', 'second'].map(text => {
    const cover = node(), words = node(), link = node();
    link.setAttribute('tabindex', '2');
    words.textContent = text;
    words.querySelectorAll = () => [link];
    cover.querySelector = () => words;
    return Object.assign(cover, { words, link });
  });
  runInNewContext(scripts.find(script => script.includes("querySelectorAll('.spoiler')")), {
    document: { querySelectorAll: () => covers, createElement: node },
    requestAnimationFrame: callback => callback(),
  });
  assert.equal(covers[0].words.getAttribute('aria-hidden'), 'true');
  assert.equal(covers[0].link.getAttribute('tabindex'), '-1');
  covers[0].listeners.get('keydown')({ key: 'Enter', preventDefault() {} });
  assert.equal(covers[0].getAttribute('data-spoiler-open'), 'true');
  assert.equal(covers[0].words.getAttribute('aria-hidden'), null);
  assert.equal(covers[0].link.getAttribute('tabindex'), '2');
  assert.equal(covers[0].getAttribute('role'), null);
  assert.equal(covers[0].listeners.has('keydown'), false);
  assert.equal(covers[0].announcement.textContent, 'Спойлер раскрыт');
  assert.equal(covers[1].hasAttribute('data-spoiler-open'), false);
  covers[1].listeners.get('keydown')({ key: ' ', preventDefault() {} });
  assert.equal(covers[1].words.getAttribute('aria-hidden'), null);
  assert.doesNotMatch(scripts.join(''), /localStorage|sessionStorage|document\.cookie/u);
});
