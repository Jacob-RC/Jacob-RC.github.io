import assert from 'node:assert/strict';
import { readFile, readdir, access } from 'node:fs/promises';
import { join } from 'node:path';
import { load } from 'cheerio';
const { posts } = await import('../.server/entry-server.js');
const normalized = text => text.replace(/\s+/g, '');
const code = ($, selector) => $(selector).toArray().map(el => $(el).text().replace(/^[ \t]+$/gm, '').replace(/\n+$/, ''));
const originals = (await readdir('content')).filter(file => file.endsWith('.original.html'));
for (const file of originals) assert(posts.some(post => file === `${post.slug}.original.html`), `${file}: retained article`);
for (const post of posts) {
  const current = load(await readFile(`dist${post.path}index.html`, 'utf8'));
  assert(current('.post-content').text().trim().length > 0, `${post.slug}: article body`);
  if (originals.includes(`${post.slug}.original.html`)) {
    const old = load(await readFile(`content/${post.slug}.original.html`, 'utf8'));
    old('.post-content a.anchor').remove();
    assert.equal(normalized(current('.post-content').text()), normalized(old('.post-content').text()), `${post.slug}: article text`);
    assert.deepEqual(code(current, '.post-content pre'), code(old, '.post-content pre'), `${post.slug}: code`);
    const headings = $ => $('.post-content :header').toArray().map(el => [el.tagName, $(el).attr('id')]);
    assert.deepEqual(headings(current), headings(old), `${post.slug}: heading anchors`);
    for (const tag of ['img', 'a', 'strong', 'em', 'del']) assert.equal(current(`.post-content ${tag}`).length, old(`.post-content ${tag}`).length, `${post.slug}: ${tag}`);
  }
  assert.equal(current('title').text(), `${post.title} | Jacob’s notebook`);
  assert.equal(current('.article-view').length, 1);
}
let links = 0;
async function verifyDirectory(directory) {
  for (const entry of await readdir(directory, { withFileTypes: true })) {
    const file = join(directory, entry.name);
    if (entry.isDirectory()) { await verifyDirectory(file); continue; }
    if (!file.endsWith('.html')) continue;
    const $ = load(await readFile(file, 'utf8'));
    for (const element of $('a[href], img[src], script[src], link[rel="stylesheet"], link[rel="icon"]').toArray()) {
      const ref = $(element).attr('href') ?? $(element).attr('src');
      if (/^(?:[a-z]+:|\/\/)/i.test(ref)) continue;
      const url = new URL(ref, `https://local.test/${file.slice(5)}`);
      let target = join('dist', decodeURIComponent(url.pathname));
      if (url.pathname.endsWith('/')) target = join(target, 'index.html');
      await access(target);
      if (url.hash && target.endsWith('.html')) {
        const destination = load(await readFile(target, 'utf8'));
        assert(destination('[id]').toArray().some(el => destination(el).attr('id') === decodeURIComponent(url.hash.slice(1))), `${file}: ${ref}`);
      }
      links++;
    }
  }
}
await verifyDirectory('dist');
const home = load(await readFile('dist/index.html', 'utf8'));
assert.equal(home('.carousel-slide').length, 3);
assert.equal(home('.article-row').length, posts.length);
assert.equal(home('a[href="mailto:chenjacob@outlook.com"]').length, 1);
console.log(`Verified all ${posts.length} articles, Markdown formatting, heading anchors, metadata, and ${links} local references.`);
const about = load(await readFile('dist/about/index.html', 'utf8'));
assert.equal(home('.about').length, 0);
assert.equal(home('nav a[href="/about/"]').length, 1);
assert.equal(about('.about-copy h1').length, 1);
assert(about('.about-copy').text().trim().length > 0);
assert.equal(about('meta[name="description"]').attr('content'), about('.about-copy p').first().text().slice(0, 250));
assert.equal(about('title').text(), 'About Jacob | Jacob’s notebook');
assert.equal(about('nav a[aria-current="page"]').attr('href'), '/about/');
console.log('Verified dedicated About page, navigation, and removal from homepage.');
assert.equal(about('.about-hobbies li').length, 4);
assert.equal(about('.about-communities li').length, 4);
assert.equal(about('.community-icon svg').length, 4);
assert(about('.about-copy').text().includes('A current Junior at the University of Michigan'));
assert(about('.about-communities').text().includes('VP Ed'));
assert(about('.about-communities').text().includes('Co-president'));
console.log('Verified React bio, four hobbies, and four community icons with roles.');
