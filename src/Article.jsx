import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import Reveal from './Reveal';

// Preserve the explicit heading IDs carried over from the original blog.
function headingIds() {
  return tree => {
    for (const node of tree.children) {
      if (node.type !== 'heading') continue;
      const last = node.children.at(-1);
      if (last?.type !== 'text') continue;
      const match = last.value.match(/\s*\{#([^}]+)\}$/);
      if (match) {
        last.value = last.value.slice(0, match.index);
        node.data = { ...node.data, hProperties: { id: match[1] } };
      }
    }
  };
}

export default function Article({ post, next, leaving, onExit }) {
  return <main id="main" className={`reading article-view${leaving ? ' is-leaving' : ''}`} onAnimationEnd={event => {
    if (event.target === event.currentTarget && event.animationName === 'article-depart') onExit();
  }}>
    <a className="back" href="/#writing">All writing</a>
    <header className="article-header"><p className="eyebrow">{post.category}</p><h1>{post.title}</h1><p className="article-meta">Jacob <span>·</span> <time dateTime={post.date.slice(0, 10)}>{post.displayDate}</time> <span>·</span> {post.minutes} min read</p></header>
    <article aria-label={post.title}><div className="post-content"><ReactMarkdown remarkPlugins={[remarkGfm, headingIds]}>{post.markdown}</ReactMarkdown></div></article>
    <div className="article-end"><span>✳</span><p>Thanks for reading.</p></div>
    <Reveal as="aside" className="next-article"><p className="eyebrow">KEEP READING</p><a href={next.path}>{next.title}</a></Reveal>
  </main>;
}
