import type { CollectionEntry } from 'astro:content';

type DatedEntry = CollectionEntry<'blog'> | CollectionEntry<'cases'>;

export function byDateDesc(a: DatedEntry, b: DatedEntry) {
  return b.data.pubDate.valueOf() - a.data.pubDate.valueOf();
}

export function visibleEntry<T extends DatedEntry>(entry: T) {
  return !entry.data.draft;
}

export function entrySlug(entry: DatedEntry) {
  return entry.id.replace(/\.(md|mdx)$/i, '');
}

export function formatDate(date: Date) {
  return new Intl.DateTimeFormat('ru-RU', {
    day: 'numeric',
    month: 'long',
    year: 'numeric'
  }).format(date);
}
