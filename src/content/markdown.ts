import fs from 'node:fs/promises';
import path from 'node:path';
import matter from 'gray-matter';
import { marked } from 'marked';
import type { BlogItem, CaseItem, ContentItem, SiteData } from '../types';
import { site } from './site';

interface Frontmatter {
  title: string;
  description: string;
  pubDate: string | Date;
  updatedDate?: string | Date;
  image?: string;
  imageAlt?: string;
  tags?: string[];
  draft?: boolean;
  telegram?: boolean;
  client?: string;
  result?: string;
}

const contentRoot = path.join(process.cwd(), 'src', 'content');

function toSlug(fileName: string) {
  return fileName.replace(/\.(md|mdx)$/i, '');
}

function toIsoDate(value: string | Date) {
  return new Date(value).toISOString();
}

async function readCollection(collection: 'blog' | 'cases'): Promise<Array<BlogItem | CaseItem>> {
  const dir = path.join(contentRoot, collection);
  const files = (await fs.readdir(dir)).filter((file) => /\.mdx?$/i.test(file));
  const items = await Promise.all(
    files.map(async (file) => {
      const source = await fs.readFile(path.join(dir, file), 'utf8');
      const parsed = matter(source);
      const data = parsed.data as Frontmatter;
      const base: ContentItem = {
        collection,
        slug: toSlug(file),
        title: data.title,
        description: data.description,
        pubDate: toIsoDate(data.pubDate),
        updatedDate: data.updatedDate ? toIsoDate(data.updatedDate) : undefined,
        image: data.image,
        imageAlt: data.imageAlt,
        tags: data.tags ?? [],
        draft: data.draft ?? false,
        telegram: data.telegram ?? false,
        html: addHeadingIds(marked.parse(parsed.content, { async: false }) as string)
      };

      if (collection === 'cases') {
        return {
          ...base,
          collection,
          client: data.client,
          result: data.result ?? ''
        } satisfies CaseItem;
      }

      return {
        ...base,
        collection
      } satisfies BlogItem;
    })
  );

  return items
    .filter((item) => !item.draft)
    .sort((a, b) => new Date(b.pubDate).valueOf() - new Date(a.pubDate).valueOf());
}

export async function loadSiteData(): Promise<SiteData> {
  const [blog, cases] = await Promise.all([readCollection('blog'), readCollection('cases')]);
  return {
    site,
    blog: blog as BlogItem[],
    cases: cases as CaseItem[]
  };
}

function addHeadingIds(html: string) {
  return html.replace(/<h([23])>(.*?)<\/h[23]>/g, (_match, level: string, text: string) => {
    const slug = text
      .replace(/<[^>]+>/g, '')
      .toLowerCase()
      .trim()
      .replace(/[^\p{Letter}\p{Number}]+/gu, '-')
      .replace(/^-|-$/g, '');

    return `<h${level} id="${slug}">${text}</h${level}>`;
  });
}
