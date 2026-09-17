#!/usr/bin/env node
/**
 * One-time (idempotent) migration: public/images/{slug}/ → src/content/pages/{slug}/media/
 */
import fs from "node:fs";
import path from "node:path";

const root = path.resolve(import.meta.dirname, "..");
const pagesDir = path.join(root, "src/content/pages");
const imagesDir = path.join(root, "public/images");
const archiveUnused = path.join(root, "archive/media/_unused");

const SKIP = new Set(["shared", "_unused"]);
const IMAGE_EXT = /\.(jpg|jpeg|png|gif|webp|svg|avif)$/i;

function walkPages(dir, acc = []) {
  for (const ent of fs.readdirSync(dir, { withFileTypes: true })) {
    const p = path.join(dir, ent.name);
    if (ent.isDirectory()) walkPages(p, acc);
    else if (ent.name === "index.md") acc.push(path.dirname(p));
  }
  return acc;
}

function listImageFiles(dir) {
  if (!fs.existsSync(dir)) return [];
  return fs.readdirSync(dir).filter((f) => IMAGE_EXT.test(f));
}

function moveFiles(fromDir, toDir, dryRun = false) {
  fs.mkdirSync(toDir, { recursive: true });
  let n = 0;
  for (const name of listImageFiles(fromDir)) {
    const from = path.join(fromDir, name);
    const to = path.join(toDir, name);
    if (fs.existsSync(to)) continue;
    if (!dryRun) fs.renameSync(from, to);
    n += 1;
  }
  return n;
}

function removeEmptyDirs(dir) {
  if (!fs.existsSync(dir)) return;
  for (const ent of fs.readdirSync(dir, { withFileTypes: true })) {
    if (ent.isDirectory()) removeEmptyDirs(path.join(dir, ent.name));
  }
  if (fs.readdirSync(dir).length === 0) fs.rmdirSync(dir);
}

const pageDirs = walkPages(pagesDir);
let moved = 0;
const report = [];

for (const contentDir of pageDirs) {
  const slug = path.relative(pagesDir, contentDir).replace(/\\/g, "/");
  const srcImages = path.join(imagesDir, slug);
  const destMedia = path.join(contentDir, "media");
  const n = moveFiles(srcImages, destMedia);
  if (n) {
    moved += n;
    report.push({ slug, files: n });
  }
}

// shared → src/content/shared/media
const sharedDest = path.join(root, "src/content/shared/media");
moved += moveFiles(path.join(imagesDir, "shared"), sharedDest);

// archive _unused (keep out of public/)
if (fs.existsSync(path.join(imagesDir, "_unused"))) {
  fs.mkdirSync(archiveUnused, { recursive: true });
  for (const name of listImageFiles(path.join(imagesDir, "_unused"))) {
    const from = path.join(imagesDir, "_unused", name);
    const to = path.join(archiveUnused, name);
    if (!fs.existsSync(to)) fs.renameSync(from, to);
  }
  removeEmptyDirs(path.join(imagesDir, "_unused"));
}

removeEmptyDirs(imagesDir);

console.log(JSON.stringify({ moved, pages: report.length, report }, null, 2));
