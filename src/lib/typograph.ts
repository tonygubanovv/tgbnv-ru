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
