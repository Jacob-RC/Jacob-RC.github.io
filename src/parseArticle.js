import { parse } from 'yaml';

export function parseArticle(filename, source) {
  const match = source.match(/^---\r?\n([\s\S]*?)\r?\n---(?:\r?\n|$)/);
  if (!match) throw new Error(`${filename}: add YAML front matter with title and date.`);
  const metadata = parse(match[1]);
  if (typeof metadata?.title !== 'string' || !metadata.title.trim()) throw new Error(`${filename}: title must be nonempty text.`);
  if (typeof metadata?.date !== 'string' || !/^\d{4}-\d{2}-\d{2}(?:T.*)?$/.test(metadata.date) || !Number.isFinite(Date.parse(metadata.date))) throw new Error(`${filename}: date must be YYYY-MM-DD or an ISO timestamp.`);
  if (metadata.minutes !== undefined && (!Number.isInteger(metadata.minutes) || metadata.minutes < 1)) throw new Error(`${filename}: minutes must be a positive integer.`);
  const slug = filename.split('/').at(-1).replace(/\.md$/, '');
  const markdown = source.slice(match[0].length).replace(/^\r?\n/, '');
  return {
    slug,
    path: `/posts/${slug}/`,
    title: metadata.title,
    date: metadata.date,
    minutes: metadata.minutes ?? Math.max(1, Math.ceil(markdown.trim().split(/\s+/).length / 220)),
    markdown,
  };
}
