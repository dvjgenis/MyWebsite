<div align="center">

# Dulf Vincent Genis

**Transforming complex data into ethical, human-centered insights.**

[![Live Site](https://img.shields.io/badge/Live-dulfvincent.com-536338?style=for-the-badge)](https://dulfvincent.com)
[![Astro](https://img.shields.io/badge/Astro-5-BC52EE?style=flat-square&logo=astro&logoColor=white)](https://astro.build)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind-v4-38B2AC?style=flat-square&logo=tailwindcss&logoColor=white)](https://tailwindcss.com)
[![TypeScript](https://img.shields.io/badge/TypeScript-5-3178C6?style=flat-square&logo=typescript&logoColor=white)](https://www.typescriptlang.org)
[![License: MIT](https://img.shields.io/badge/License-MIT-blue?style=flat-square)](LICENSE)

Personal portfolio and initiatives site — rebuilt as a fast, accessible static site from a Google Sites export.

[Visit site](https://dulfvincent.com) · [Resume](https://drive.google.com/file/d/1A7A7vCX-RCuU4M4-kiMEhtevwqRHaQ6O/view?usp=sharing) · [LinkedIn](https://linkedin.com/in/dvgenis)

</div>

---

## Overview

This repository powers [dulfvincent.com](https://dulfvincent.com) — a map of my work, background, and initiatives. The site was migrated from Google Sites into a modern [Astro](https://astro.build) stack with Markdown content, custom design tokens, and GitHub Pages deployment.

### Highlights

| | |
| --- | --- |
| **Content-first** | Page copy lives in `src/content/pages/` as Markdown with frontmatter |
| **Command search** | `⌘K` / `Ctrl+K` palette powered by [cmdk](https://cmdk.paco.me) |
| **Backward compatible** | Legacy Google Sites URLs redirect to the new route structure |
| **Rich media** | YouTube embeds, image galleries, and entry cards from Markdown |
| **Custom domain** | Served at `dulfvincent.com` via GitHub Pages + `public/CNAME` |

---

## Tech Stack

```
Astro 5 · React 19 · Tailwind CSS v4 · TypeScript · Motion · cmdk
```

| Layer | Tools |
| --- | --- |
| Framework | [Astro](https://astro.build) with React islands |
| Styling | Tailwind CSS v4, custom design tokens |
| Content | Astro Content Collections (Markdown) |
| Search | cmdk command palette |
| Deploy | GitHub Actions → GitHub Pages |
| Domain | `dulfvincent.com` |

---

## Getting Started

**Prerequisites:** Node.js 20+

```bash
git clone https://github.com/dvjgenis/MyWebsite.git
cd MyWebsite
npm install
npm run dev
```

Open [http://localhost:4321](http://localhost:4321).

### Scripts

| Command | Description |
| --- | --- |
| `npm run dev` | Start local dev server |
| `npm run build` | Production build to `dist/` |
| `npm run preview` | Preview the production build |
| `npm run extract` | Re-extract content from `_export/` dump |
| `npm run redirects` | Regenerate Google Sites redirect map |

---

## Project Structure

```
├── public/                  # Static assets (images, CNAME, favicon)
├── src/
│   ├── components/          # Astro & React UI components
│   ├── content/pages/       # Markdown page content
│   ├── data/                # Navigation, tiles, site metadata
│   ├── layouts/             # Base page layout
│   ├── lib/                 # Rehype plugins & helpers
│   ├── pages/               # Astro route files
│   └── styles/              # Global CSS & design tokens
├── scripts/                 # Content extraction & media tooling
└── .github/workflows/       # GitHub Pages deploy
```

### Site Map

| Route | Description |
| --- | --- |
| `/` | Home |
| `/about/` | About hub — Background, Education, Hobbies, Resources |
| `/initiatives/` | Initiatives hub — Work, Projects, Speaking, Leadership, Abroad, Awards |
| `/contact/` | Contact |

Nested pages mirror the original Google Sites hierarchy (leadership sub-pages, study abroad resources, CITL speaking series, etc.).

---

## Content Pipeline

Page copy and images were extracted from the original Google Sites export in `_export/` (gitignored). To re-extract after editing the dump:

```bash
npm run extract
npm run redirects
```

Extracted Markdown lands in `src/content/pages/`. Images are deduplicated in `public/images/`.

---

## Deployment

Pushes to `main` trigger the GitHub Actions workflow (`.github/workflows/deploy.yml`).

1. Set GitHub Pages source to **GitHub Actions** in repo settings.
2. Push to `main` — the site builds and deploys automatically.
3. Custom domain DNS should point to GitHub Pages; `public/CNAME` is included for `dulfvincent.com`.

```bash
npm run build    # verify locally first
npm run preview
```

---

## License

[MIT](LICENSE) © 2026 [Dulf Vincent Genis](https://dulfvincent.com)
