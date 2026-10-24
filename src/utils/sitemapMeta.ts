/** Sitemap metadata for the real pages of this site: content-change dates and one priority scheme. */
import { readdirSync, readFileSync } from 'node:fs';
import { contentChangeDate, frontmatterDate } from './lastmod.ts';

type Post = { path: string; published: string; lastmod: string };

// A folder of the blog collection is a slug with one index.md next to its pictures; the whole folder is what the article consists of.
function readPosts(directory: string, prefix: string): Post[] {
  let names: string[];
  try {
    names = readdirSync(directory);
  } catch {
    return [];
  }
  const posts: Post[] = [];
  for (const name of names.filter(entry => /^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(entry))) {
    const published = frontmatterDate(readFileSync(`${directory}/${name}/index.md`, 'utf8'), 'date');
    // The content schema validates the same field, so an unreadable date leaves the entry without lastmod.
    if (!published) continue;
    posts.push({ path: `${prefix + name}/`, published, lastmod: contentChangeDate(process.cwd(), `${directory}/${name}`, published) });
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
    // Only the day matters to the crawlers; the build writes the time out of the file afterwards.
    lastmod: lastmod ? new Date(`${lastmod}T00:00:00Z`) : undefined,
    changefreq,
    priority,
  });
  if (!path) return meta(siteNewest, 'weekly', 1);
  if (path === 'blog/') return meta(newest(blog), 'weekly', 0.9);
  if (publicationDates.has(path)) return meta(publicationDates.get(path), 'monthly', 0.8);
  return meta(undefined, 'monthly', 0.5);
}
