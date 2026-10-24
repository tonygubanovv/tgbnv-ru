// Reading time is derived from the article body and never typed into frontmatter: a hand-written number goes stale on the first edit.
// Only prose counts — code is scanned rather than read — at 180 words a minute, the pace a Russian technical text holds.
const WORDS_PER_MINUTE = 180;
const prose = (body: string) => body
  .replace(/\r\n/g, '\n')
  .replace(/(^|\n)[ \t]*(?:```|~~~)[\s\S]*?(?:```|~~~)(?=\n|$)/g, ' ')
  .replace(/`[^`\n]*`/g, ' ')
  .replace(/!\[[^\]]*\]\([^)]*\)/g, ' ')
  .replace(/\[([^\]]*)\]\([^)]*\)/g, '$1')
  .replace(/<\/?[a-zA-Z][^>]*>/g, ' ')
  .replace(/(?:https?|mailto|tel):\S+/gi, ' ');

/** Whole minutes for one article body, the text between the frontmatter and the end of the file. */
export const readingMinutes = (body: string) => Math.max(1, Math.round((prose(body).match(/[\p{L}\p{N}][\p{L}\p{N}'’-]*/gu) ?? []).length / WORDS_PER_MINUTE));
