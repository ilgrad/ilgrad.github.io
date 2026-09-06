# Ilia Gradina — personal website

A static, responsive portfolio for [ilgrad.github.io](https://ilgrad.github.io/).
No build step, external scripts, analytics, or runtime dependencies.

## Preview locally

From this directory, run:

    python3 -m http.server 8000 --bind 127.0.0.1

Open http://localhost:8000. The site also works by opening index.html directly.

## Files

- index.html — biography, project descriptions, and links.
- styles.css — responsive layout, print styles, and reduced-motion support.
- site.js — deterministic, synthetic k-means illustration; not a BETULA benchmark.
- assets/ — favicon and self-hosted Manrope font (SIL Open Font License).

Project links and text are intentionally static: the page makes no GitHub API
requests and does not depend on rate limits or a third-party service.

## Publishing

GitHub Pages serves the repository root from the main branch. Pushing an approved
change to main publishes it automatically. Preview changes locally before
committing; the local preview command does not deploy anything.
