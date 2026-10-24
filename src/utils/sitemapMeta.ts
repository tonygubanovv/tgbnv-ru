/** Sitemap metadata for the real pages of this site: publication dates and one priority scheme. */
import { readdirSync, readFileSync } from 'node:fs';

type Post = { path: string; lastmod: string };

const isoDate = (block: string, field: string) => block.match(new RegExp(`^${field}:\\s*"?(\\d{4}-\\d{2}-\\d{2})"?`, 'm'))?.[1];

// The content schema validates the same fields, so an unreadable date simply leaves the entry without lastmod.
function readPosts(directory: string, prefix: string): Post[] {
  let names: string[];
  try {
    names = readdirSync(directory);
  } catch {
    return [];
  }
  const posts: Post[] = [];
  for (const name of names.filter(entry => /^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(entry))) {
    const block = readFileSync(`${directory}/${name}/index.md`, 'utf8').match(/^---\r?\n([\s\S]*?)\r?\n---/)?.[1] ?? '';
    const published = isoDate(block, 'date');
    if (!published) continue;
    posts.push({ path: `${prefix + name}/`, lastmod: isoDate(block, 'updated') ?? published });
  }
  return posts;
}

const blog = readPosts('content/blog', 'blog/');
const newest = (posts: Post[]) => posts.map(post => post.lastmod).sort().at(-1);
const publicationDates = new Map(blog.map(post => [post.path, post.lastmod]));

const siteNewest = newest(blog);

export function sitemapMeta(pathname: string): { lastmod?: Date; changefreq: string; priority: number } {
  const path = pathname.replace(/^\/+/, '');
  const meta = (lastmod: string | undefined, changefreq: string, priority: number) => ({
    lastmod: lastmod ? new Date(`${lastmod}T00:00:00Z`) : undefined,
    changefreq,
    priority,
  });
  if (!path) return meta(siteNewest, 'weekly', 1);
  if (path === 'blog/') return meta(newest(blog), 'weekly', 0.9);
  if (publicationDates.has(path)) return meta(publicationDates.get(path), 'monthly', 0.8);
  return meta(undefined, 'monthly', 0.5);
}
