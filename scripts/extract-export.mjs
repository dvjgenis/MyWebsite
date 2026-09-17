#!/usr/bin/env node
/**
 * Extract Google Sites HTML dump → Markdown using theme heading classes.
 * Run: npm run extract
 */
import fs from "node:fs";
import path from "node:path";
import crypto from "node:crypto";
import { fileURLToPath } from "node:url";

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const EXPORT = path.join(ROOT, "_export");
const OUT_CONTENT = path.join(ROOT, "src/content/pages");
const OUT_IMAGES = path.join(ROOT, "public/images");

const PAGE_MAP = {
  home: "Home.html",
  about: "About Me.html",
  "about/background": "Background.html",
  "about/education": "Education.html",
  "about/hobbies": "Hobbies  Involvements.html",
  "about/resources": "Resources I Love.html",
  initiatives: "Initiatives.html",
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
  contact: "Contact.html",
};

const HEADING = {
  duRjpb: "##",
  JYVBee: "##",
  OmQG5e: "###",
  XvmX8b: "####",
};

const NAV_SKIP = new Set([
  "Skip to main content",
  "Skip to navigation",
  "Home",
  "About Me",
  "Background",
  "Education",
  "Hobbies & Involvements",
  "Resources I Love",
  "Initiatives",
  "Work Experience",
  "Volunteerism & Projects",
  "Speaking Engagements",
  "CITL Student Quick Takes series",
  "Leadership Certification",
  "Personal Development Plan",
  "Trainings & Workshops",
  "I-Programs",
  "Team Experiences",
  "Leadership Coursework",
  "Leadership Certificate Coach",
  "Cumulative Reflection",
  "Study Abroad",
  "Abroad Resources",
  "Scholarships & Awards",
  "Contact",
  "More",
  "Previous",
  "Next",
  "Dulf Vincent Genis",
  "Instagram",
  "LinkedIn",
  "Snapchat",
  "Link",
  "Google Sites",
  "Report abuse",
  "Page details",
  "Page updated",
  "Search this site",
  "Embedded Files",
]);

const SOCIAL_HOST = /instagram\.com|linkedin\.com|snapchat\.com|blinq\.me|gstatic\.com|google\.com\/url/;

/** Hub section titles that also appear in the Google Sites nav — keep when they introduce body copy. */
const HUB_HEADINGS = new Set([
  "Background",
  "Education",
  "Hobbies & Involvements",
  "Involvements",
  "Resources I Love",
  "Work Experience",
  "Volunteerism & Projects",
  "Volunteerism",
  "Speaking Engagements",
  "Leadership Certification",
  "Study Abroad",
  "Scholarships & Awards",
  "Connect with Me",
  "Write Me",
  "Featured",
  "Leadership Biography",
]);

const STRUCTURAL_REPEAT =
  /^(Overview|Key Responsibilities & Achievements|Skills Developed|Impact & Reflection)\s*:?\s*$/;

const RESOURCE_HEADINGS = new Set([
  "Illinois Scholars Program",
  "Illinois Leadership Center",
  "Technology Entrepreneurship Center",
  "Innovation Studio Armory",
  "Research Park",
  "University YMCA",
  "Career Center",
  "Office of Diversity, Equity, and Inclusion",
  "Office of Undergraduate Research",
  "iVenture Accelerator",
  "International Education",
  "The Jeffries Center",
  "Office of Civic Life",
  "Center for Innovation in Teaching and Learning",
  "Education Abroad",
  "Writer's Workshop",
  "Best AI Tools! (Coming Soon!)",
  "Also, free and affordable weekly food deals!",
  "Monday",
  "Tuesday",
  "Wednesday",
  "Thursday",
  "Friday",
]);

const AWARD_HEADINGS = new Set([
  "The Fred S. Bailey Scholarship",
  "The Arion Award",
  "The National School Orchestra Award",
  "The Senior Service Award",
  "The Good Will Awards",
  "The Ambassador Award",
  "The 2022-23 Illinois State Scholar",
  "ILMEA All-State Honors Chorus",
  "The DAR Good Citizen Award & Scholarship",
  "The DAR Good Citizen Award & Sch olarship",
  "ILMEA District #7 Chorus",
]);

const PAGE_DESCRIPTIONS = {
  home: "Transforming complex data into ethical, human-centered insights.",
  about: "Explore my background, education, involvement, and resources that have helped me along the way.",
  "about/background": "Essays on identity, rest, and rootedness in two worlds.",
  "about/education": "From the Philippines to the iSchool at Illinois.",
  "about/hobbies": "Music, faith, community, and cultural ventures.",
  "about/resources": "Campus gems and the people who power them.",
  initiatives: "Snapshots of my journey and the opportunities that have been laid before me.",
  "initiatives/work": "Roles across data science, student success, research, and community development.",
  "initiatives/projects": "Community impact, technical innovations, and global service.",
  "initiatives/speaking": "Research talks, workshops, and student voice panels.",
  "initiatives/speaking/citl": "Conversations with Illinois students about learning, courses, and careers.",
  "initiatives/leadership": "Illinois Leadership Center journey, competencies, and reflection.",
  "initiatives/abroad": "A compilation of my journey in Granada, Spain, and the people who defined it.",
  "initiatives/abroad/resources": "Guides, tools, and notes from a semester abroad.",
  "initiatives/awards": "Recognitions, scholarships, and awards across campus and community.",
  contact: "Connect with me or send a note.",
};

const HOME_IMAGE_SLOTS = {
  heroImage: "f99a4c5f7983656763695d5dd1356c39.jpg",
  featuredLeftImage: "419166930a5053d442cb4705cf2ad07a.jpg",
  featuredChartImage: "c4d1452cb4a3cacdbc1130341e656fe2.jpg",
  featuredRightImage: "372fb745f813e8de7990ab3165f779cc.jpg",
};

const ABOUT_HUB_SLOTS = {
  cardBackgroundImage: "3c6f10322233f4da640102112ccb4020.jpg",
  cardEducationImage: "e117d705c9e097558dc194a6692ddf8c.jpg",
  cardInvolvementsImage: "91b44fd8fc67d4f4db0ace4f67bafc9a.jpg",
  cardResourcesImage: "bd3632746bff69b72f4ebd93aaef9676.jpg",
};

/** Google Sites spacer / blank tiles — never treat as content photos. */
const SPACER_IMAGE_HASHES = new Set([
  "1a310be558bf371635d658f42d2a03b0",
  "7de60822e75bc6fc1104f1b919e41cb5",
  "fcedc46b505fd929bcda2f70639fd655",
  "51ec993043ae182e77e8b0fef6058193",
  "ed98c8fd31c31f0c1afeead883270ea5",
  "ebd06fc2c564b103cb00fcdc6823da45",
]);

const imageRegistry = new Map();

function unescapeHtml(s) {
  return s
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&nbsp;/g, " ")
    .replace(/&#(\d+);/g, (_, n) => String.fromCharCode(Number(n)))
    .replace(/&#x([0-9a-f]+);/gi, (_, n) => String.fromCharCode(parseInt(n, 16)));
}

function stripTags(html) {
  return unescapeHtml(html.replace(/<br\s*\/?>/gi, "\n").replace(/<[^>]+>/g, " "))
    .replace(/\s+/g, " ")
    .trim();
}

function extractTitle(html) {
  const m = html.match(/<title>(.*?)<\/title>/i);
  if (!m) return "Untitled";
  let t = unescapeHtml(m[1]).replace(/^Dulf Vincent Genis\s*-\s*/i, "").trim();
  if (!t || t === "Dulf Vincent Genis") return "Home";
  return t;
}

function classOf(tag) {
  const m = tag.match(/\bclass="([^"]*)"/i);
  return m ? m[1] : "";
}

/** Walk body HTML and emit structured blocks from Google Sites theme classes. */
function extractBlocks(bodyHtml) {
  const blocks = [];
  const re = /<([a-z0-9]+)([^>]*)>/gi;
  let match;
  while ((match = re.exec(bodyHtml))) {
    const tag = match[1].toLowerCase();
    const attrs = match[2];
    const cls = classOf(`x${attrs}`);
    const prefix =
      cls.includes("duRjpb") || cls.includes("JYVBee")
        ? "##"
        : cls.includes("OmQG5e")
          ? "###"
          : cls.includes("XvmX8b")
            ? "####"
            : cls.includes("zfr3Q")
              ? "p"
              : null;
    if (!prefix) continue;

    const start = match.index + match[0].length;
    const close = `</${tag}>`;
    // Find matching close at this nesting level (simple: next close of same tag that isn't nested)
    let depth = 1;
    let i = start;
    const openRe = new RegExp(`<${tag}\\b`, "gi");
    const closeRe = new RegExp(`</${tag}>`, "gi");
    let innerEnd = -1;
    while (i < bodyHtml.length && depth > 0) {
      openRe.lastIndex = i;
      closeRe.lastIndex = i;
      const o = openRe.exec(bodyHtml);
      const c = closeRe.exec(bodyHtml);
      if (!c) break;
      if (o && o.index < c.index) {
        depth++;
        i = o.index + 1;
      } else {
        depth--;
        if (depth === 0) innerEnd = c.index;
        i = c.index + 1;
      }
    }
    if (innerEnd < 0) continue;
    const text = stripTags(bodyHtml.slice(start, innerEnd));
    if (!text) continue;
    blocks.push({ kind: prefix, text });
    re.lastIndex = innerEnd;
  }
  return blocks;
}

function isNoise(text, nextText) {
  if (!text) return true;
  if (NAV_SKIP.has(text)) {
    const nextPlain = (nextText || "").replace(/^#+\s*/, "");
    if (
      HUB_HEADINGS.has(text) &&
      nextPlain.length > 40 &&
      !NAV_SKIP.has(nextPlain) &&
      !HUB_HEADINGS.has(nextPlain)
    ) {
      return false;
    }
    return true;
  }
  if (/^https?:\/\//.test(text) && SOCIAL_HOST.test(text)) return true;
  if (text.length < 2) return true;
  if (text.startsWith(".") && text.includes("{")) return true;
  if (/^function\s|_DumpException|WIZ_global/.test(text)) return true;
  return false;
}

function isRepeatable(text) {
  return (
    STRUCTURAL_REPEAT.test(text) ||
    /^.+\(\d{2}\.\d{2}\.\d{2}\)$/.test(text) ||
    text === "Table of Contents" ||
    text === "Connections:"
  );
}

function blocksToMarkdown(blocks, pageTitle) {
  const lines = [];
  const seen = new Set();

  for (let i = 0; i < blocks.length; i++) {
    const b = blocks[i];
    let t = b.text;
    const next = blocks.slice(i + 1).find((x) => x.text && x.text !== t);
    if (isNoise(t, next?.text)) continue;
    if (t === pageTitle) continue;
    if (t === "----------------------------------") continue;
    if (/^(Instagram|LinkedIn|Snapchat|Link)$/.test(t)) continue;
    if (seen.has(t) && !isRepeatable(t)) continue;
    if (!isRepeatable(t)) seen.add(t);

    // Google Sites sometimes puts captions in heading classes
    const kind = b.kind !== "p" && t.length > 110 ? "p" : b.kind;

    if (kind !== "p") {
      lines.push(`\n${kind} ${t}\n`);
      continue;
    }

    lines.push(`${t}\n`);
  }

  return lines.join("\n").replace(/\n{3,}/g, "\n\n").trim();
}

function extractQuote(markdown) {
  const intro = markdown.split(/^##\s/m)[0];
  if (!intro.trim()) return null;
  const quoteMatch = intro.match(/^[“"]([\s\S]{40,900}?)[”"]/m) || intro.match(/^"([\s\S]{40,900}?)"/m);
  if (!quoteMatch) return null;
  const quote = quoteMatch[1].replace(/\s+/g, " ").trim();
  const after = intro.slice(quoteMatch.index + quoteMatch[0].length);
  const authorMatch = after.match(/^\s*[–—-]\s*([^\n]{4,160})/m) || after.match(/\n\s*[–—-]\s*([^\n]{4,160})/);
  return { quote, author: authorMatch ? authorMatch[1].replace(/^–\s*/, "").trim() : "" };
}

function extractYoutubeIds(html) {
  const ids = new Set();
  for (const m of html.matchAll(/youtube\.com\/embed\/([A-Za-z0-9_-]{11})/g)) ids.add(m[1]);
  for (const m of html.matchAll(/youtu\.be\/([A-Za-z0-9_-]{11})/g)) ids.add(m[1]);
  return [...ids];
}

function extractExternalLinks(body) {
  const links = [];
  const seen = new Set();
  for (const m of body.matchAll(/href="(https?:\/\/[^"]+)"/g)) {
    let url = unescapeHtml(m[1]);
    if (url.includes("google.com/url?q=")) {
      try {
        const u = new URL(url);
        const q = u.searchParams.get("q");
        if (q) url = decodeURIComponent(q);
      } catch {
        /* keep */
      }
    }
    if (SOCIAL_HOST.test(url) && !url.includes("docs.google.com/forms") && !url.includes("drive.google.com"))
      continue;
    if (url.includes("sites.google.com") || url.includes("gstatic.com")) continue;
    if (seen.has(url)) continue;
    seen.add(url);
    links.push(url);
  }
  return links;
}

function registerImage(srcPath, { allowSmall = false } = {}) {
  if (!fs.existsSync(srcPath)) return null;
  const buf = fs.readFileSync(srcPath);
  const hash = crypto.createHash("md5").update(buf).digest("hex");
  if (SPACER_IMAGE_HASHES.has(hash)) return null;
  if (!allowSmall && buf.length < 20000) return null;
  if (imageRegistry.has(hash)) return imageRegistry.get(hash);
  const ext = path.extname(srcPath).toLowerCase() || ".jpg";
  fs.mkdirSync(OUT_IMAGES, { recursive: true });
  const dest = path.join(OUT_IMAGES, `${hash}${ext}`);
  if (!fs.existsSync(dest)) fs.copyFileSync(srcPath, dest);
  const publicPath = `/images/${hash}${ext}`;
  imageRegistry.set(hash, publicPath);
  return publicPath;
}

/** Same as extractBlocks but records source position for DOM-order image pairing. */
function extractBlocksWithPositions(bodyHtml) {
  const blocks = [];
  const re = /<([a-z0-9]+)([^>]*)>/gi;
  let match;
  while ((match = re.exec(bodyHtml))) {
    const tag = match[1].toLowerCase();
    const attrs = match[2];
    const cls = classOf(`x${attrs}`);
    const prefix =
      cls.includes("duRjpb") || cls.includes("JYVBee")
        ? "##"
        : cls.includes("OmQG5e")
          ? "###"
          : cls.includes("XvmX8b")
            ? "####"
            : cls.includes("zfr3Q")
              ? "p"
              : null;
    if (!prefix) continue;

    const start = match.index + match[0].length;
    let depth = 1;
    let i = start;
    const openRe = new RegExp(`<${tag}\\b`, "gi");
    const closeRe = new RegExp(`</${tag}>`, "gi");
    let innerEnd = -1;
    while (i < bodyHtml.length && depth > 0) {
      openRe.lastIndex = i;
      closeRe.lastIndex = i;
      const o = openRe.exec(bodyHtml);
      const c = closeRe.exec(bodyHtml);
      if (!c) break;
      if (o && o.index < c.index) {
        depth++;
        i = o.index + 1;
      } else {
        depth--;
        if (depth === 0) innerEnd = c.index;
        i = c.index + 1;
      }
    }
    if (innerEnd < 0) continue;
    const text = stripTags(bodyHtml.slice(start, innerEnd));
    if (!text) continue;
    blocks.push({ kind: prefix, text, pos: match.index });
    re.lastIndex = innerEnd;
  }
  return blocks;
}

function extractSectionImagesFromHtml(bodyHtml, htmlFilename) {
  const folder = path.join(EXPORT, htmlFilename.replace(/\.html$/i, ""));
  const items = [];

  for (const b of extractBlocksWithPositions(bodyHtml)) {
    if (b.kind !== "p") items.push({ type: "heading", pos: b.pos, text: b.text });
  }

  for (const m of bodyHtml.matchAll(/<img[^>]+src="([^"]+)"/gi)) {
    const src = unescapeHtml(m[1]).replace(/\\/g, "/");
    const hashMatch = src.match(/([a-f0-9]{32})\.(jpe?g|png|webp|gif)/i);
    if (!hashMatch) continue;
    const filename = `${hashMatch[1]}.${hashMatch[2].toLowerCase()}`;
    const imgPath = registerImage(path.join(folder, filename), { allowSmall: true });
    if (imgPath) items.push({ type: "img", pos: m.index, path: imgPath });
  }

  items.sort((a, b) => a.pos - b.pos);

  let currentHeading = null;
  const map = new Map();
  for (const item of items) {
    if (item.type === "heading") currentHeading = item.text;
    else if (item.type === "img" && currentHeading) {
      if (!map.has(currentHeading)) map.set(currentHeading, []);
      const arr = map.get(currentHeading);
      if (!arr.includes(item.path)) arr.push(item.path);
    }
  }
  return map;
}

function injectSectionImages(markdown, sectionMap, heroImage) {
  const lines = markdown.split("\n");
  const out = [];
  for (const line of lines) {
    out.push(line);
    const m = line.match(/^#{2,4}\s+(.+)$/);
    if (!m) continue;
    const heading = m[1].trim();
    const images = sectionMap.get(heading);
    if (!images?.length) continue;
    for (const img of images) {
      if (img === heroImage) continue;
      out.push("");
      out.push(`![](${img})`);
    }
  }
  return out.join("\n");
}

function extractSectionYoutubeFromHtml(bodyHtml) {
  const items = [];
  for (const b of extractBlocksWithPositions(bodyHtml)) {
    if (b.kind !== "p") items.push({ type: "heading", pos: b.pos, text: b.text });
  }
  for (const m of bodyHtml.matchAll(/youtube\.com\/embed\/([A-Za-z0-9_-]{11})/g)) {
    items.push({ type: "yt", pos: m.index, id: m[1] });
  }
  items.sort((a, b) => a.pos - b.pos);
  let currentHeading = null;
  const map = new Map();
  const seen = new Set();
  for (const item of items) {
    if (item.type === "heading") currentHeading = item.text;
    else if (item.type === "yt" && currentHeading && !seen.has(item.id)) {
      seen.add(item.id);
      if (!map.has(currentHeading)) map.set(currentHeading, []);
      map.get(currentHeading).push(item.id);
    }
  }
  return map;
}

function injectSectionYoutube(markdown, sectionMap) {
  const lines = markdown.split("\n");
  const out = [];
  const used = new Set();
  for (const line of lines) {
    out.push(line);
    const m = line.match(/^#{2,4}\s+(.+)$/);
    if (!m) continue;
    const ids = sectionMap.get(m[1].trim());
    if (!ids?.length) continue;
    for (const id of ids) {
      if (used.has(id) || markdown.includes(`youtube:${id}`)) continue;
      used.add(id);
      out.push("");
      out.push(`youtube:${id}`);
    }
  }
  return out.join("\n");
}

function extractOrderedImages(bodyHtml, htmlFilename, heroImage) {
  const folder = path.join(EXPORT, htmlFilename.replace(/\.html$/i, ""));
  const paths = [];
  for (const m of bodyHtml.matchAll(/<img[^>]+src="([^"]+)"/gi)) {
    const src = unescapeHtml(m[1]).replace(/\\/g, "/");
    const hashMatch = src.match(/([a-f0-9]{32})\.(jpe?g|png|webp|gif)/i);
    if (!hashMatch) continue;
    const filename = `${hashMatch[1]}.${hashMatch[2].toLowerCase()}`;
    const imgPath = registerImage(path.join(folder, filename), { allowSmall: true });
    if (imgPath && imgPath !== heroImage) paths.push(imgPath);
  }
  return paths;
}

/** Resources titles are plain text in export, not theme headings — pair images to ## sections in DOM order. */
function injectSequentialSectionImages(markdown, orderedImages) {
  const skipHeadings = new Set([
    "Best AI Tools! (Coming Soon!)",
    "Also, free and affordable weekly food deals!",
    "iSchool, University of Illinois (2022 - 2026)",
  ]);
  const lines = markdown.split("\n");
  const out = [];
  let imgIdx = 0;
  for (const line of lines) {
    out.push(line);
    const m = line.match(/^##\s+(.+)$/);
    if (!m) continue;
    const heading = m[1].trim();
    if (skipHeadings.has(heading) || imgIdx >= orderedImages.length) continue;
    out.push("");
    out.push(`![](${orderedImages[imgIdx++]})`);
  }
  return out.join("\n");
}

function extractImagesFromHtml(html, htmlFilename) {
  const folder = path.join(EXPORT, htmlFilename.replace(/\.html$/i, ""));
  const hashes = new Set();
  for (const m of html.matchAll(/([a-f0-9]{32})\.(jpe?g|png|webp|gif)/gi)) {
    hashes.add(`${m[1]}.${m[2].toLowerCase()}`);
  }
  const images = [];
  if (fs.existsSync(folder)) {
    const names = hashes.size ? [...hashes] : fs.readdirSync(folder).filter((f) => /\.(jpe?g|png|webp)$/i.test(f));
    for (const name of names) {
      const p = registerImage(path.join(folder, name));
      if (p) images.push(p);
    }
  }
  images.sort((a, b) => {
    const sa = fs.statSync(path.join(ROOT, "public", a)).size;
    const sb = fs.statSync(path.join(ROOT, "public", b)).size;
    return sb - sa;
  });
  return images.slice(0, 10);
}

function yamlEscape(s) {
  if (!s) return '""';
  return JSON.stringify(s);
}

function promoteStructuralHeadings(markdown, slug) {
  const lines = markdown.split("\n");
  const out = [];
  let afterToc = false;
  let tocDone = false;
  const tocTitles = new Set();
  const leadershipChildren = new Set([
    "Personal Development Plan",
    "Trainings & Workshops",
    "I-Programs",
    "Team Experiences",
    "Leadership Coursework",
    "Leadership Certificate Coach",
    "Cumulative Reflection",
    "Community Development Liaison",
    "Technology Commercialization Certification",
  ]);

  for (let i = 0; i < lines.length; i++) {
    const raw = lines[i];
    let t = raw.trim();

    if (/^##?\s*$/.test(t) || t === "##") continue;

    if (slug === "initiatives/speaking/citl" && /^(##\s*)?(CITL Student|Quick Takes series)$/i.test(t)) {
      continue;
    }

    if (/^##?\s*Table of Contents$/i.test(t) || t === "Table of Contents") {
      out.push("## Table of Contents\n");
      afterToc = true;
      continue;
    }

    if (afterToc && !tocDone) {
      const plain = t.replace(/^#+\s*/, "");
      if (!plain) {
        out.push("");
        continue;
      }
      if (plain.length > 90) {
        tocDone = true;
      } else if (/^.+\(\d{2}\.\d{2}\.\d{2}\)$/.test(plain) && !tocTitles.has(plain)) {
        tocTitles.add(plain);
        const id = plain
          .toLowerCase()
          .replace(/[^a-z0-9]+/g, "-")
          .replace(/^-|-$/g, "");
        out.push(`- [${plain}](#${id})`);
        continue;
      } else {
        tocDone = true;
      }
    }

    const plain = t.replace(/^#+\s*/, "");

    if (slug === "initiatives/leadership" && leadershipChildren.has(plain)) continue;

    if (/^.+\(\d{2}\.\d{2}\.\d{2}\)$/.test(t) && !t.startsWith("#")) {
      out.push(`\n## ${t}\n`);
      continue;
    }

    if (
      /^.+\|.+\|.+$/.test(plain) &&
      !t.startsWith("#") &&
      /\b(Part-time|Full-time|Internship|Seasonal|Freelance)\s*$/.test(plain)
    ) {
      out.push(`## ${plain}\n`);
      continue;
    }

    if (slug === "initiatives/leadership/team-experiences") {
      if (
        (plain.endsWith("?") && plain.length > 40 && !t.startsWith("#")) ||
        (plain.startsWith("The Digital Equity") && !t.startsWith("#"))
      ) {
        out.push(`## ${plain}\n`);
        continue;
      }
    }

    if (STRUCTURAL_REPEAT.test(plain) && !t.startsWith("###")) {
      out.push(`### ${plain.replace(/\s*:?\s*$/, "")}\n`);
      continue;
    }

    if (
      /^(Leadership Biography|Connect with Me|Write Me|Featured|An Overview|Spanish Classes Taken Abroad|Some Highlights and Important Events|My Definition of Leadership)$/.test(
        plain,
      ) &&
      !t.startsWith("#")
    ) {
      out.push(`## ${plain}\n`);
      continue;
    }

    if (HUB_HEADINGS.has(plain) && !t.startsWith("#")) {
      out.push(`## ${plain}\n`);
      continue;
    }

    if (RESOURCE_HEADINGS.has(plain) && !t.startsWith("#")) {
      const level = /^(Monday|Tuesday|Wednesday|Thursday|Friday)$/.test(plain) ? "###" : "##";
      out.push(`${level} ${plain}\n`);
      continue;
    }

    if (plain === "Connections:" && !t.startsWith("#")) {
      out.push(`#### Connections\n`);
      continue;
    }

    if ((AWARD_HEADINGS.has(plain) || /^LEAD \d{3}\b/.test(plain)) && !t.startsWith("#")) {
      out.push(`## ${plain.replace(/Sch olarship/, "Scholarship")}\n`);
      continue;
    }

    if (t.startsWith("#")) {
      let heading = t
        .replace(/Filter of Hope: Costa Rica 202 6/g, "Filter of Hope: Costa Rica 2026")
        .replace(/I nnovation - 12 \. 03 \.202 2/g, "Innovation - 12.03.2022")
        .replace(/Episode 6\s*:/, "Episode 6")
        .replace(/IlliniOverlap :/g, "IlliniOverlap:")
        .replace(/Chicago Air Quality :/g, "Chicago Air Quality:");
      out.push(heading);
      continue;
    }

    t = t.replace(/Filter of Hope: Costa Rica 202 6/g, "Filter of Hope: Costa Rica 2026");
    out.push(t ? t : raw);
  }

  return out
    .join("\n")
    .replace(/\n{3,}/g, "\n\n")
    .replace(/(\- \[[^\n]+)\n\n(?=[-*] )/g, "$1\n")
    .trim();
}

function listifyJobSections(markdown) {
  const lines = markdown.split("\n");
  const out = [];
  let mode = null;

  for (const raw of lines) {
    const t = raw.trim();
    if (/^### (Key Responsibilities & Achievements|Skills Developed)/.test(t)) {
      mode = "list";
      out.push(raw);
      continue;
    }
    if (/^#{1,3} /.test(t)) {
      mode = null;
      out.push(raw);
      continue;
    }
    if (mode === "list" && t && !t.startsWith("- ") && t.length < 280) {
      out.push(`- ${t}`);
      continue;
    }
    if (mode === "list" && t.length >= 280) mode = null;
    out.push(raw);
  }

  return out.join("\n").replace(/\n{3,}/g, "\n\n").trim();
}

function firstDescription(markdown, title, slug) {
  if (PAGE_DESCRIPTIONS[slug]) return PAGE_DESCRIPTIONS[slug];
  const paras = markdown
    .split(/\n\n+/)
    .map((p) => p.replace(/^#+\s+/, "").replace(/^[-*]\s+/, "").trim())
    .filter((p) => p.length > 40 && !p.startsWith('"') && !p.startsWith("“") && p !== title);
  return paras[0]?.slice(0, 220) || title;
}

function stripQuoteFromMarkdown(markdown, quote) {
  if (!quote) return markdown;
  const escaped = quote.slice(0, 40).replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  return markdown
    .replace(new RegExp(`[“"][^“"]{0,20}${escaped}[\\s\\S]{0,900}?[”"]`, "m"), "")
    .replace(/^\s*[–—-]\s*[^\n]+\n/, "")
    .trim();
}

function writePage(slug, htmlFile) {
  const htmlPath = path.join(EXPORT, htmlFile);
  if (!fs.existsSync(htmlPath)) {
    console.warn(`Missing: ${htmlFile}`);
    return;
  }
  const raw = fs.readFileSync(htmlPath, "utf8");
  const bodyIdx = raw.toLowerCase().indexOf("<body");
  const body = raw
    .slice(bodyIdx >= 0 ? bodyIdx : 0)
    .replace(/<script[\s\S]*?<\/script>/gi, " ")
    .replace(/<style[\s\S]*?<\/style>/gi, " ");

  const title = extractTitle(raw);
  const blocks = extractBlocks(body);
  let markdown = blocksToMarkdown(blocks, title);
  const quote = extractQuote(markdown);
  if (quote) markdown = stripQuoteFromMarkdown(markdown, quote.quote);

  // Drop leftover social-only trailing lines
  markdown = markdown
    .replace(/\n## Links[\s\S]*$/m, "")
    .replace(/\n(Instagram|LinkedIn|Snapchat|Link)\n/g, "\n")
    .trim();
  markdown = promoteStructuralHeadings(markdown, slug);
  if (slug === "initiatives/work") markdown = listifyJobSections(markdown);

  const youtube = extractYoutubeIds(raw);
  const images = extractImagesFromHtml(raw, htmlFile);
  const heroImage = images[0] ?? null;

  if (slug.startsWith("about/") && slug !== "about") {
    if (slug === "about/resources" || slug === "about/education") {
      const ordered = extractOrderedImages(body, htmlFile, heroImage);
      markdown = injectSequentialSectionImages(markdown, ordered);
    } else {
      const sectionMap = extractSectionImagesFromHtml(body, htmlFile);
      markdown = injectSectionImages(markdown, sectionMap, heroImage);
    }
    markdown = injectSectionYoutube(markdown, extractSectionYoutubeFromHtml(body));
  } else if (slug !== "home" && slug !== "about" && slug !== "initiatives" && slug !== "contact") {
    const sectionMap = extractSectionImagesFromHtml(body, htmlFile);
    markdown = injectSectionImages(markdown, sectionMap, heroImage);
    markdown = injectSectionYoutube(markdown, extractSectionYoutubeFromHtml(body));
  }

  let frontmatterImages = images;
  let homeSlots = null;
  let aboutSlots = null;
  if (slug === "home") {
    const folder = path.join(EXPORT, "Home");
    const slot = (name) => registerImage(path.join(folder, name));
    homeSlots = {
      heroImage: slot(HOME_IMAGE_SLOTS.heroImage),
      featuredLeftImage: slot(HOME_IMAGE_SLOTS.featuredLeftImage),
      featuredChartImage: slot(HOME_IMAGE_SLOTS.featuredChartImage),
      featuredRightImage: slot(HOME_IMAGE_SLOTS.featuredRightImage),
    };
    frontmatterImages = Object.values(homeSlots).filter(Boolean);
  }
  if (slug === "about") {
    const folder = path.join(EXPORT, "About Me");
    const slot = (name) => registerImage(path.join(folder, name));
    aboutSlots = {
      cardBackgroundImage: slot(ABOUT_HUB_SLOTS.cardBackgroundImage),
      cardEducationImage: slot(ABOUT_HUB_SLOTS.cardEducationImage),
      cardInvolvementsImage: slot(ABOUT_HUB_SLOTS.cardInvolvementsImage),
      cardResourcesImage: slot(ABOUT_HUB_SLOTS.cardResourcesImage),
    };
    frontmatterImages = Object.values(aboutSlots).filter(Boolean);
  }

  const description = firstDescription(markdown, title, slug);

  const frontmatter = [
    "---",
    `title: ${yamlEscape(title)}`,
    `slug: ${yamlEscape(slug)}`,
    `description: ${yamlEscape(description)}`,
    quote ? `quote: ${yamlEscape(quote.quote)}` : null,
    quote?.author ? `quoteAuthor: ${yamlEscape(quote.author)}` : null,
    slug === "home" && homeSlots?.heroImage
      ? `heroImage: ${yamlEscape(homeSlots.heroImage)}`
      : slug !== "about" && heroImage
        ? `heroImage: ${yamlEscape(heroImage)}`
        : null,
    slug === "home" && homeSlots?.featuredLeftImage
      ? `featuredLeftImage: ${yamlEscape(homeSlots.featuredLeftImage)}`
      : null,
    slug === "home" && homeSlots?.featuredChartImage
      ? `featuredChartImage: ${yamlEscape(homeSlots.featuredChartImage)}`
      : null,
    slug === "home" && homeSlots?.featuredRightImage
      ? `featuredRightImage: ${yamlEscape(homeSlots.featuredRightImage)}`
      : null,
    slug === "about" && aboutSlots?.cardBackgroundImage
      ? `cardBackgroundImage: ${yamlEscape(aboutSlots.cardBackgroundImage)}`
      : null,
    slug === "about" && aboutSlots?.cardEducationImage
      ? `cardEducationImage: ${yamlEscape(aboutSlots.cardEducationImage)}`
      : null,
    slug === "about" && aboutSlots?.cardInvolvementsImage
      ? `cardInvolvementsImage: ${yamlEscape(aboutSlots.cardInvolvementsImage)}`
      : null,
    slug === "about" && aboutSlots?.cardResourcesImage
      ? `cardResourcesImage: ${yamlEscape(aboutSlots.cardResourcesImage)}`
      : null,
    frontmatterImages.length
      ? `images:\n${frontmatterImages.map((i) => `  - ${yamlEscape(i)}`).join("\n")}`
      : null,
    youtube.length ? `youtube:\n${youtube.map((y) => `  - "${y}"`).join("\n")}` : null,
    "---",
  ]
    .filter(Boolean)
    .join("\n");

  const outDir = path.join(OUT_CONTENT, ...slug.split("/"));
  fs.mkdirSync(outDir, { recursive: true });
  fs.writeFileSync(path.join(outDir, "index.md"), `${frontmatter}\n\n${markdown}\n`);
  console.log(`✓ ${slug} (${blocks.length} blocks, ${images.length} imgs, ${youtube.length} yt)`);
}

fs.mkdirSync(OUT_CONTENT, { recursive: true });
console.log("Extracting from", EXPORT);
const slugFilter = process.argv[2];
const pageEntries = Object.entries(PAGE_MAP).filter(
  ([slug]) => !slugFilter || slug === slugFilter || slug.startsWith(`${slugFilter}/`),
);
if (slugFilter) console.log(`Filter: ${slugFilter} (${pageEntries.length} pages)`);
for (const [slug, htmlFile] of pageEntries) {
  writePage(slug, htmlFile);
}

const techPath = path.join(EXPORT, "Technical Projects.html");
if (fs.existsSync(techPath)) {
  const raw = fs.readFileSync(techPath, "utf8");
  const bodyIdx = raw.toLowerCase().indexOf("<body");
  const body = raw.slice(bodyIdx).replace(/<script[\s\S]*?<\/script>/gi, " ").replace(/<style[\s\S]*?<\/style>/gi, " ");
  const md = blocksToMarkdown(extractBlocks(body), "Technical Projects");
  const append = path.join(OUT_CONTENT, "initiatives/projects/index.md");
  if (fs.existsSync(append) && md.length > 80) {
    fs.appendFileSync(append, `\n\n## Technical Projects\n\n${md}\n`);
  }
}

console.log(`\nDone. ${imageRegistry.size} unique images → public/images/`);
