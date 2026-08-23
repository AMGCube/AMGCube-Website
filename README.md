# AMGCUBE Website

Jekyll source for [amgcube.com](https://amgcube.com), deployed from the `gh-pages` branch with GitHub Pages.

## Public pages

- `/`
- `/can-i-build/` and its four detail pages
- `/projects/`
- `/projects/146dowding/`
- `/projects/brisbane-granny-flat-project/`
- `/about/`
- `/contact/`

## Structure

- Page sources: `index.html` and `pages/`
- Current project sources: `_posts/2025-02-08-projects-146downding.markdown` and `_projects/sunnybank-hills-granny-flat.md`
- Layouts: `_layouts/`
- Shared components and CSS: `_includes/`
- Current images: `img/`
- Internal maintenance documentation: `docs/` (excluded from Production)

## Local build

```bash
bundle exec jekyll clean
bundle exec jekyll build
```

See `AGENTS.md` and `docs/WEBSITE-MAINTENANCE.md` for the current maintenance and deployment workflow.
