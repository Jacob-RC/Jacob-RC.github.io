# Deploying jacobc.us

This repository contains the React/Vite source and all 12 Markdown articles. GitHub Actions compiles complete static HTML pages, verifies them, and publishes `dist/` to GitHub Pages. No production server, Python, paid hosting, or manually generated HTML is needed.

## One-time setup and first release

1. Open https://github.com/Jacob-RC/Jacob-RC.github.io/settings/pages and set **Build and deployment → Source → GitHub Actions** before pushing this migration. Keep the custom domain set to **jacobc.us** and enable **Enforce HTTPS** when available. The existing domain already points at this repository; no DNS change is needed if it is still serving the old blog. With Actions, the custom domain is configured in Pages settings, not just the CNAME file.
2. In repository **Settings → Actions → General**, enable Actions and permit the official `actions/*` actions used by this workflow. No personal access token or repository secret is required: deployment uses GitHub's built-in token and OIDC.
3. If the `github-pages` environment restricts deployment branches, allow `main` under **Settings → Environments → github-pages**. Optional required reviewers will pause deployment until approved.
4. Review, commit, and push from this directory:

   ```sh
   git diff --stat
   git status --short
   git add -A
   git commit -m "Migrate blog to React and Markdown with Pages deployment"
   git push origin main
   ```

5. Open https://github.com/Jacob-RC/Jacob-RC.github.io/actions and watch **Build and deploy blog**. Both `build` and `deploy` must succeed. The deployment job exposes the live URL.
6. Verify https://jacobc.us/, https://jacobc.us/about/, and https://jacobc.us/posts/pedestals/. Open an article directly, refresh it, and try a nonexistent URL to check the custom 404 page. The existing `/prom/` mini-site is also retained.

## Everyday editing

Use Node 24 and pnpm 11.1.2 (also pinned for CI):

```sh
nvm install
nvm use
npm install --global pnpm@11.1.2
pnpm install --frozen-lockfile
pnpm dev
```

If you do not use nvm, install Node 24 directly. Preview runs at http://127.0.0.1:4173.

Create `content/articles/my-title.md`:

```markdown
---
title: "My title"
date: "2026-11-23"
---

Your article here.
```

The filename becomes `/posts/my-title/`. New articles appear automatically, newest first. Place images in `public/media/` and reference `/media/filename.jpg`. Edit the About page in `src/App.jsx` and curated carousel selections in `src/data.js`.

Before pushing:

```sh
pnpm build
pnpm test
pnpm preview
```

Commit the source and lockfile, not `dist/`, `.server/`, or `node_modules/`. Push a feature branch and open a pull request to `main` for review, or push directly to `main` for a release.

## Pipeline

`.github/workflows/deploy.yml` runs on pull requests to `main`, pushes to `main`, and manual dispatch:

1. Check out the commit and install Node/pnpm.
2. Install the exact dependencies using the committed lockfile.
3. Build client assets and prerender every article, About, archive, and 404 page.
4. Test hydration, navigation, carousel controls, article preservation, metadata, and local references.
5. On `main` only, upload the verified `dist/` artifact and deploy it to the `github-pages` environment.

Pull requests validate without publishing. Failed builds/tests cannot deploy. Publishing jobs have `pages: write` and `id-token: write`; the build job only reads source. The repository's deployment permissions and environment protection rules still apply.

## Troubleshooting and rollback

- **Install fails:** reproduce with `pnpm install --frozen-lockfile`. If dependencies intentionally changed, run `pnpm install` locally and commit the updated lockfile.
- **Verification fails:** inspect the failed assertion and fix the source. `pnpm test` expects `pnpm build` first.
- **Pages setup/deploy fails:** confirm Actions is the Pages source, `main` is allowed in the environment, and Actions is enabled. Rerun the failed job after changing settings.
- **Wrong domain or HTTPS:** check Pages custom domain and DNS validation. Canonicals/sitemap use `https://jacobc.us` in `src/data.js`; `public/CNAME` retains the domain in build output.
- **Rollback:** use `git revert <bad-commit-sha>` and `git push origin main`; the same pipeline builds and deploys the reverted source. For the initial migration itself, restoring the old generated repository also requires switching Pages back to its former branch source. Git history retains the old site.

Official reference: https://docs.github.com/en/pages/getting-started-with-github-pages/using-custom-workflows-with-github-pages
