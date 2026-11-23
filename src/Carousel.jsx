import { useEffect, useRef, useState } from 'react';
import { picks } from './data';
import Reveal from './Reveal';

export default function Carousel() {
  const track = useRef(null);
  const drag = useRef(null);
  const suppressClick = useRef(false);
  const [current, setCurrent] = useState(0);
  const [ready, setReady] = useState(false);
  const [dragging, setDragging] = useState(false);
  const update = () => {
    const element = track.current;
    setCurrent(Math.max(0, Math.min(picks.length - 1, Math.round(element.scrollLeft / element.clientWidth))));
  };
  useEffect(() => {
    setReady(true);
    window.addEventListener('resize', update);
    return () => window.removeEventListener('resize', update);
  }, []);
  const scrollTo = index => track.current.scrollTo({
    left: Math.max(0, Math.min(picks.length - 1, index)) * track.current.clientWidth,
    behavior: window.matchMedia('(prefers-reduced-motion: reduce)').matches ? 'instant' : 'smooth',
  });
  const pointerDown = event => {
    suppressClick.current = false;
    if (event.pointerType !== 'mouse' || event.button !== 0) return;
    drag.current = { id: event.pointerId, x: event.clientX, scroll: track.current.scrollLeft, moved: false };
  };
  const pointerMove = event => {
    const state = drag.current;
    if (!state || state.id !== event.pointerId) return;
    const distance = event.clientX - state.x;
    if (!state.moved && Math.abs(distance) < 6) return;
    if (!state.moved) {
      state.moved = true;
      suppressClick.current = true;
      setDragging(true);
      track.current.setPointerCapture(event.pointerId);
    }
    event.preventDefault();
    track.current.scrollLeft = state.scroll - distance;
  };
  const finishDrag = event => {
    const state = drag.current;
    if (!state || state.id !== event.pointerId) return;
    drag.current = null;
    setDragging(false);
    if (track.current.hasPointerCapture(state.id)) track.current.releasePointerCapture(state.id);
    if (state.moved) scrollTo(Math.round(track.current.scrollLeft / track.current.clientWidth));
  };
  return <Reveal as="section" className="featured" aria-label="Selected articles" aria-roledescription="carousel">
    <div className="feature-label"><span className="eyebrow">A FEW FROM THE ARCHIVE</span><span className="feature-index" aria-live="polite" aria-atomic="true">{String(current + 1).padStart(2, '0')} / 03</span></div>
    <div ref={track} className={`carousel-track${dragging ? ' is-dragging' : ''}`} id="selected-articles" tabIndex={0} aria-label="Selected articles; use left and right arrow keys to browse"
      onScroll={update} onPointerDown={pointerDown} onPointerMove={pointerMove} onPointerUp={finishDrag} onPointerCancel={finishDrag} onLostPointerCapture={finishDrag}
      onPointerLeave={event => { if (drag.current && !drag.current.moved) finishDrag(event); }}
      onDragStart={event => event.preventDefault()}
      onClickCapture={event => { if (suppressClick.current && event.detail !== 0) { event.preventDefault(); event.stopPropagation(); suppressClick.current = false; } }}
      onKeyDown={event => { if (['ArrowLeft', 'ArrowRight'].includes(event.key)) { event.preventDefault(); scrollTo(current + (event.key === 'ArrowLeft' ? -1 : 1)); } }}>
      {picks.map(({ post, summary, left, right, caption }, index) => <div key={post.slug} className="carousel-slide" role="group" aria-roledescription="slide" aria-label={`${index + 1} of ${picks.length}`}>
        <a href={post.path} className="feature-link"><div className="feature-copy"><span className="eyebrow">{post.category}</span><h2>{post.title}</h2><p>{summary}</p><span className="feature-meta">{post.displayDate} <span>·</span> {post.minutes} min read</span></div><div className="intersection" aria-hidden="true"><span className="circle business">{left}</span><span className="circle code">{right === 'computer science' ? <>computer<br />science</> : right}</span><span className="cross">&amp;</span><span className="diagram-label">{caption}</span></div></a>
      </div>)}
    </div>
    <div className="carousel-controls" hidden={!ready}><span className="carousel-hint">Swipe or drag to explore.</span><div><button type="button" aria-controls="selected-articles" disabled={current === 0} onClick={() => scrollTo(current - 1)}>Previous</button><button type="button" aria-controls="selected-articles" disabled={current === picks.length - 1} onClick={() => scrollTo(current + 1)}>Next</button></div></div>
  </Reveal>;
}
