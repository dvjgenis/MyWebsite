#!/usr/bin/env node
/**
 * Pair YouTube embeds + leftover section images from the Google Sites export
 * with markdown headings, then inject them inline (not dumped at page bottom).
 */
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const EXPORT = path.join(ROOT, "_export");
const CONTENT = path.join(ROOT, "src/content/pages");

const PAGE_MAP = {
  "about/background": "Background.html",
  "about/education": "Education.html",
  "about/hobbies": "Hobbies  Involvements.html",
  "about/resources": "Resources I Love.html",
  "initiatives/work": "Work Experience.html",
  "initiatives/projects": "Volunteerism  Projects.html",
  "initiatives/speaking": "Speaking Engagements.html",
  "initiatives/speaking/citl": "CITL Student Quick Takes series.html",
  "initiatives/leadership": "Leadership Certification.html",
  "initiatives/leadership/personal-development-plan": "Personal Development Plan.html",
  "initiatives/leadership/trainings": "Trainings  Workshops.html",
  "initiatives/leadership/i-programs": "I-Programs.html",
  "initiatives/leadership/team-experiences": "Team Experiences.html",
  "initiatives/leadership/coursework": "Leadership Coursework.html",
  "initiatives/leadership/certificate-coach": "Leadership Certificate Coach.html",
  "initiatives/leadership/community-development-liaison": "Community Development Liaison.html",
  "initiatives/leadership/cumulative-reflection": "Cumulative Reflection.html",
  "initiatives/leadership/technology-commercialization":
    "Technology Commercialization Certification.html",
  "initiatives/abroad": "Study Abroad.html",
  "initiatives/abroad/resources": "Abroad Resources.html",
  "initiatives/awards": "Scholarships  Awards.html",
};

function unescapeHtml(s) {
  return s
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/\\u003d/g, "=")
    .replace(/\\u0026/g, "&");
}

function stripTags(html) {
  return unescapeHtml(html.replace(/<[^>]+>/g, " "))
    .replace(/\s+/g, " ")
    .trim();
}

function norm(s) {
  return (s || "")
    .toLowerCase()
    .replace(/[“”"']/g, "")
    .replace(/&amp;/g, "&")
    .replace(/[^a-z0-9]+/g, " ")
    .trim();
}

function headingKey(s) {
  const n = norm(s);
  const date = n.match(/(\d{2} \d{2} \d{2})$/);
  if (date) return n;
  return n.slice(0, 80);
}

const SKIP_HEADINGS = new Set(
  [
    "skip to main content",
    "skip to navigation",
    "home",
    "about me",
    "background",
    "education",
    "hobbies & involvements",
    "resources i love",
    "initiatives",
    "work experience",
    "volunteerism & projects",
    "speaking engagements",
    "citl student quick takes series",
    "quick takes series",
    "leadership certification",
    "personal development plan",
    "trainings & workshops",
    "i-programs",
    "team experiences",
    "leadership coursework",
    "leadership certificate coach",
    "cumulative reflection",
    "study abroad",
    "abroad resources",
    "scholarships & awards",
    "contact",
    "more",
    "previous",
    "next",
    "table of contents",
    "overview",
    "key responsibilities & achievements",
    "skills developed",
    "impact & reflection",
  ].map(norm),
);

function parseTimeline(html) {
  const items = [];
  const headingRe = /<([a-z0-9]+)([^>]*class="[^"]*(?:duRjpb|JYVBee|OmQG5e|XvmX8b)[^"]*"[^>]*)>/gi;
  let m;
  while ((m = headingRe.exec(html))) {
    const tag = m[1];
    const start = m.index + m[0].length;
    const close = html.indexOf(`</${tag}>`, start);
    if (close < 0) continue;
    const text = stripTags(html.slice(start, close));
    if (!text || text.length > 180) continue;
    if (SKIP_HEADINGS.has(norm(text))) continue;
    items.push({ type: "h", text, pos: m.index, key: headingKey(text) });
  }

  for (const ym of html.matchAll(/youtube\.com\/embed\/([A-Za-z0-9_-]{11})/g)) {
    items.push({ type: "yt", id: ym[1], pos: ym.index });
  }
  for (const ym of html.matchAll(/youtu\.be\/([A-Za-z0-9_-]{11})/g)) {
    items.push({ type: "yt", id: ym[1], pos: ym.index });
  }

  for (const im of html.matchAll(/([a-f0-9]{32})\.(jpe?g|png|webp|gif)/gi)) {
    items.push({
      type: "img",
      path: `/images/${im[1]}.${im[2].toLowerCase()}`,
      pos: im.index,
    });
  }

  items.sort((a, b) => a.pos - b.pos);
  return items;
}

function groupByHeading(items) {
  const map = new Map();
  let current = "__intro__";
  const ensure = (k) => {
    if (!map.has(k)) map.set(k, { youtube: [], images: [], heading: k });
    return map.get(k);
  };
  ensure(current);
  const seenYt = new Set();
  const seenImg = new Set();

  for (const item of items) {
    if (item.type === "h") {
      current = item.text;
      ensure(current).heading = item.text;
      continue;
    }
    const bucket = ensure(current);
    if (item.type === "yt" && !seenYt.has(item.id)) {
      seenYt.add(item.id);
      bucket.youtube.push(item.id);
    }
    if (item.type === "img" && !seenImg.has(item.path)) {
      seenImg.add(item.path);
      bucket.images.push(item.path);
    }
  }
  return map;
}

function findHeadingLine(lines, htmlHeading) {
  const target = headingKey(htmlHeading);
  let best = -1;
  let bestScore = 0;
  for (let i = 0; i < lines.length; i++) {
    const m = lines[i].match(/^#{2,4}\s+(.+)$/);
    if (!m) continue;
    const key = headingKey(m[1]);
    if (key === target) return i;
    if (key.includes(target) || target.includes(key)) {
      const score = Math.min(key.length, target.length);
      if (score > bestScore) {
        bestScore = score;
        best = i;
      }
    }
  }
  return best;
}

function alreadyHasYoutube(block, id) {
  return block.includes(`youtube:${id}`) || block.includes(`/embed/${id}`);
}

function alreadyHasImage(block, imgPath) {
  return block.includes(imgPath);
}

function injectAfterHeading(lines, headingIdx, snippets) {
  if (headingIdx < 0 || !snippets.length) return false;
  let insertAt = headingIdx + 1;
  while (insertAt < lines.length && /^\s*$/.test(lines[insertAt])) insertAt++;
  while (
    insertAt < lines.length &&
    (/^!\[.*\]\([^)]+\)/.test(lines[insertAt].trim()) ||
      /^youtube:[A-Za-z0-9_-]{11}$/.test(lines[insertAt].trim()) ||
      lines[insertAt].includes("youtube-nocookie.com/embed/"))
  ) {
    insertAt++;
    while (insertAt < lines.length && /^\s*$/.test(lines[insertAt])) insertAt++;
  }
  const chunk = ["", ...snippets, ""];
  lines.splice(insertAt, 0, ...chunk);
  return true;
}

function sectionBlock(lines, headingIdx) {
  let end = lines.length;
  for (let i = headingIdx + 1; i < lines.length; i++) {
    if (/^#{2,4}\s+/.test(lines[i])) {
      end = i;
      break;
    }
  }
  return lines.slice(headingIdx, end).join("\n");
}

let changedFiles = 0;

for (const [slug, htmlFile] of Object.entries(PAGE_MAP)) {
  const htmlPath = path.join(EXPORT, htmlFile);
  const mdPath = path.join(CONTENT, ...slug.split("/"), "index.md");
  if (!fs.existsSync(htmlPath) || !fs.existsSync(mdPath)) {
    console.warn("skip missing", slug);
    continue;
  }
  const html = fs.readFileSync(htmlPath, "utf8");
  const grouped = groupByHeading(parseTimeline(html));
  const raw = fs.readFileSync(mdPath, "utf8");
  const fmMatch = raw.match(/^---\n[\s\S]*?\n---\n/);
  const heroMatch = fmMatch?.[0].match(/heroImage:\s+"([^"]+)"/);
  const heroImage = heroMatch?.[1] ?? null;
  const lines = raw.split("\n");
  const bodyStart = fmMatch ? fmMatch[0].split("\n").length - 1 : 0;
  const bodyText = lines.slice(bodyStart).join("\n");
  const usedImages = new Set(
    [...bodyText.matchAll(/\/images\/[a-f0-9]{32}\.(?:jpe?g|png|webp|gif)/gi)].map((x) => x[0]),
  );
  if (heroImage) usedImages.add(heroImage);
  const report = [];

  const collectSnippets = (bucket, existing) => {
    const snippets = [];
    for (const id of bucket.youtube) {
      if (!alreadyHasYoutube(existing, id) && !alreadyHasYoutube(lines.join("\n"), id)) {
        snippets.push(`youtube:${id}`);
      }
    }
    let addedImgs = 0;
    for (const img of bucket.images) {
      if (img === heroImage || usedImages.has(img)) continue;
      if (alreadyHasImage(existing, img) || alreadyHasImage(lines.join("\n"), img)) continue;
      const disk = path.join(ROOT, "public", img.replace(/^\//, ""));
      if (!fs.existsSync(disk)) {
        const folder = path.join(EXPORT, htmlFile.replace(/\.html$/i, ""));
        const src = path.join(folder, path.basename(img));
        if (!fs.existsSync(src)) continue;
        fs.mkdirSync(path.dirname(disk), { recursive: true });
        fs.copyFileSync(src, disk);
      }
      const size = fs.statSync(disk).size;
      if (size < 18000) continue;
      snippets.push(`![](${img})`);
      usedImages.add(img);
      if (++addedImgs >= 6) break;
    }
    return snippets;
  };

  const intro = grouped.get("__intro__");
  if (intro?.youtube?.length) {
    const snippets = collectSnippets({ youtube: intro.youtube, images: [] }, bodyText);
    if (snippets.length) {
      let insertAt = bodyStart + 1;
      while (insertAt < lines.length && /^\s*$/.test(lines[insertAt])) insertAt++;
      lines.splice(insertAt, 0, ...snippets, "");
      report.push(`  + intro yt: ${snippets.join(" | ")}`);
    }
  }

  for (const [htmlHeading, bucket] of grouped) {
    if (htmlHeading === "__intro__") continue;
    const idx = findHeadingLine(lines, htmlHeading);
    if (idx < 0) {
      if (bucket.youtube.length || bucket.images.length) {
        report.push(`  unmatched "${htmlHeading}" yt=${bucket.youtube.join(",")} imgs=${bucket.images.length}`);
      }
      continue;
    }
    const block = sectionBlock(lines, idx);
    const snippets = collectSnippets(bucket, block);
    if (snippets.length) {
      injectAfterHeading(lines, idx, snippets);
      report.push(`  + ${htmlHeading}: ${snippets.length} items`);
    }
  }

  const joined = lines.join("\n");
  const ytBlock = raw.match(/^youtube:\n((?:  - "[^"]+"\n)+)/m);
  const ids = ytBlock
    ? [...ytBlock[1].matchAll(/- "([A-Za-z0-9_-]{11})"/g)].map((x) => x[1])
    : [];
  const leftoverYt = ids.filter((id) => !joined.includes(`youtube:${id}`) && !joined.includes(`/embed/${id}`));
  if (leftoverYt.length) {
    let insertAt = bodyStart + 1;
    while (insertAt < lines.length && /^\s*$/.test(lines[insertAt])) insertAt++;
    lines.splice(insertAt, 0, ...leftoverYt.map((id) => `youtube:${id}`), "");
    report.push(`  leftover yt at top: ${leftoverYt.join(", ")}`);
  }

  const next = lines.join("\n").replace(/\n{3,}/g, "\n\n");
  if (next !== raw) {
    fs.writeFileSync(mdPath, next.endsWith("\n") ? next : `${next}\n`);
    changedFiles++;
  }
  console.log(`\n${slug}`);
  if (report.length) report.forEach((l) => console.log(l));
  else console.log("  (no new inline media)");
}

console.log(`\nUpdated ${changedFiles} markdown files.`);
