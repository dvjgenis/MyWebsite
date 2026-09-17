import fs from "node:fs";
import path from "node:path";
import { spawnSync } from "node:child_process";

const root = path.resolve(import.meta.dirname, "..");
const pagesDir = path.join(root, "src/content/pages");
const sharedMedia = path.join(root, "src/content/shared/media");
const imagesDir = path.join(root, "public/images");
const rewriteRoots = [path.join(root, "src"), path.join(root, "scripts")];

const IMG_RE =
  /\/images\/((?:[a-f0-9]{32}|contact-portrait|food-live-\d+|ryanair-logo|ilc-live-logo)\.(?:jpg|jpeg|png|gif|webp|svg))/gi;

function walk(dir, acc = []) {
  for (const ent of fs.readdirSync(dir, { withFileTypes: true })) {
    if (ent.name === "node_modules" || ent.name === ".git" || ent.name === ".astro") continue;
    const p = path.join(dir, ent.name);
    if (ent.isDirectory()) walk(p, acc);
    else acc.push(p);
  }
  return acc;
}

function pageDest(file) {
  return path
    .relative(pagesDir, file)
    .replaceAll("\\", "/")
    .replace(/\/index\.md$/, "")
    .replace(/\.md$/, "");
}

function mediaDir(slug) {
  return slug === "shared" ? sharedMedia : path.join(pagesDir, slug, "media");
}

const owners = new Map();
const mdFiles = walk(pagesDir).filter((f) => f.endsWith(".md"));

for (const file of mdFiles) {
  const dest = pageDest(file);
  const text = fs.readFileSync(file, "utf8");
  for (const match of text.matchAll(IMG_RE)) {
    const base = match[1];
    if (!owners.has(base)) owners.set(base, new Set());
    owners.get(base).add(dest);
  }
}

function destination(base) {
  const set = owners.get(base);
  if (!set || set.size === 0) return "archive";
  if (set.size > 1) return "shared";
  return [...set][0];
}

const mapping = new Map();

function findExisting(base) {
  const candidates = [];
  const stack = [imagesDir, ...walk(pagesDir).filter((f) => f.endsWith("media") && fs.statSync(f).isDirectory())];
  for (const dir of stack) {
    if (!fs.existsSync(dir)) continue;
    if (fs.statSync(dir).isFile() && path.basename(dir) === base) return dir;
    if (!fs.statSync(dir).isDirectory()) continue;
    const direct = path.join(dir, base);
    if (fs.existsSync(direct) && fs.statSync(direct).isFile()) candidates.push(direct);
    for (const ent of fs.readdirSync(dir, { withFileTypes: true })) {
      if (ent.isFile() && ent.name === base) candidates.push(path.join(dir, ent.name));
    }
  }
  return candidates[0] || null;
}

for (const [base] of owners) {
  const dest = destination(base);
  const src = findExisting(base);
  if (!src) {
    console.warn("missing image", base);
    continue;
  }
  const destDir = mediaDir(dest === "archive" ? "_unused" : dest);
  if (dest === "archive") {
    const archiveDir = path.join(root, "archive/media/_unused");
    fs.mkdirSync(archiveDir, { recursive: true });
    const destFile = path.join(archiveDir, base);
    if (path.resolve(src) !== path.resolve(destFile)) {
      if (fs.existsSync(destFile)) fs.unlinkSync(src);
      else fs.renameSync(src, destFile);
    }
    mapping.set(base, `/images/_unused/${base}`);
    continue;
  }
  fs.mkdirSync(destDir, { recursive: true });
  const destFile = path.join(destDir, base);
  if (path.resolve(src) !== path.resolve(destFile)) {
    if (fs.existsSync(destFile)) fs.unlinkSync(src);
    else fs.renameSync(src, destFile);
  }
  const urlSlug = dest === "shared" ? "shared" : dest;
  mapping.set(base, `/images/${urlSlug}/${base}`);
}

function rewrite(text) {
  return text.replace(IMG_RE, (full, base) => mapping.get(base) || full);
}

const rewriteExt = /\.(md|astro|ts|js|mjs|tsx|jsx|css|json)$/;
let changed = 0;
for (const dir of rewriteRoots) {
  for (const file of walk(dir).filter((f) => rewriteExt.test(f))) {
    const text = fs.readFileSync(file, "utf8");
    const next = rewrite(text);
    if (next !== text) {
      fs.writeFileSync(file, next);
      changed += 1;
    }
  }
}

spawnSync(process.execPath, [path.join(root, "scripts/sync-page-media.mjs")], {
  stdio: "inherit",
});

const counts = {};
for (const dest of mapping.values()) {
  const folder = dest.replace(/^\/images\//, "").replace(/\/[^/]+$/, "");
  counts[folder] = (counts[folder] || 0) + 1;
}

console.log(JSON.stringify({ filesRewritten: changed, folders: counts, mapped: mapping.size }, null, 2));
