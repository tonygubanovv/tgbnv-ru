const shortWords = [
  'а',
  'в',
  'во',
  'да',
  'до',
  'за',
  'и',
  'из',
  'к',
  'ко',
  'ли',
  'на',
  'не',
  'ни',
  'но',
  'о',
  'об',
  'обо',
  'от',
  'по',
  'с',
  'со',
  'у',
  'я'
];

const shortWordPattern = new RegExp(`(^|[\\s([{«"'])(${shortWords.join('|')})\\s+`, 'giu');

export function typographText(text: string) {
  return text
    .replace(shortWordPattern, (_match, prefix: string, word: string) => `${prefix}${word}\u00a0`)
    .replace(/№\s+/g, '№\u00a0')
    .replace(/(\d)\s+(?=(?:%|₽|руб\.|км|м|см|мм)\b)/giu, '$1\u00a0');
}

export function typographHtml(html: string) {
  return html.replace(/>([^<]+)</g, (_match, text: string) => `>${typographText(text)}<`);
}

export function typographElement(root: ParentNode) {
  const walker = document.createTreeWalker(root, NodeFilter.SHOW_TEXT, {
    acceptNode(node) {
      const parent = node.parentElement;
      if (!parent) return NodeFilter.FILTER_REJECT;
      if (['SCRIPT', 'STYLE', 'NOSCRIPT'].includes(parent.tagName)) return NodeFilter.FILTER_REJECT;
      if (!node.nodeValue?.trim()) return NodeFilter.FILTER_REJECT;
      return NodeFilter.FILTER_ACCEPT;
    }
  });

  const nodes: Text[] = [];
  while (walker.nextNode()) nodes.push(walker.currentNode as Text);
  nodes.forEach((node) => {
    node.nodeValue = typographText(node.nodeValue ?? '');
  });
}
