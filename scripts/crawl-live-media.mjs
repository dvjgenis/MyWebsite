/**
 * Playwright snippet: crawl live dulfvincent.com and return heading→media maps.
 * Loaded by MCP browser_run_code_unsafe via filename.
 */
export default async (page) => {
  const pages = [
    "https://www.dulfvincent.com/about-me/background",
    "https://www.dulfvincent.com/about-me/education",
    "https://www.dulfvincent.com/about-me/hobbies-involvements",
    "https://www.dulfvincent.com/about-me/resources-i-love",
    "https://www.dulfvincent.com/initiatives/work-experience",
    "https://www.dulfvincent.com/initiatives/volunteerism-projects",
    "https://www.dulfvincent.com/initiatives/speaking-engagements",
    "https://www.dulfvincent.com/initiatives/speaking-engagements/citl-student-quick-takes-series",
    "https://www.dulfvincent.com/initiatives/leadership-certification",
    "https://www.dulfvincent.com/initiatives/leadership-certification/personal-development-plan",
    "https://www.dulfvincent.com/initiatives/leadership-certification/trainings-workshops",
    "https://www.dulfvincent.com/initiatives/leadership-certification/i-programs",
    "https://www.dulfvincent.com/initiatives/leadership-certification/team-experiences",
    "https://www.dulfvincent.com/initiatives/leadership-certification/leadership-coursework",
    "https://www.dulfvincent.com/initiatives/leadership-certification/leadership-certificate-coach",
    "https://www.dulfvincent.com/initiatives/leadership-certification/cumulative-reflection",
    "https://www.dulfvincent.com/initiatives/study-abroad",
    "https://www.dulfvincent.com/initiatives/study-abroad/abroad-resources",
    "https://www.dulfvincent.com/initiatives/scholarships-awards",
  ];

  const out = {};

  for (const url of pages) {
    await page.goto(url, { waitUntil: "domcontentloaded", timeout: 60000 });
    await page.waitForTimeout(2500);
    out[url.replace("https://www.dulfvincent.com", "")] = await page.evaluate(() => {
      const skip = /^(home|about me|initiatives|contact|more|skip to|table of contents|overview|key responsibilities|skills developed|impact & reflection)$/i;

      const items = [];
      document.querySelectorAll("h1, h2, h3, iframe, img").forEach((el) => {
        const r = el.getBoundingClientRect();
        if (r.width < 8 && r.height < 8) return;
        const y = Math.round(r.y + window.scrollY);
        const tag = el.tagName.toLowerCase();
        if (tag === "iframe") {
          const src = el.src || "";
          const m = src.match(/embed\/([A-Za-z0-9_-]{11})/);
          if (m) items.push({ t: "yt", id: m[1], y, x: Math.round(r.x), w: Math.round(r.width) });
        } else if (tag === "img") {
          if (el.naturalWidth < 140) return;
          items.push({
            t: "img",
            y,
            x: Math.round(r.x),
            w: Math.round(r.width),
            nw: el.naturalWidth,
            nh: el.naturalHeight,
            src: (el.currentSrc || el.src || "").slice(-80),
          });
        } else {
          const text = (el.innerText || "").trim().replace(/\s+/g, " ");
          if (!text || text.length > 160 || skip.test(text)) return;
          items.push({ t: "h", text: text.slice(0, 140), y });
        }
      });
      items.sort((a, b) => a.y - b.y || a.x - b.x);

      const sections = [];
      let current = { heading: "(page intro)", y: 0, youtube: [], images: 0, imgSizes: [] };
      for (const item of items) {
        if (item.t === "h") {
          sections.push(current);
          current = { heading: item.text, y: item.y, youtube: [], images: 0, imgSizes: [] };
        } else if (item.t === "yt") {
          current.youtube.push(item.id);
        } else if (item.t === "img") {
          current.images += 1;
          current.imgSizes.push(`${item.nw}x${item.nh}`);
        }
      }
      sections.push(current);
      return sections.filter((s) => s.youtube.length || s.images || s.heading !== "(page intro)");
    });
  }

  return out;
};
