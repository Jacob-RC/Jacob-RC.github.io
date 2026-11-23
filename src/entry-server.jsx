import { renderToString } from 'react-dom/server';
import App from './App';
export { default as App } from './App';
export { posts, homePaths, origin, headline, description } from './data';
export function render(path) { return renderToString(<App path={path} />); }
