# Vitrine website

Showcase site for Vitrine (https://github.com/vitrine-org/vitrine), published by GitHub Pages at
https://vitrine-org.github.io/ (root path, no subpath). Astro + Starlight, English (default) and
Italian (`/it/`).

- Use the **frontend-design** skill (plugin `frontend-design@claude-plugins-official`) for all design work.
- Keep it **minimal**: the app icon, a few concepts, links. No elaborate showcases, and never reuse the
  Vitrine 1 themes (Sargas, Antares, Mond, Alnitak) as visual examples.
- The app icon comes from the main repo (`assets/icon/`); `src/assets/vitrine.svg` and `public/favicon.svg`
  are copies of it.
- `npm run build` must pass; deploy happens on push to `main` (`.github/workflows/pages.yml`).
