<div align="center">

# Dulf Vincent Genis

**Transforming complex data into ethical, human-centered insights.**

[![Live Site](https://img.shields.io/badge/Live-dulfvincent.com-536338?style=for-the-badge)](https://dulfvincent.com)
[![Astro](https://img.shields.io/badge/Astro-5-BC52EE?style=flat-square&logo=astro&logoColor=white)](https://astro.build)
[![Vercel](https://img.shields.io/badge/Deploy-Vercel-000000?style=flat-square&logo=vercel&logoColor=white)](https://vercel.com)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind-v4-38B2AC?style=flat-square&logo=tailwindcss&logoColor=white)](https://tailwindcss.com)
[![TypeScript](https://img.shields.io/badge/TypeScript-5-3178C6?style=flat-square&logo=typescript&logoColor=white)](https://www.typescriptlang.org)
[![License: MIT](https://img.shields.io/badge/License-MIT-blue?style=flat-square)](LICENSE)

Personal portfolio and initiatives site — a fast, accessible static site built with Astro.

[Visit site](https://dulfvincent.com) · [Resume](https://drive.google.com/file/d/1A7A7vCX-RCuU4M4-kiMEhtevwqRHaQ6O/view?usp=sharing) · [LinkedIn](https://linkedin.com/in/dvgenis)

</div>

---

## Overview

This repository powers [dulfvincent.com](https://dulfvincent.com) — a map of my work, background, and initiatives. Content lives in Markdown, media is colocated with each page, and the site deploys as a static Astro build on [Vercel](https://vercel.com).

### Highlights

| | |
| --- | --- |
| **Content-first** | Each page is a folder: `index.md` + colocated `media/` assets |
| **Command search** | `⌘K` / `Ctrl+K` palette powered by [cmdk](https://cmdk.paco.me) |
| **Backward compatible** | Legacy Google Sites URLs redirect to the new route structure |
| **Rich media** | YouTube embeds, image galleries, and entry cards from Markdown |
| **Hosted on Vercel** | Production build at `dulfvincent.com` |

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
| Deploy | [Vercel](https://vercel.com) (static output in `dist/`) |
| Domain | `dulfvincent.com` |

---

## Getting Started

**Prerequisites:** Node.js 20.9+ (22 is used in `.nvmrc` and on Vercel)

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
| `npm run dev` | Sync page media, then start the local server |
| `npm run build` | Sync page media, then production build to `dist/` |
| `npm run preview` | Preview the production build |
| `npm run sync:media` | Copy `src/content/**/media/` → `public/images/` |
| `npm run organize:media` | Assign loose images to the page that references them |
| `npm run extract` | Re-extract content from `_export/` dump |
| `npm run redirects` | Regenerates the Google Sites redirect map |

---

## Project Structure

Each site page is a **self-contained folder**: Markdown copy, frontmatter, and images live together. Media is synced into `public/images/` before dev/build so URLs stay stable (`/images/{slug}/…`).

```
├── public/                      # Static files (favicon, CNAME, synced images)
│   └── images/                  # Generated from src/content (npm run sync:media)
├── src/
│   ├── content/
│   │   ├── pages/               # One folder per page
│   │   │   ├── home/
│   │   │   │   ├── index.md
│   │   │   │   └── media/       # Page-owned images
│   │   │   ├── about/
│   │   │   │   ├── index.md
│   │   │   │   ├── media/
│   │   │   │   ├── background/
│   │   │   │   │   ├── index.md
│   │   │   │   │   └── media/
│   │   │   │   └── …
│   │   │   └── initiatives/     # Same pattern (work, abroad, leadership, …)
│   │   └── shared/
│   │       └── media/           # Cross-page images (logos, reused heroes)
│   ├── components/              # Astro & React UI
│   ├── data/                    # Navigation, tiles, redirects
│   ├── layouts/
│   ├── lib/                     # Rehype entry cards, helpers
│   ├── pages/                   # Astro routes ([...slug], hubs, home)
│   └── styles/
├── scripts/
│   ├── sync-page-media.mjs      # content/**/media → public/images
│   ├── organize-media.mjs       # dedupe & assign images to pages
│   └── extract-export.mjs       # Google Sites → Markdown
├── vercel.json                  # Vercel build: Astro → dist/
├── archive/media/_unused/       # Unreferenced export images (gitignored)
└── .github/workflows/           # Optional GitHub Pages workflow
```

### Adding or editing a page

1. Create or edit `src/content/pages/{slug}/index.md` with a matching `slug:` in frontmatter.
2. Put images in `src/content/pages/{slug}/media/`.
3. Reference them as `/images/{slug}/filename.jpg` in frontmatter or markdown.
4. Run `npm run dev` (sync runs automatically).

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

Extracted Markdown lands in `src/content/pages/`. Run `npm run organize:media` to assign images into each page’s `media/` folder, then `npm run sync:media` publishes them to `public/images/`.

---

## Deployment (Vercel)

This is a **static Astro site**. `npm run build` copies colocated page media, then writes HTML, CSS, and assets to `dist/`. No environment variables are required.

### Import the repo

1. In [Vercel](https://vercel.com/new), import `dvjgenis/MyWebsite`.
2. Confirm the project settings (also stored in `vercel.json`):

   | Setting | Value |
   | --- | --- |
   | Framework Preset | Astro |
   | Build Command | `npm run build` |
   | Output Directory | `dist` |
   | Install Command | `npm ci` |
   | Node.js Version | `22.x` (see `.nvmrc`) |

3. Deploy. Every push to `main` produces a new production build; pull requests get preview URLs.

### Custom domain

1. In the Vercel project, add `dulfvincent.com` and `www.dulfvincent.com`.
2. Point DNS at Vercel as shown in the dashboard (Apex `A` record and `www` `CNAME`, or nameservers).
3. Leave HTTPS to Vercel. `public/CNAME` is only used if GitHub Pages is still enabled.

### Verify locally before a release

```bash
npm run build
npm run preview
```

A GitHub Actions workflow (`.github/workflows/deploy.yml`) can still publish `dist/` to GitHub Pages. Disable it in the repo’s Actions settings if Vercel is the only host, so the two do not compete for the custom domain.

---

## License

[MIT](LICENSE) © 2026 [Dulf Vincent Genis](https://dulfvincent.com)
