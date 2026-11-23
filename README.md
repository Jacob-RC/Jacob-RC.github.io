# Jacob’s notebook

A React + Vite blog with 12 Markdown articles, deployed to https://jacobc.us/ through GitHub Pages.

## Development

Use Node.js 24 and pnpm 11.1.2.

```sh
pnpm install
pnpm dev
```

The development server runs at http://127.0.0.1:4173. Pages are React components; Vite provides hot reload.

## Build and verify

```sh
pnpm build
pnpm test
pnpm preview
```

The JavaScript build uses React server rendering to generate complete HTML pages for the homepage, archive aliases, every article, and the 404 page. The same React components hydrate in the browser. Article content and navigation remain available without JavaScript. Deploy `dist/` as a static website; no production Node server or Python runtime is required.

Tests exercise React hydration, carousel buttons, keyboard navigation, dragging, reduced motion, and article exit-state restoration. Verification compares all articles against the original snapshots and checks code, formatting, heading anchors, metadata, and local links/assets.

## Source layout

- `src/App.jsx`: layout, homepage, and return-home transitions.
- `src/Article.jsx`: Markdown rendering and article entrance/exit animations.
- `src/Carousel.jsx`: React carousel with touch/trackpad scrolling, mouse dragging, and keyboard controls.
- `src/Reveal.jsx`: scroll reveals with reduced-motion support and cleanup.
- `src/styles.css`: existing responsive blue/purple design.
- `src/data.js`: article metadata, Markdown imports, and featured article selections.
- `content/articles/*.md`: article bodies with title, date, and optional reading time in YAML front matter.
- `content/*.original.html`: archival snapshots used only for migration verification.
- `public/`: favicon and migrated images.
- `scripts/*.mjs`: JavaScript build and verification tools.
- `dist/`: generated deployment output; edit source files instead.

Article headings use `{#original-anchor}` to preserve existing links. Fenced code blocks, images, and strikethrough render through React Markdown. All original article paths and archive aliases are retained.

See [DEPLOYMENT.md](DEPLOYMENT.md) for first-time GitHub Pages setup, the automated pipeline, everyday publishing, and rollback. Pushes to main deploy after the build and tests pass; pull requests only validate.


## Writing an article

Start each Markdown file with:

```markdown
---
title: "My new article"
date: "2026-11-22"
---

Write your article here.
```

The filename determines the URL (my-new-article.md becomes /posts/my-new-article/). Titles and publication dates are read directly from front matter; dates may include an ISO timestamp and timezone. Optional minutes preserves a specific reading-time label; otherwise it is estimated from the body. Articles are discovered automatically and sorted newest first. Run pnpm dev to preview or pnpm build to compile the pages. Original articles retain their full timestamps and reading times.

## Editing your About page

Edit the About() function in src/App.jsx. The bio is native JSX, and the communities array contains each organization’s name, role, and decorative icon. content/about.md is retained as your reference draft and is no longer rendered. The page description is generated from the first rendered paragraph.
