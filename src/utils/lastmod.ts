/** Sitemap dates: the day an article's content actually changed, never the day somebody ran a build. */
import { execFileSync } from 'node:child_process';
import { createHash } from 'node:crypto';

const git = (repo: string, args: string[]) => {
  try {
    return execFileSync('git', ['-C', repo, ...args], { encoding: 'utf8', stdio: ['ignore', 'pipe', 'ignore'], maxBuffer: 16 * 1024 * 1024 });
  } catch {
    return null;
  }
};

// A leading blank line before the opening fence is valid Markdown, so the block is found after any whitespace.
function parts(markdown: string) {
  const text = markdown.replace(/^\uFEFF/, '');
  const block = text.match(/^\s*---\r?\n([\s\S]*?)\r?\n---(?:\r?\n|$)([\s\S]*)$/);
  return block ? { front: block[1], body: block[2] } : { front: '', body: text };
}

/** `date: "YYYY-MM-DD"` as written in the file, or nothing when the field is absent or unreadable. */
export const frontmatterDate = (markdown: string, field: string) => parts(markdown).front.match(new RegExp(`^${field}:\\s*"?(\\d{4}-\\d{2}-\\d{2})"?`, 'm'))?.[1];

/** Commits that changed the folder, newest first, each with the day it landed. `%cd` is read from the commit object, so the answer never depends on the machine building the site. */
const changes = (repo: string, folder: string, limit: number) => {
  const out = git(repo, ['log', `-${limit}`, '--format=%H%x1f%cd', '--date=short', '--', folder]);
  if (out === null) return null;
  return out.trim().split('\n').filter(Boolean).map(line => {
    const [sha, date] = line.split('\u001f');
    return { sha, date };
  });
};

// The publication date stays on the page and in the frontmatter; correcting it alone is not new reading material, so it stays out of the fingerprint.
const textDigest = (markdown: string) => {
  const { front, body } = parts(markdown);
  return createHash('sha256').update(front.replace(/^date:.*(\r?\n|$)/m, '') + '\u001e' + body).digest('hex');
};

/**
 * One hash for what the article actually publishes: its text without the publication date, plus the object id of every picture
 * beside it. A note left in the same folder changes nothing a reader can see, so it is not content.
 */
const fingerprint = (repo: string, rev: string, folder: string) => {
  const listed = git(repo, ['ls-tree', '-r', '--format=%(objectname)%x1f%(path)', rev, '--', folder]);
  if (listed === null) return null;
  const hash = createHash('sha256');
  for (const line of listed.trim().split('\n').filter(Boolean).sort()) {
    const [oid, path] = line.split('\u001f');
    if (path.endsWith('/index.md')) {
      hash.update(`${path}\u001f${textDigest(git(repo, ['show', `${rev}:${path}`]) ?? '')}\n`);
    } else if (/\.(?:png|jpe?g|webp|avif|gif|svg)$/i.test(path)) {
      hash.update(`${path}\u001f${oid}\n`);
    }
  }
  return hash.digest('hex');
};

/**
 * The day the folder last changed for real. A commit that only rewrote the publication date is skipped and the search walks back
 * through the history; without a repository, without history or past the examined limit the publication date is kept, because an
 * invented date is worse for the crawlers than a conservative one.
 */
export function contentChangeDate(repo: string, folder: string, published: string, limit = 12): string {
  const list = changes(repo, folder, limit);
  if (!list?.length) return published;
  for (const change of list) {
    const here = fingerprint(repo, change.sha, folder);
    if (here === null) return published;
    const before = fingerprint(repo, `${change.sha}^`, folder);
    if (before === null || here !== before) return change.date;
  }
  return published;
}

/** The sitemap package always writes a full ISO timestamp, so the requested date-only form is applied to the file it produced. */
export const dateOnlyLastmod = (xml: string) => xml.replaceAll(/<lastmod>(\d{4}-\d{2}-\d{2})T[^<]*<\/lastmod>/g, '<lastmod>$1</lastmod>');
