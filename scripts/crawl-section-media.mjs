async (page) => {
  const targets = [
    ["work", "https://www.dulfvincent.com/initiatives/work-experience", "http://localhost:4321/initiatives/work/"],
    ["projects", "https://www.dulfvincent.com/initiatives/volunteerism-projects", "http://localhost:4321/initiatives/projects/"],
    ["speaking", "https://www.dulfvincent.com/initiatives/speaking-engagements", "http://localhost:4321/initiatives/speaking/"],
    ["citl", "https://www.dulfvincent.com/initiatives/speaking-engagements/citl-student-quick-takes-series", "http://localhost:4321/initiatives/speaking/citl/"],
    ["education", "https://www.dulfvincent.com/about-me/education", "http://localhost:4321/about/education/"],
    ["hobbies", "https://www.dulfvincent.com/about-me/hobbies-involvements", "http://localhost:4321/about/hobbies/"],
    ["background", "https://www.dulfvincent.com/about-me/background", "http://localhost:4321/about/background/"],
    ["abroad", "https://www.dulfvincent.com/initiatives/study-abroad", "http://localhost:4321/initiatives/abroad/"],
    ["awards", "https://www.dulfvincent.com/initiatives/scholarships-awards", "http://localhost:4321/initiatives/awards/"],
    ["contact", "https://www.dulfvincent.com/contact", "http://localhost:4321/contact/"],
    ["home", "https://www.dulfvincent.com/", "http://localhost:4321/"],
  ];

  async function mapPage() {
    await page.setViewportSize({ width: 1280, height: 900 });
    await page.waitForTimeout(1800);
    await page.evaluate(async () => {
      const h = document.body.scrollHeight;
      for (let y = 0; y < h; y += 700) {
        window.scrollTo(0, y);
        await new Promise((r) => setTimeout(r, 40));
      }
      window.scrollTo(0, 0);
    });
    await page.waitForTimeout(400);
    return page.evaluate(() => {
      const skip =
        /^(home|about me|initiatives|contact|more|skip to|table of contents|overview|key responsibilities|skills developed|impact & reflection|spanish classes taken abroad|some highlights and important events|an overview)$/i;

      const headings = [];
      document.querySelectorAll("h1, h2, h3").forEach((el) => {
        const r = el.getBoundingClientRect();
        const text = (el.innerText || "").trim().replace(/\s+/g, " ");
        if (!text || text.length > 180 || skip.test(text)) return;
        if (r.height < 8) return;
        headings.push({
          text: text.slice(0, 150),
          y: Math.round(r.y + window.scrollY),
          x: Math.round(r.x),
          bottom: Math.round(r.bottom + window.scrollY),
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
          const m = src.match(/embed\/([A-Za-z0-9_-]{11})/) || src.match(/watch\?v=([A-Za-z0-9_-]{11})/);
          if (m) media.push({ t: "yt", id: m[1], y, x, w, bottom });
        } else {
          if (el.naturalWidth && el.naturalWidth < 120) return;
          const src = el.currentSrc || el.src || "";
          if (/pixel|spacer|icon|favicon|sociallinks/i.test(src)) return;
          media.push({
            t: "img",
            id: src.replace(/^.*\//, "").slice(0, 80),
            y,
            x,
            w,
            bottom,
          });
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
    });
  }

  const out = {};
  for (const [key, liveUrl, localUrl] of targets) {
    const entry = { live: [], local: [] };
    try {
      await page.goto(liveUrl, { waitUntil: "domcontentloaded", timeout: 60000 });
      entry.live = await mapPage();
    } catch (e) {
      entry.liveError = String(e);
    }
    try {
      await page.goto(localUrl, { waitUntil: "domcontentloaded", timeout: 30000 });
      entry.local = await mapPage();
    } catch (e) {
      entry.localError = String(e);
    }
    out[key] = entry;
  }
  return out;
};
