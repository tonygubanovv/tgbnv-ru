import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFile, readdir } from 'node:fs/promises';
import { readingMinutes } from '../src/utils/reading.ts';

test('reading time counts prose and drops code, markup and addresses', () => {
  assert.equal(readingMinutes(''), 1, 'an empty body still takes a minute');
  assert.equal(readingMinutes(Array.from({ length: 400 }, () => 'слово').join(' ')), 2);
  assert.equal(readingMinutes('```js\n' + 'const value = compute(1);\n'.repeat(600) + '```'), 1);
  assert.equal(readingMinutes('`inline` ![alt](/cover.png) [текст](https://example.com/длинный/адрес/файла) <span>слово</span>'), 1);
  // A Windows checkout keeps CRLF in the source, and the closing fence must still be found there.
  assert.equal(readingMinutes('```js\r\n' + 'const value = compute(1);\r\n'.repeat(600) + '```\r\n'), 1);
});

test('every published article derives a plausible reading time from its own body', async () => {
  const entries = await readdir('content/blog', { withFileTypes: true });
  assert.ok(entries.some(entry => entry.isDirectory()), 'No articles found');
  for (const entry of entries.filter(item => item.isDirectory())) {
    const source = await readFile(`content/blog/${entry.name}/index.md`, 'utf8');
    const minutes = readingMinutes(source.replace(/^---\r?\n[\s\S]*?\r?\n---\r?\n/, ''));
    assert.ok(minutes >= 1 && minutes <= 60, `Implausible reading time for ${entry.name}: ${minutes}`);
  }
});
