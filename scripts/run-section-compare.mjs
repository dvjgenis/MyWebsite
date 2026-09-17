import pkg from "/Users/dvgenis/.npm/_npx/9833c18b2d85bc59/node_modules/playwright/index.js";
const { chromium } = pkg;
import { writeFileSync } from "fs";

// Reuse the mapper by evaluating the same pairing in-page.
const MAPPER = `(() => {
  const skip =
    /^(home|about me|initiatives|contact|more|skip to|table of contents|overview|key responsibilities|skills developed|impact & reflection|spanish classes taken abroad|some highlights and important events|an overview)$/i;
  const headings = [];
  document.querySelectorAll("h1, h2, h3").forEach((el) => {
    const r = el.getBoundingClientRect();
    const text = (el.innerText || "").trim().replace(/\\s+/g, " ");
    if (!text || text.length > 180 || skip.test(text)) return;
    if (r.height < 8) return;
    headings.push({
      text: text.slice(0, 150),
      y: Math.round(r.y + window.scrollY),
      x: Math.round(r.x),
    });
  });
  headings.sort((a, b) => a.y - b.y);
  const media = [];
  document.querySelectorAll("iframe, img").forEach((el) => {
    const r = el.getBoundingClientRect();
    if (r.width < 40 || r.height < 40) return;
    const y = Math.round(r.y + window.scrollY);
    const x = Math.round(r.x);
    const w = Math.round(r.width);
    const bottom = Math.round(r.bottom + window.scrollY);
    if (el.tagName === "IFRAME") {
      const src = el.src || "";
      const m = src.match(/embed\\/([A-Za-z0-9_-]{11})/) || src.match(/watch\\?v=([A-Za-z0-9_-]{11})/);
      if (m) media.push({ t: "yt", id: m[1], y, x, w, bottom });
    } else {
      if (el.naturalWidth && el.naturalWidth < 120) return;
      const src = el.currentSrc || el.src || "";
      if (/pixel|spacer|icon|favicon|sociallinks/i.test(src)) return;
      media.push({ t: "img", id: src.replace(/^.*\\//, "").slice(0, 90), y, x, w, bottom });
    }
  });
  function assign(m) {
    if (!headings.length) return "(none)";
    let side = null;
    let sideDelta = 9999;
    for (const h of headings) {
      const dy = Math.abs(m.y - h.y);
      if (dy < 110 && m.x > h.x + 80 && dy < sideDelta) {
        side = h;
        sideDelta = dy;
      }
    }
    if (side) return side.text;
    let banner = null;
    let bannerGap = 9999;
    for (const h of headings) {
      const gap = h.y - m.bottom;
      if (gap >= -20 && gap < 90 && m.w > 420 && gap < bannerGap) {
        banner = h;
        bannerGap = gap;
      }
    }
    if (banner) return banner.text;
    let last = headings[0];
    for (const h of headings) {
      if (h.y <= m.y + 20) last = h;
      else break;
    }
    return last.text;
  }
  const sections = {};
  for (const h of headings) sections[h.text] = { yt: [], images: [] };
  for (const m of media) {
    const key = assign(m);
    if (!sections[key]) sections[key] = { yt: [], images: [] };
    if (m.t === "yt") sections[key].yt.push(m.id);
    else sections[key].images.push(m.id);
  }
  return Object.entries(sections).map(([heading, v]) => ({
    heading,
    yt: v.yt,
    imageCount: v.images.length,
    images: v.images.slice(0, 8),
  }));
})()`;

const targets = [
  ["work", "https://www.dulfvincent.com/initiatives/work-experience", "http://127.0.0.1:4321/initiatives/work/"],
  ["projects", "https://www.dulfvincent.com/initiatives/volunteerism-projects", "http://127.0.0.1:4321/initiatives/projects/"],
  ["speaking", "https://www.dulfvincent.com/initiatives/speaking-engagements", "http://127.0.0.1:4321/initiatives/speaking/"],
  ["citl", "https://www.dulfvincent.com/initiatives/speaking-engagements/citl-student-quick-takes-series", "http://127.0.0.1:4321/initiatives/speaking/citl/"],
  ["education", "https://www.dulfvincent.com/about-me/education", "http://127.0.0.1:4321/about/education/"],
  ["hobbies", "https://www.dulfvincent.com/about-me/hobbies-involvements", "http://127.0.0.1:4321/about/hobbies/"],
  ["background", "https://www.dulfvincent.com/about-me/background", "http://127.0.0.1:4321/about/background/"],
  ["abroad", "https://www.dulfvincent.com/initiatives/study-abroad", "http://127.0.0.1:4321/initiatives/abroad/"],
  ["awards", "https://www.dulfvincent.com/initiatives/scholarships-awards", "http://127.0.0.1:4321/initiatives/awards/"],
];

async function mapPage(page, url) {
  await page.goto(url, { waitUntil: "domcontentloaded", timeout: 90000 });
  await page.waitForTimeout(2200);
  await page.evaluate(async () => {
    const h = Math.max(document.body.scrollHeight, 2000);
    for (let y = 0; y < h; y += 800) {
      window.scrollTo(0, y);
      await new Promise((r) => setTimeout(r, 50));
    }
    window.scrollTo(0, 0);
  });
  await page.waitForTimeout(500);
  return page.evaluate(MAPPER);
}

const browser = await chromium.launch({ headless: true, channel: "chrome" });
const page = await browser.newPage({ viewport: { width: 1280, height: 900 } });
const out = {};
for (const [key, liveUrl, localUrl] of targets) {
  const entry = {};
  try {
    entry.live = await mapPage(page, liveUrl);
  } catch (e) {
    entry.liveError = String(e);
  }
  try {
    entry.local = await mapPage(page, localUrl);
  } catch (e) {
    entry.localError = String(e);
  }
  out[key] = entry;
  console.error("done", key, entry.liveError || "", entry.localError || "");
}
writeFileSync("/Users/dvgenis/Desktop/Big_Projects/MyWebsite/.tmp-live-local-compare.json", JSON.stringify(out, null, 2));
await browser.close();
console.log("wrote compare json");
