import { getCollection } from 'astro:content';
import { site } from '@lib/site';
import { byDateDesc, entrySlug, visibleEntry } from '@lib/content';

export async function GET() {
  const posts = (await getCollection('blog')).filter(visibleEntry).sort(byDateDesc);
  const items = posts
    .map((post) => {
      const url = `${site.url}/blog/${entrySlug(post)}/`;
      return `<item><title><![CDATA[${post.data.title}]]></title><description><![CDATA[${post.data.description}]]></description><link>${url}</link><guid>${url}</guid><pubDate>${post.data.pubDate.toUTCString()}</pubDate></item>`;
    })
    .join('');

  return new Response(`<?xml version="1.0" encoding="UTF-8" ?><rss version="2.0"><channel><title>${site.name}</title><description>${site.description}</description><link>${site.url}</link>${items}</channel></rss>`, {
    headers: {
      'Content-Type': 'application/rss+xml; charset=utf-8'
    }
  });
}
