import { parseArticle } from './parseArticle';
const articles = import.meta.glob('../content/articles/*.md', { query: '?raw', import: 'default', eager: true });
export const origin = 'https://jacobc.us';
export const headline = 'Random thoughts, life lessons, and a smattering of high school ramblings';
export const description = 'Notes on business, computer science, and a growing interest in startups and philosophy.';
export const posts = Object.entries(articles).map(([filename, source]) => parseArticle(filename, source)).sort((a, b) => Date.parse(b.date) - Date.parse(a.date)).map(post => ({
  ...post,
  category: post.slug.includes('ctf') ? 'Computer science' : post.slug.includes('card-games') ? 'Business & games' : ['the-case-for-business-and-computer-science', 'jacobhottakes3', 'jacobhottakes4'].includes(post.slug) ? 'Business' : 'Learning & life',
  displayDate: new Date(`${post.date.slice(0, 10)}T12:00:00Z`).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric', timeZone: 'UTC' }),
}));
export const homePaths = ['/', '/posts/', '/page/2/', '/posts/page/2/'];
export const picks = [
  { slug: 'the-case-for-business-and-computer-science', summary: 'Why I’m drawn to both business and computer science, and what each can learn from the other.', left: 'business', right: 'computer science', caption: 'TWO INTERESTS, PLENTY OF OVERLAP' },
  { slug: 'who-makes-money-in-card-games', summary: 'A look at who makes money in card games, from players and collectors to local shops.', left: 'the game', right: 'the market', caption: 'THE ECONOMICS BEHIND THE GAME' },
  { slug: 'tjctf24-crypto-writeups', summary: 'How I approached two cryptography challenges at TJCTF 2024, with code and lessons along the way.', left: 'a puzzle', right: 'a solution', caption: 'FROM CHALLENGE TO SOLUTION' },
].map(pick => ({ ...pick, post: posts.find(post => post.slug === pick.slug) }));
