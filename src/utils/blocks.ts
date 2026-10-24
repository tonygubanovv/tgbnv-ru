import { parseFragment, type DefaultTreeAdapterMap } from 'parse5';

type Element = DefaultTreeAdapterMap['element'];
type Node = DefaultTreeAdapterMap['node'];
type Child = Element['childNodes'][number];

/**
 * Blocks the owner writes in Markdown without HTML, inside an article:
 *   :::цитата Автор, роль         → a quote card on the plain surface (also :::quote)
 *   :::цитата-акцент Автор, роль  → the same card filled with the accent colour (also :::quote-accent)
 *   :::заметка                    → a note card, text only (also :::note)
 *   UTM{{расшифровка метки}}      → the word before the marker gets a hidden note card
 * Blank lines around the markers are optional: without them Markdown joins the marker and the text into one paragraph.
 * A marker with no closing ::: stays on the page as the text he wrote instead of swallowing the article.
 */
type Kind = 'quote' | 'accent' | 'note';
const KINDS: Record<string, Kind> = { quote: 'quote', цитата: 'quote', 'quote-accent': 'accent', 'цитата-акцент': 'accent', note: 'note', заметка: 'note' };
const MARKER = /^:::\s*(?:(\S+)(?:[ \t]+(.*))?)?$/iu;

/* The inline marker: two braces hold the hidden text, the word right before them is the visible hint.
   Trailing punctuation stays outside the hint, so «термин.{{…}}» underlines the word and not the dot.
   The hidden text may carry a link or bold words, and Markdown cuts the line into pieces exactly there,
   so the opening braces and the closing ones are allowed to sit in different pieces of the same line. */
const OPEN = '{{';
const CLOSE = '}}';
const TIP_WORD = /([^\s.,;:!?)\]]+)([.,;:!?)\]]*)$/u;
const TIP_HOST = new Set(['strong', 'em', 'b', 'i', 'code', 'dfn', 'abbr', 'span']);
/* Nothing inside these is marked: code keeps its own text, links stay clickable as they are,
   and a heading would repeat the marker in the contents, where only its plain words belong. */
const TIP_SKIP = new Set(['pre', 'code', 'script', 'style', 'svg', 'a', 'h1', 'h2', 'h3', 'h4', 'h5', 'h6']);

type Item = { block: { kind: Kind; rest: string; raw: string } } | { end: true } | { node: Child };
type Text = DefaultTreeAdapterMap['textNode'];
type Part = { node: Text; start: number };

const attribute = (node: Node, name: string) => 'attrs' in node ? node.attrs.find(item => item.name === name)?.value : undefined;
const isTag = (node: Node, tagName: string): node is Element => 'tagName' in node && node.tagName === tagName;
const visible = (node: Node) => !('value' in node) || node.value.trim() !== '';

/** The parent is corrected by move(), which is what actually attaches the node. */
const textNode = (value: string, parent: Element): DefaultTreeAdapterMap['textNode'] => ({ nodeName: '#text', value, parentNode: parent });

function shell(html: string): Element {
  const [node] = parseFragment(html).childNodes;
  if (!node || !('tagName' in node)) throw new Error(`Broken block template: ${html}`);
  return node;
}

function move(target: Element, nodes: Child[]): Element {
  for (const node of nodes) {
    (node as { parentNode?: Element }).parentNode = target;
    target.childNodes.push(node);
  }
  return target;
}

const labelled = (tagName: string, className: string, value: string): Element => {
  const node = shell(className ? `<${tagName} class="${className}"></${tagName}>` : `<${tagName}></${tagName}>`);
  return move(node, [textNode(value, node)]);
};

const setAttr = (node: Element, name: string, value: string): void => {
  const found = node.attrs.find(item => item.name === name);
  if (found) found.value = value;
  else node.attrs.push({ name, value });
};

const asTerm = (node: Element, id: string): Element => {
  setAttr(node, 'tabindex', '0');
  setAttr(node, 'aria-describedby', id);
  setAttr(node, 'class', `${attribute(node, 'class') ?? ''} tip-term`.trim());
  return node;
};

/** The card hangs off the word, so the line itself never moves. The space inside the card is for the raw page
    text: whatever reads the article with the tags taken away must not get the word and the note run together.
    The card is a block when it opens, so that space is never painted. */
function tipCard(id: string, hidden: Child[], term: Element): Element {
  const wrap = shell('<span class="tip"></span>');
  // Notes can contain real links: role=tooltip would incorrectly promise noninteractive content.
  const bubble = shell(`<span class="tip-bubble" role="note" aria-label="Пояснение" id="${id}"></span>`);
  return move(wrap, [term, move(bubble, [textNode(' ', bubble), ...hidden])]);
}

let tipSeq = 0;

/** The plain words of one element, joined so a marker can start in one piece of the line and end in another. */
function flowOf(parent: Element): { text: string; parts: Part[] } {
  const parts: Part[] = [];
  let text = '';
  for (const child of parent.childNodes) {
    if ('value' in child) { parts.push({ node: child, start: text.length }); text += child.value; }
  }
  return { text, parts };
}

function pieceAt(parts: Part[], position: number): Part {
  for (let index = parts.length - 1; index >= 0; index--) if (parts[index]!.start <= position) return parts[index]!;
  return parts[0]!;
}

const marked = (node: Child | undefined): Element | null => node && 'tagName' in node && TIP_HOST.has(node.tagName) ? node : null;

/** The text inside a written element that holds the closing braces, if any. */
function eatenBy(node: Element): Text | null {
  for (const child of node.childNodes) {
    if ('value' in child) { if (child.value.includes(CLOSE)) return child; }
    else if ('tagName' in child) { const found = eatenBy(child); if (found) return found; }
  }
  return null;
}

/* Markdown reads a bare address in the hidden text as a link and sticks the closing braces onto it,
   so only a link is allowed to finish a marker that opened in the plain words of the line. */
function linkAfter(siblings: Child[], first: number): Element | null {
  for (const node of siblings.slice(first + 1)) if (isTag(node, 'a') && eatenBy(node)) return node;
  return null;
}

/** The link that swallowed the marker keeps only its own address: braces belong to the marker, not to a URL. */
function spitOut(node: Text): void {
  const at = node.value.indexOf(CLOSE);
  node.value = node.value.slice(0, at) + node.value.slice(at + CLOSE.length);
  let up = node.parentNode as Node | null;
  while (up && 'tagName' in up) {
    const href = attribute(up, 'href');
    if (up.tagName === 'a' && href) setAttr(up, 'href', href.replace(/(?:%7D%7D|\}\})+$/iu, ''));
    up = up.parentNode as Node | null;
  }
}

const pieces = (value: string, parent: Element): Child[] => value ? [textNode(value, parent)] : [];

/** Turns the first whole marker of this element into a hint with a hidden card. A broken one is left as written. */
function oneTip(parent: Element): boolean {
  const { text, parts } = flowOf(parent);
  const siblings = [...parent.childNodes];
  let from = 0;
  for (;;) {
    const open = text.indexOf(OPEN, from);
    if (open === -1) return false;
    from = open + OPEN.length;
    const paired = text.indexOf(CLOSE, from);
    const between = paired === -1 ? '' : text.slice(from, paired);
    // A brace inside means these two openings are not one marker: only a clean pair of them hides a note.
    const close = paired !== -1 && !between.includes('{') && !between.includes('}') ? paired : -1;
    const piece = pieceAt(parts, open);
    const first = siblings.indexOf(piece.node);
    const before = piece.node.value.slice(0, open - piece.start);
    // The hint is the word standing right before the braces, or a bold or italic word the marker follows.
    const word = TIP_WORD.exec(before);
    const host = word?.[1] || before.trim() ? null : marked(siblings[first - 1]);
    if (!word?.[1] && !host) continue;
    const holder = close === -1 ? linkAfter(siblings, first) : null;
    if (close === -1 && !holder) continue;
    const last = close === -1 ? siblings.indexOf(holder!) : siblings.indexOf(pieceAt(parts, close).node);
    const openEnd = open - piece.start + OPEN.length;
    const hidden: Child[] = [];
    let tail = '';
    if (close === -1) {
      hidden.push(...pieces(piece.node.value.slice(openEnd), parent), ...siblings.slice(first + 1, last));
      spitOut(eatenBy(holder!)!);
      hidden.push(holder!);
    } else if (last === first) {
      hidden.push(...pieces(piece.node.value.slice(openEnd, close - piece.start), parent));
      tail = piece.node.value.slice(close - piece.start + CLOSE.length);
    } else {
      const end = pieceAt(parts, close);
      hidden.push(...pieces(piece.node.value.slice(openEnd), parent), ...siblings.slice(first + 1, last), ...pieces(end.node.value.slice(0, close - end.start), parent));
      tail = end.node.value.slice(close - end.start + CLOSE.length);
    }
    // The air around the hidden words is not part of them, and a note with no words of its own stays visible.
    while (hidden.length && !visible(hidden[0]!)) hidden.shift();
    while (hidden.length && !visible(hidden.at(-1)!)) hidden.pop();
    if (!hidden.length) continue;
    const id = `tip-${++tipSeq}`;
    const head = host ? before : before.slice(0, word!.index);
    const term = host ? asTerm(host, id) : asTerm(labelled('span', '', word![1]), id);
    const start = host ? first - 1 : first;
    parent.childNodes.splice(start, last - start + 1, ...pieces(head, parent), tipCard(id, hidden, term), ...pieces(host ? '' : word![2], parent), ...pieces(tail, parent));
    return true;
  }
}

function inlineTips(node: Element): number {
  const children = [...node.childNodes];
  let made = 0;
  while (oneTip(node)) made++;
  for (const child of children) if ('tagName' in child && !TIP_SKIP.has(child.tagName)) made += inlineTips(child);
  return made;
}

/* The HTML spec keeps a quote's author out of the quoted words: attribution must stand outside the
   blockquote, and a figure with its caption is the way to tie the two together. So the card is a figure,
   the words are a blockquote, and the speaker is the caption under them. */
function quoteCard(inner: Child[], rest: string, accent: boolean): Element {
  const card = shell(accent ? '<figure class="quote accent"></figure>' : '<figure class="quote"></figure>');
  const words = move(shell('<blockquote></blockquote>'), inner);
  const comma = rest.indexOf(',');
  const name = (comma === -1 ? rest : rest.slice(0, comma)).trim();
  const role = comma === -1 ? '' : rest.slice(comma + 1).trim();
  if (!name) return move(card, [words]);
  const by = move(shell('<figcaption class="quote-by"></figcaption>'), [labelled('span', 'quote-name', name)]);
  if (role) move(by, [textNode('\n', by), labelled('span', 'quote-role', role)]);
  return move(card, [words, textNode('\n', card), by]);
}

/** The mark in the gutter is decoration, so it lives in CSS and never in the page's text. */
function noteCard(inner: Child[], rest: string): Element {
  const card = shell('<aside class="note"><div class="note-body"></div></aside>');
  const body = card.childNodes[0] as Element;
  // A note has no heading of its own: any words left on the marker line stay ordinary text.
  if (rest.trim()) move(body, [labelled('p', '', rest.trim())]);
  move(body, inner);
  return card;
}

/** Cuts a paragraph at its marker lines, so a block can start straight under ::: without a blank line. */
function itemsOf(source: Element): Item[] {
  const items: Item[] = [];
  let inline: Child[] = [];
  const flush = () => {
    // Whitespace between the lines stays: it is the only separator between sentences written on different lines.
    while (inline.length && !visible(inline[0]!)) inline.shift();
    while (inline.length && !visible(inline.at(-1)!)) inline.pop();
    if (inline.some(visible)) items.push({ node: move(shell('<p></p>'), inline) });
    inline = [];
  };
  for (const child of source.childNodes) {
    if (!('value' in child)) {
      inline.push(child);
      continue;
    }
    for (const [position, line] of child.value.split('\n').entries()) {
      if (position) inline.push(textNode('\n', source));
      const match = MARKER.exec(line.trim());
      const kind = match?.[1] ? KINDS[match[1].toLowerCase()] : undefined;
      if (match && !match[1]) {
        flush();
        items.push({ end: true });
      } else if (match && kind) {
        flush();
        items.push({ block: { kind, rest: match[2] ?? '', raw: line.trim() } });
      } else if (line) inline.push(textNode(line, source));
    }
  }
  flush();
  return items;
}

function captionOf(node: Node | undefined): Child[] | null {
  if (!node || !isTag(node, 'p')) return null;
  const [child, ...rest] = node.childNodes.filter(visible);
  if (!child || !isTag(child, 'em') || rest.length) return null;
  return child.childNodes.filter(visible);
}

function figures(children: Child[]): void {
  for (let index = 0; index < children.length; index++) {
    const holder = children[index]!;
    if (!isTag(holder, 'p')) continue;
    const [image, ...rest] = holder.childNodes.filter(visible);
    if (!image || !isTag(image, 'img') || rest.length) continue;
    // The caption is the next element, whatever whitespace the renderer left between them.
    const next = children.findIndex((child, position) => position > index && visible(child));
    const following = next > index ? captionOf(children[next]) : null;
    const title = attribute(image, 'title');
    if (!following && !title) continue;
    if (title) image.attrs = image.attrs.filter(item => item.name !== 'title');
    const figure = shell('<figure></figure>');
    const caption = shell('<figcaption></figcaption>');
    move(caption, following ?? [textNode(title!, caption)]);
    move(figure, [image, textNode('\n', figure), caption]);
    children.splice(index, following ? next - index + 1 : 1, figure);
  }
}

function transform(prose: Element): number {
  const items = prose.childNodes.flatMap(child => (isTag(child, 'p') ? itemsOf(child) : [{ node: child }]));
  const result: Child[] = [];
  for (let index = 0; index < items.length; index++) {
    const item = items[index]!;
    if (!('block' in item)) {
      if ('node' in item) result.push(item.node);
      continue;
    }
    const inner: Child[] = [];
    let cursor = index;
    let closed = false;
    while (++cursor < items.length) {
      const next = items[cursor]!;
      if ('end' in next) {
        closed = true;
        break;
      }
      if ('block' in next) break;
      if ('node' in next) inner.push(next.node);
    }
    result.push(closed
      ? item.block.kind === 'note' ? noteCard(inner, item.block.rest) : quoteCard(inner, item.block.rest, item.block.kind === 'accent')
      : labelled('p', '', item.block.raw));
    if (closed) index = cursor;
  }
  const children = prose.childNodes;
  children.length = 0;
  children.push(...result);
  figures(children);
  return inlineTips(prose);
}

function walk(node: Node): number {
  if (!('childNodes' in node)) return 0;
  if ('tagName' in node && ['pre', 'code', 'script', 'style', 'svg'].includes(node.tagName)) return 0;
  if ('tagName' in node && (attribute(node, 'class') ?? '').split(/\s+/).includes('prose')) return transform(node);
  return [...node.childNodes].reduce((made, child) => made + walk(child), 0);
}

/** Touch has no hover, so a tap opens the card and the script keeps it inside the screen. Shipped only on pages that use the marker. */
const TIP_SCRIPT = `(function () {
  var tips = [].slice.call(document.querySelectorAll('.tip'));
  var edge = 8;
  // A card that a pointer holds open does not go away when the page moves: under a finger the hover sticks, on a
  // computer the cursor simply still sits on the word. So closing stows every card, and only a pointer or keyboard
  // that comes back to the word — or a new tap — clears the stow.
  function stow(tip) { tip.removeAttribute('data-tip-open'); tip.setAttribute('data-tip-stowed', 'true'); tip.querySelector('.tip-term').setAttribute('aria-expanded', 'false'); }
  function close() { tips.forEach(stow); }
  function release(tip) { tip.removeAttribute('data-tip-stowed'); tip.querySelector('.tip-term').setAttribute('aria-expanded', 'true'); }
  function place(tip) {
    var bubble = tip.querySelector('.tip-bubble');
    bubble.style.removeProperty('--tip-shift');
    tip.removeAttribute('data-tip-below');
    var box = bubble.getBoundingClientRect();
    // A card that is not on the screen yet has no box: there is nothing to keep inside it.
    if (!box.width) return;
    // The content box, not window.innerWidth: a scrollbar takes width that the page cannot paint into.
    var width = document.documentElement.clientWidth;
    var shift = edge > box.left ? edge - box.left : 0;
    if (width - edge < box.right) shift = width - edge - box.right;
    if (shift) bubble.style.setProperty('--tip-shift', Math.round(shift) + 'px');
    if (edge > box.top) tip.setAttribute('data-tip-below', 'true');
  }
  tips.forEach(function (tip) {
    tip.setAttribute('data-tip-ready', 'true');
    var term = tip.querySelector('.tip-term');
    var bubble = tip.querySelector('.tip-bubble');
    // Progressive disclosure: without JS the term remains focusable with a readable description.
    term.setAttribute('role', 'button');
    term.setAttribute('aria-controls', bubble.id);
    term.setAttribute('aria-expanded', 'false');
    term.removeAttribute('aria-describedby');
    function show() { release(tip); place(tip); }
    tip.addEventListener('pointerenter', function (event) { if (event.pointerType === 'mouse') show(); });
    tip.addEventListener('pointerleave', function () {
      if (!tip.contains(document.activeElement) && !tip.hasAttribute('data-tip-open')) stow(tip);
    });
    // After a scroll-close the cursor never left the word, so pointerenter will not come again: the first mouse
    // move over it wakes the card. A touch scroll also moves the pointer, so touches are deliberately left out.
    tip.addEventListener('pointermove', function (event) { if (event.pointerType === 'mouse') show(); });
    tip.addEventListener('focusin', show);
    tip.addEventListener('focusout', function (event) { if (!tip.contains(event.relatedTarget)) stow(tip); });
    term.addEventListener('keydown', function (event) {
      if (event.key === 'Enter' || event.key === ' ') { event.preventDefault(); term.click(); }
    });
    tip.addEventListener('click', function (event) {
      // A link written inside the hidden text stays a link: the tap that already opened the card must not eat it.
      if (event.target instanceof Element && event.target.closest('.tip-bubble')) return;
      event.preventDefault();
      var opened = tip.hasAttribute('data-tip-open');
      close();
      if (opened) return;
      release(tip);
      tip.setAttribute('data-tip-open', 'true');
      place(tip);
    });
  });
  document.addEventListener('click', function (event) {
    if (event.target instanceof Element && !event.target.closest('.tip')) close();
  });
  document.addEventListener('keydown', function (event) {
    if (event.key !== 'Escape') return;
    var held = document.activeElement instanceof Element ? document.activeElement.closest('.tip') : null;
    if (held && document.activeElement.closest('.tip-bubble')) held.querySelector('.tip-term').focus();
    close();
  });
  // A card belongs to the moment it was opened: once the page moves, it hangs over the wrong line, so it goes away.
  // Capture sees every scroller on the page, because a scroll event does not bubble.
  // A keyboard reader keeps the focus while the page moves under them, so the card of the focused word is left alone.
  function closeOnScroll() {
    var held = document.activeElement instanceof Element ? document.activeElement.closest('.tip') : null;
    tips.forEach(function (tip) { if (tip !== held) stow(tip); });
  }
  window.addEventListener('scroll', closeOnScroll, { passive: true, capture: true });
})()`;

function findByTag(node: Node, tagName: string): Element | null {
  if (isTag(node, tagName)) return node;
  if (!('childNodes' in node)) return null;
  for (const child of node.childNodes) {
    const found = findByTag(child, tagName);
    if (found) return found;
  }
  return null;
}

/** Rewrites the owner's block markers in the parsed page. Runs before typography so their wording is formatted too. */
export const applyBlocks = (root: Node): void => {
  tipSeq = 0;
  if (walk(root) === 0) return;
  const body = findByTag(root, 'body');
  if (body) move(body, [textNode('\n', body), shell(`<script>${TIP_SCRIPT}</script>`)]);
};
