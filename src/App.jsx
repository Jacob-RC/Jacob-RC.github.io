import { useEffect, useRef, useState } from 'react';
import { posts, homePaths, headline } from './data';
import Carousel from './Carousel';
import Article from './Article';
import Reveal from './Reveal';

function Home() {
  return <main id="main">
    <section className="intro" aria-labelledby="intro-title"><div><p className="eyebrow intro-label">THE PERSONAL NOTEBOOK OF JACOB</p><h1 id="intro-title">{headline}</h1><p className="intro-copy">Business and computer science.<br className="desktop-break" /> Lately, more startups and philosophy.</p><p className="intro-aside">Essays, CTF writeups, and a few hot takes.</p></div><div className="notebook-mark" aria-hidden="true"><div className="mark-card card-back"><span>01 / QUESTIONS</span><b>why?</b><i>follow the curiosity</i></div><div className="mark-card card-front"><span>02 / CONNECTIONS</span><b>{'{ & }'}</b><i>somewhere in between</i></div><span className="mark-caption">always a work in progress</span></div></section>
    <Carousel />
    <section id="writing" className="writing"><div className="section-heading"><h2>From the notebook</h2><span className="eyebrow">{posts.length} ENTRIES · {posts.at(-1).date.slice(0, 4)}—{posts[0].date.slice(0, 4)}</span></div>
      {[...new Set(posts.map(post => post.date.slice(0, 4)))].map(year => <div key={year} className="year-group"><div className="year-label">{year}</div><div className="year-articles">{posts.map((post, index) => post.date.startsWith(year) && <Reveal as="a" key={post.slug} className="article-row" href={post.path}><span className="row-number">{String(index + 1).padStart(2, '0')}</span><div><span className="eyebrow category">{post.category}</span><h3>{post.title}</h3></div><div className="row-meta"><time dateTime={post.date.slice(0, 10)}>{post.displayDate}</time><span>{post.minutes} min read</span></div><span className="row-plus" aria-hidden="true">+</span></Reveal>)}</div></div>)}
    </section>
  </main>;
}

function About() {
  const communities = [
    { name: 'Michigan Investment Group', role: 'VP Ed', icon: <><path d="M4 19V9m8 10V5m8 14V11" /><path d="m3 6 6-3 6 4 6-4" /></> },
    { name: 'UpRound Ventures', role: 'Co-president', icon: <><circle cx="12" cy="12" r="9" /><path d="m7 15 8-8m-7 0h7v7" /></> },
    { name: 'Shift Creator Space', role: 'Member', icon: <><path d="m12 2 2.8 6.8L22 12l-7.2 3.2L12 22l-2.8-6.8L2 12l7.2-3.2Z" /></> },
    { name: 'V1', role: 'Member', icon: <><path d="m3 6 5 12 5-12m3 3 3-3v12m-3 0h6" /></> },
  ];
  return <main id="main" className="about-page"><a className="back" href="/">Back to the notebook</a>
    <Reveal as="section" className="about about-profile" id="about">
      <span className="eyebrow">BEHIND THE NOTEBOOK</span>
      <div className="about-copy">
        <h1>Hi, I’m Jacob.</h1>
        <p>A current Junior at the University of Michigan, lover of card games, philosophy, and collector of eclectic hobbies. Here's a random list of things I've done throughout my life:</p>
        <ul className="about-hobbies">
          <li>I wanted to be a professional Magic: the Gathering Player</li>
          <li>Sold candy during middle school and had 2 employees working for me</li>
          <li>Bought and sold nerf blasters off craigslist to make side income</li>
          <li>Built custom keyboards for my friends and family</li>
        </ul>
        <p>At Michigan, I'm pretty involved in the entrepreneurship and tech communities on campus.</p>
      <section className="about-communities" aria-labelledby="community-heading">
        <h2 id="community-heading">On campus</h2>
        <ul>{communities.map(community => <li key={community.name}>
          <span className="community-icon" aria-hidden="true"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">{community.icon}</svg></span>
          <div><h3>{community.name}</h3><p>{community.role}</p></div>
        </li>)}</ul>
      </section>
        <p>Lately, I’m getting more interested in startups and philosophy. This notebook is where I write through what I’m learning, and share my thoughts on life. Thanks for checking out my corner of the internet!</p>
      </div>

    </Reveal>
  </main>;
}

export default function App({ path }) {
  const index = posts.findIndex(post => post.path === path);
  const post = posts[index];
  const [leaving, setLeaving] = useState(false);
  const destination = useRef(null);
  const timer = useRef(null);
  const finishExit = () => {
    if (!destination.current) return;
    const href = destination.current;
    destination.current = null;
    clearTimeout(timer.current);
    window.location.assign(href);
  };
  useEffect(() => {
    const reset = () => { clearTimeout(timer.current); destination.current = null; setLeaving(false); };
    window.addEventListener('pageshow', reset);
    return () => { clearTimeout(timer.current); window.removeEventListener('pageshow', reset); };
  }, []);
  const onNavigate = event => {
    if (!post || event.defaultPrevented || event.button !== 0 || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;
    const link = event.target.closest('a[href]');
    if (!link || link.hasAttribute('download') || (link.target && link.target !== '_self')) return;
    const url = new URL(link.href, window.location.href);
    if (url.origin !== window.location.origin || !['/', '/posts/'].includes(url.pathname) || window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    event.preventDefault();
    if (destination.current) return;
    destination.current = url.href;
    setLeaving(true);
    timer.current = setTimeout(finishExit, 450);
  };
  return <div onClick={onNavigate}>
    <a className="skip" href="#main">Skip to content</a>
    <div className="site"><header className="header"><a className="wordmark" href="/" aria-label="Jacob, home">jacob<span>.</span></a><nav aria-label="Main navigation"><a href="/#writing">Writing</a><a href="/about/" aria-current={['/about/', '/about'].includes(path) ? 'page' : undefined}>About</a></nav></header>
      {post ? <Article post={post} next={posts[(index + 1) % posts.length]} leaving={leaving} onExit={finishExit} /> : ['/about/', '/about'].includes(path) ? <About /> : homePaths.includes(path) ? <Home /> : <main id="main" className="reading"><h1>This page got lost.</h1><p><a href="/">Head back to the notebook.</a></p></main>}
      <footer><a className="wordmark small" href="/">j<span>.</span></a><p>A little corner of the internet.<br /><span>Written by Jacob. Still figuring things out.</span><br /><a className="footer-email" href="mailto:chenjacob@outlook.com">chenjacob@outlook.com</a></p><a href="/#writing">Back to the notebook</a></footer>
    </div>
  </div>;
}
