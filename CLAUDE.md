# Vitrine website

Showcase site for Vitrine (https://github.com/vitrine-org/vitrine), published by GitHub Pages at
https://vitrine-org.github.io/ (root path, no subpath). Astro + Starlight, English (default) and
Italian (`/it/`).

- Use the **frontend-design** skill (plugin `frontend-design@claude-plugins-official`) for all design work.
- Keep it **minimal and premium**: solid backgrounds, light and dark, a few concepts, links. No
  elaborate interactive showcases. Show widgets with **real renders** (`vitrine render
  --backdrop`, in `src/assets/renders/`); CSS is only for abstract diagrams. The four
  themes (Sargas, Antares, Mond, Alnitak) are v2 packs and appear only as their own renders.
- Pages: landing (`src/components/Landing.astro`, strings in `src/i18n/landing.ts`), store at
  `/packs/` (`Store.astro`, `src/scripts/store.ts`; `/store/` belongs to the `vitrine-org/store`
  Pages site that serves the catalogue), docs in `src/content/docs` (en and it, written natively).
- The app icon comes from the main repo (`assets/icon/`); `src/assets/vitrine.svg` and `public/favicon.svg`
  are copies of it.
- `npm run build` must pass; deploy happens on push to `main` (`.github/workflows/pages.yml`).
