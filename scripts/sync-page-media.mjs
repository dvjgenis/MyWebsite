#!/usr/bin/env node
/**
 * Copy colocated page media into public/images for static serving.
 * Source of truth: src/content/pages/{slug}/media/
 * Published URLs stay /images/{slug}/filename (unchanged in markdown).
 */
import fs from "node:fs";
import path from "node:path";

const root = path.resolve(import.meta.dirname, "..");
const pagesDir = path.join(root, "src/content/pages");
const sharedSrc = path.join(root, "src/content/shared/media");
const imagesDir = path.join(root, "public/images");

const MEDIA = "media";
const IMAGE_EXT = /\.(jpg|jpeg|png|gif|webp|svg|avif)$/i;

function walkPages(dir, acc = []) {
  for (const ent of fs.readdirSync(dir, { withFileTypes: true })) {
    const p = path.join(dir, ent.name);
    if (ent.isDirectory()) walkPages(p, acc);
    else if (ent.name === "index.md") acc.push(p);
  }
  return acc;
}

function slugFromPage(file) {
  return path.relative(pagesDir, file).replace(/\\/g, "/").replace(/\/index\.md$/, "");
}

function copyDir(src, dest) {
  if (!fs.existsSync(src)) return 0;
  fs.mkdirSync(dest, { recursive: true });
  let n = 0;
  for (const ent of fs.readdirSync(src, { withFileTypes: true })) {
    if (!ent.isFile() || !IMAGE_EXT.test(ent.name)) continue;
    const from = path.join(src, ent.name);
    const to = path.join(dest, ent.name);
    fs.copyFileSync(from, to);
    n += 1;
  }
  return n;
}

function cleanGeneratedExcept(keepDirs) {
  if (!fs.existsSync(imagesDir)) return;
  for (const ent of fs.readdirSync(imagesDir, { withFileTypes: true })) {
    if (!ent.isDirectory()) continue;
    if (ent.name === "shared" || ent.name === "_unused") continue;
    if (keepDirs.has(ent.name)) continue;
    // nested slugs like about/background live under about/ — only prune empty top-level orphans later
  }
}

let copied = 0;
const synced = [];

for (const page of walkPages(pagesDir)) {
  const slug = slugFromPage(page);
  const src = path.join(path.dirname(page), MEDIA);
  const dest = path.join(imagesDir, slug);
  const n = copyDir(src, dest);
  if (n) {
    copied += n;
    synced.push({ slug, files: n });
  }
}

copied += copyDir(sharedSrc, path.join(imagesDir, "shared"));

console.log(
  JSON.stringify(
    {
      copied,
      pages: synced.length,
      synced: synced.sort((a, b) => a.slug.localeCompare(b.slug)),
    },
    null,
    2,
  ),
);
