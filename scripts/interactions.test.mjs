import test from 'node:test';
import assert from 'node:assert/strict';
import { JSDOM } from 'jsdom';
import React, { act } from 'react';
import { hydrateRoot } from 'react-dom/client';
import { App, render, posts } from '../.server/entry-server.js';

async function mount(path, reduced = false) {
  const dom = new JSDOM(`<div id="root">${render(path)}</div>`, { url: `https://blog.test${path}` });
  globalThis.window = dom.window;
  globalThis.document = dom.window.document;
  globalThis.IS_REACT_ACT_ENVIRONMENT = true;
  window.matchMedia = () => ({ matches: reduced, addEventListener() {}, removeEventListener() {} });
  const errors = [];
  let root;
  await act(async () => { root = hydrateRoot(document.getElementById('root'), React.createElement(App, { path }), { onRecoverableError: error => errors.push(error) }); });
  const dispatch = async (element, event) => act(async () => { element.dispatchEvent(event); });
  const click = element => dispatch(element, new window.MouseEvent('click', { bubbles: true, cancelable: true, button: 0 }));
  const pointer = (element, type, x) => {
    const event = new window.MouseEvent(type, { bubbles: true, cancelable: true, button: 0, clientX: x });
    Object.defineProperties(event, { pointerId: { value: 1 }, pointerType: { value: 'mouse' } });
    return dispatch(element, event);
  };
  return { errors, dispatch, click, pointer, async close() { await act(async () => root.unmount()); dom.window.close(); } };
}

test('React hydrates the archive and supports buttons, keyboard, dragging and reduced motion', async () => {
  for (const reduced of [false, true]) {
    const app = await mount('/', reduced);
    try {
      assert.deepEqual(app.errors, []);
      const track = document.querySelector('.carousel-track');
      Object.defineProperty(track, 'clientWidth', { value: 400 });
      track.scrollTo = options => { track.lastScroll = options; track.scrollLeft = options.left; track.dispatchEvent(new window.Event('scroll')); };
      let captured = false;
      track.setPointerCapture = () => { captured = true; };
      track.hasPointerCapture = () => captured;
      track.releasePointerCapture = () => { captured = false; };
      const [previous, next] = document.querySelectorAll('.carousel-controls button');
      assert(previous.disabled);
      await app.click(next);
      assert.equal(document.querySelector('.feature-index').textContent, '02 / 03');
      assert.equal(track.lastScroll.behavior, reduced ? 'instant' : 'smooth');
      await app.dispatch(track, new window.KeyboardEvent('keydown', { key: 'ArrowRight', bubbles: true, cancelable: true }));
      assert(next.disabled);
      await app.click(previous);
      await app.pointer(track, 'pointerdown', 300);
      await app.pointer(track, 'pointermove', 50);
      assert(track.classList.contains('is-dragging'));
      await app.pointer(track, 'pointerup', 50);
      assert.equal(track.scrollLeft, 800);
      assert(!track.classList.contains('is-dragging'));
      const event = new window.MouseEvent('click', { bubbles: true, cancelable: true, detail: 1 });
      await app.dispatch(track.querySelector('a'), event);
      assert(event.defaultPrevented, 'Dragging must not open an article');
    } finally { await app.close(); }
  }
});

test('React hydrates Markdown articles and resets exit state on history restoration', async () => {
  const app = await mount(posts[0].path);
  try {
    assert.deepEqual(app.errors, []);
    assert(document.querySelector('.post-content').textContent.trim().length > 0);
    const article = document.querySelector('.article-view');
    await app.click(document.querySelector('.back'));
    assert(article.classList.contains('is-leaving'));
    await app.dispatch(window, new window.Event('pageshow'));
    assert(!article.classList.contains('is-leaving'));
  } finally { await app.close(); }
});


test('Markdown front matter supplies metadata without appearing in the body', async () => {
  const { parseArticle } = await import('../src/parseArticle.js');
  const post = parseArticle('content/articles/example.md', '---\ntitle: "Notes: ideas & lessons"\ndate: "2026-11-22"\n---\n\nHello world.');
  assert.equal(post.title, 'Notes: ideas & lessons');
  assert.equal(post.date, '2026-11-22');
  assert.equal(post.path, '/posts/example/');
  assert.equal(post.markdown, 'Hello world.');
  assert.equal(post.minutes, 1);
  assert.throws(() => parseArticle('bad.md', 'No metadata'), /front matter/);
  assert.throws(() => parseArticle('bad.md', '---\ntitle: Test\ndate: nope\n---\nBody'), /date/);
  assert.throws(() => parseArticle('bad.md', '---\ndate: "2026-11-22"\n---\nBody'), /title/);
});
