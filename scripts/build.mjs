import { build } from 'vite';
import { readFile, writeFile, mkdir } from 'node:fs/promises';
import { load } from 'cheerio';
await build();
await build({ build: { ssr: 'src/entry-server.jsx', outDir: '.server' } });
const { render, posts, homePaths, origin, headline, description } = await import('../.server/entry-server.js');
const template = await readFile('dist/index.html', 'utf8');
const escape = text => text.replaceAll('&', '&amp;').replaceAll('"', '&quot;').replaceAll('<', '&lt;').replaceAll('>', '&gt;');
for (const path of [...homePaths, '/about/', ...posts.map(post => post.path), '/404.html']) {
  const post = posts.find(post => post.path === path);
  const html = render(path);
  const title = post?.title ?? (path === '/404.html' ? 'Page not found' : path === '/about/' ? 'About Jacob' : headline);
  const summary = post ? load(html)('.post-content p').first().text().slice(0, 250) : path === '/about/' ? load(html)('.about-copy p').first().text().slice(0, 250) : description;
  const head = `<title>${escape(title)} | Jacob’s notebook</title><meta name="description" content="${escape(summary)}"><link rel="canonical" href="${origin}${path}"><meta property="og:title" content="${escape(title)}"><meta property="og:description" content="${escape(summary)}"><meta property="og:type" content="${post ? 'article' : 'website'}"><meta property="og:url" content="${origin}${path}">`;
  const directory = path === '/404.html' ? 'dist' : `dist${path}`;
  await mkdir(directory, { recursive: true });
  await writeFile(path === '/404.html' ? 'dist/404.html' : `${directory}/index.html`, template.replace('<!--page-head-->', () => head).replace('<!--app-html-->', () => html));
}
await writeFile('dist/sitemap.xml', '<?xml version="1.0" encoding="UTF-8"?><urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">' + ['/', '/about/', ...posts.map(post => post.path)].map(path => `<url><loc>${origin}${path}</loc></url>`).join('') + '</urlset>');
console.log(`Prerendered all ${posts.length} articles and archive routes from React.`);
