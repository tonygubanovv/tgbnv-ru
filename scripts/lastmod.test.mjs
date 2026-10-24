import { test } from 'node:test';
import assert from 'node:assert/strict';
import { execFileSync } from 'node:child_process';
import { mkdirSync, mkdtempSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { dirname, join } from 'node:path';
import { contentChangeDate, dateOnlyLastmod, frontmatterDate } from '../src/utils/lastmod.ts';

const article = (title, body, date) => `---\r\ntitle: "${title}"\r\ndate: "${date}"\r\ntags: ["Статьи"]\r\n---\r\n\r\n${body}\r\n`;

// A scratch repository keeps the dates exact: the owner's late-evening commit must land on the day recorded in the commit object.
function workspace(t) {
  const dir = mkdtempSync(join(tmpdir(), 'lastmod-'));
  t.after(() => rmSync(dir, { recursive: true, force: true }));
  const run = (args, when) => execFileSync('git', args, {
    cwd: dir,
    encoding: 'utf8',
    stdio: ['ignore', 'pipe', 'ignore'],
    env: { ...process.env, GIT_AUTHOR_DATE: when, GIT_COMMITTER_DATE: when, GIT_AUTHOR_NAME: 'lastmod', GIT_AUTHOR_EMAIL: 'lastmod@example.com', GIT_COMMITTER_NAME: 'lastmod', GIT_COMMITTER_EMAIL: 'lastmod@example.com' },
  });
  run(['init', '-q']);
  return {
    dir,
    file(path, text) {
      const full = join(dir, ...path.split('/'));
      mkdirSync(dirname(full), { recursive: true });
      writeFileSync(full, text);
    },
    commit(when, message) {
      run(['add', '-A'], when);
      run(['commit', '-q', '-m', message], when);
    },
  };
}

test('the content date is the day the article text changed, not the day it was built', t => {
  const w = workspace(t);
  w.file('content/blog/one/index.md', article('Первая', 'Первый абзац.', '2026-10-01'));
  w.commit('2026-10-01T10:00:00+03:00', 'article published');
  assert.equal(contentChangeDate(w.dir, 'content/blog/one', '2026-10-01'), '2026-10-01');

  // A corrected publication date is metadata on the page, not new reading material.
  w.file('content/blog/one/index.md', article('Первая', 'Первый абзац.', '2026-09-28'));
  w.commit('2026-10-02T10:00:00+03:00', 'publication date corrected');
  assert.equal(contentChangeDate(w.dir, 'content/blog/one', '2026-09-28'), '2026-10-01', 'a date-only edit moved the content date');

  // New text moves it, and the recorded day belongs to the commit rather than to the machine reading it.
  w.file('content/blog/one/index.md', article('Первая', 'Первый абзац.\n\nВторой абзац.', '2026-10-01'));
  w.commit('2026-10-05T23:30:00+03:00', 'second paragraph');
  assert.equal(contentChangeDate(w.dir, 'content/blog/one', '2026-10-01'), '2026-10-05');

  // Nothing changes for the next build: the same folder, the same answer, and a neighbour article is not mixed in.
  assert.equal(contentChangeDate(w.dir, 'content/blog/one', '2026-10-01'), '2026-10-05', 'the same content answered twice with different dates');
  w.file('content/blog/two/index.md', article('Вторая', 'Свой текст.', '2026-10-06'));
  w.commit('2026-10-06T09:00:00+03:00', 'second article');
  assert.equal(contentChangeDate(w.dir, 'content/blog/one', '2026-10-01'), '2026-10-05', "another article's commit moved this one");
});

test('a replaced picture counts as changed content and a note beside it does not', t => {
  const w = workspace(t);
  w.file('content/blog/one/index.md', article('Первая', 'Текст.', '2026-10-01'));
  w.file('content/blog/one/cover.png', 'old bytes');
  w.commit('2026-10-01T10:00:00+03:00', 'article published');
  assert.equal(contentChangeDate(w.dir, 'content/blog/one', '2026-10-01'), '2026-10-01');
  w.file('content/blog/one/cover.png', 'new bytes');
  w.commit('2026-10-03T10:00:00+03:00', 'cover re-exported');
  assert.equal(contentChangeDate(w.dir, 'content/blog/one', '2026-10-01'), '2026-10-03', 'a new cover picture is new content');
  w.file('content/blog/one/NOTES.md', 'заметка, которую читатель не видит');
  w.commit('2026-10-04T10:00:00+03:00', 'note next to the article');
  assert.equal(contentChangeDate(w.dir, 'content/blog/one', '2026-10-01'), '2026-10-03', 'a file outside the published article moved its date');
});

test('without a readable history the publication date is kept instead of a build date', t => {
  const w = workspace(t);
  w.file('content/blog/one/index.md', article('Первая', 'Текст.', '2026-10-01'));
  assert.equal(contentChangeDate(w.dir, 'content/blog/one', '2026-10-01'), '2026-10-01', 'a repository without commits invented a date');
  const plain = mkdtempSync(join(tmpdir(), 'lastmod-'));
  t.after(() => rmSync(plain, { recursive: true, force: true }));
  assert.equal(contentChangeDate(plain, 'content/blog/one', '2026-10-01'), '2026-10-01', 'no git at all invented a date');
});

test('sitemap dates are written as a plain day', () => {
  const xml = '<url><loc>https://agubanovv.ru/blog/one/</loc><lastmod>2026-10-05T20:30:00.000Z</lastmod><changefreq>monthly</changefreq></url>';
  assert.equal(dateOnlyLastmod(xml), '<url><loc>https://agubanovv.ru/blog/one/</loc><lastmod>2026-10-05</lastmod><changefreq>monthly</changefreq></url>');
  assert.equal(dateOnlyLastmod('<lastmod>2026-10-05</lastmod>'), '<lastmod>2026-10-05</lastmod>', 'an already plain day was rewritten');
  assert.equal(dateOnlyLastmod('<lastmod>not a date</lastmod>'), '<lastmod>not a date</lastmod>');
});

test('the publication date is read from the frontmatter as the blog collection reads it', () => {
  assert.equal(frontmatterDate(article('Первая', 'Текст.', '2026-10-01'), 'date'), '2026-10-01');
  // An editor may leave a blank line before the fence or a byte-order mark; the article still has a real date.
  assert.equal(frontmatterDate(`\r\n${article('Первая', 'Текст.', '2026-10-01')}`, 'date'), '2026-10-01');
  assert.equal(frontmatterDate(`\uFEFF${article('Первая', 'Текст.', '2026-10-01')}`, 'date'), '2026-10-01');
  assert.equal(frontmatterDate('---\ndate: 2026-10-01\ntitle: Первая\n---\n\nТекст.', 'date'), '2026-10-01');
  assert.equal(frontmatterDate('---\ntitle: Первая\n---\n\nТекст.', 'date'), undefined);
});
