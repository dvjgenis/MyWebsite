function nodeText(node) {
  if (!node) return "";
  if (node.type === "text") return node.value || "";
  if (!node.children) return "";
  return node.children.map(nodeText).join("");
}

function classList(node) {
  const c = node?.properties?.className;
  if (!c) return [];
  return Array.isArray(c) ? c : String(c).split(/\s+/);
}

function isElement(node, tag) {
  return node?.type === "element" && (!tag || node.tagName === tag);
}

function isBlank(node) {
  if (!node) return true;
  if (node.type === "text") return !String(node.value || "").trim();
  if (node.type === "element") {
    if (["br", "hr"].includes(node.tagName)) return true;
    if (["img", "iframe", "video", "svg", "picture", "source"].includes(node.tagName)) return false;
    if (isYoutube(node) || classList(node).includes("youtube-embed") || classList(node).includes("youtube-stack")) {
      return false;
    }
    return (node.children || []).every(isBlank);
  }
  return false;
}

function isYoutube(node) {
  return isElement(node, "div") && classList(node).includes("youtube-embed");
}

function isLinkedImage(node) {
  if (!isElement(node, "a")) return false;
  const kids = (node.children || []).filter((c) => !isBlank(c));
  return kids.length === 1 && isElement(kids[0], "img");
}

function isMediaNode(node) {
  if (!isElement(node)) return false;
  if (isYoutube(node) || classList(node).includes("youtube-stack")) return true;
  if (node.tagName === "p") {
    const kids = (node.children || []).filter((c) => !isBlank(c));
    return kids.length > 0 && kids.every((c) => isElement(c, "img") || isLinkedImage(c));
  }
  if (node.tagName === "img" || isLinkedImage(node)) return true;
  return false;
}

function countImgs(nodes) {
  let n = 0;
  const walk = (node) => {
    if (isElement(node, "img")) n += 1;
    (node.children || []).forEach(walk);
  };
  nodes.forEach(walk);
  return n;
}

function countYoutube(nodes) {
  let n = 0;
  const walk = (node) => {
    if (isYoutube(node)) n += 1;
    (node.children || []).forEach(walk);
  };
  nodes.forEach(walk);
  return n;
}

function isKicker(node) {
  if (!isElement(node, "p") || isMediaNode(node)) return false;
  const text = nodeText(node).trim();
  if (!text || text.length > 160) return false;
  if (text.includes(". ") && text.length > 80) return false;
  return (
    text.includes("|") ||
    text.includes("📍") ||
    /^\d{1,2}\.\d{2}\.\d{2,4}/.test(text) ||
    /Area|Hybrid|In-Person|Part-time|Internship|Seasonal|Full-time|Granada/i.test(text)
  );
}

function slugify(text) {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
}

function shortLabel(text) {
  const cut = text
    .split("|")[0]
    .split("—")[0]
    .replace(/\s*\(\d{1,2}\.\d{2}\.\d{2,4}\)\s*$/, "")
    .trim();
  return cut.length > 48 ? `${cut.slice(0, 46).trim()}…` : cut;
}

function splitHeading(title) {
  const dateMatch = title.match(/^(.*?)\s*\((\d{1,2}\.\d{2}\.\d{2,4})\)\s*$/);
  let heading = title;
  const extras = [];
  if (dateMatch) {
    heading = dateMatch[1].trim();
    extras.push(dateMatch[2]);
  }
  if (heading.includes("|")) {
    const parts = heading
      .split("|")
      .map((s) => s.trim())
      .filter(Boolean);
    heading = parts[0] || heading;
    if (parts.length > 1) extras.push(parts.slice(1).join(" · "));
  }
  return { heading, extras };
}

function setHeadingText(headingNode, text) {
  headingNode.children = [{ type: "text", value: text }];
}

function isSchoolQuadEntry(title) {
  return /(?:high school|middle school|elementary school|christian academy)/i.test(title);
}

function isAiToolEntry(title) {
  return /duckduckgo ai chat|asta\.ai|gemini notebook|notebooklm/i.test(title);
}

const CAROUSEL_PAGES = new Set(["initiatives/projects", "initiatives/work"]);

function pageSlugFromFile(file) {
  const fromMatter = file?.data?.astro?.frontmatter?.slug;
  if (fromMatter) return String(fromMatter);
  const raw = String(file?.path || file?.history?.[0] || "");
  const match = raw.replace(/\\/g, "/").match(/\/content\/pages\/(.+?)\/index\.md$/i);
  return match ? match[1] : "";
}

function isWeekdayFoodTitle(title) {
  return /^(monday|tuesday|wednesday|thursday|friday)$/i.test(title);
}

function enableYoutubeApi(node) {
  const walk = (n) => {
    if (isElement(n, "iframe") && n.properties?.src) {
      const src = String(n.properties.src);
      if (/youtube/.test(src) && !src.includes("enablejsapi=1")) {
        n.properties.src = src.includes("?") ? `${src}&enablejsapi=1` : `${src}?enablejsapi=1`;
      }
    }
    (n.children || []).forEach(walk);
  };
  walk(node);
  return node;
}

function carouselButton(dir) {
  return el(
    "button",
    {
      type: "button",
      className: ["site-carousel-btn", `site-carousel-btn--${dir}`],
      "aria-label": dir === "prev" ? "Previous" : "Next",
    },
    [],
  );
}

function wrapCarousel(kind, slides, label) {
  const count = slides.length;
  slides.forEach((slide, i) => {
    slide.properties ||= {};
    slide.properties.className = [...new Set([...classList(slide), "site-carousel-slide"])];
    slide.properties["aria-hidden"] = i === 0 ? "false" : "true";
    slide.properties["data-index"] = String(i);
  });

  const navKids = [];
  if (count <= 8) {
    navKids.push(
      el(
        "div",
        { className: ["site-carousel-dots"], role: "tablist", "aria-label": label },
        slides.map((_, i) =>
          el(
            "button",
            {
              type: "button",
              className: i === 0 ? ["site-carousel-dot", "is-active"] : ["site-carousel-dot"],
              "aria-label": `${label} ${i + 1}`,
              ...(i === 0 ? { "aria-current": "true" } : {}),
            },
            [],
          ),
        ),
      ),
    );
  }
  navKids.push(
    el("p", { className: ["site-carousel-count"], "aria-live": "polite" }, [{ type: "text", value: `1 / ${count}` }]),
  );

  return el(
    "div",
    {
      className: ["site-carousel", `site-carousel--${kind}`],
      "data-kind": kind,
      role: "region",
      "aria-roledescription": "carousel",
      "aria-label": label,
      tabIndex: 0,
    },
    [
      el("div", { className: ["site-carousel-frame"] }, [
        carouselButton("prev"),
        el("div", { className: ["site-carousel-track"] }, slides),
        carouselButton("next"),
      ]),
      el("div", { className: ["site-carousel-nav"] }, navKids),
    ],
  );
}

function carouselEl(kind, nodes) {
  const slides = flattenMedia(nodes).map((node) => el("div", {}, [enableYoutubeApi(node)]));
  return wrapCarousel(kind, slides, kind === "video" ? "Videos" : "Photos");
}

function wrapResourceCarousel(cards) {
  const slides = cards.map((card) => el("div", {}, [card]));
  return wrapCarousel("resource", slides, "Illinois campus resources");
}

function maybeCarousel(kind, nodes) {
  if (!nodes.length) return [];
  if (nodes.length <= 3) return flattenMedia(nodes);
  return [carouselEl(kind, nodes)];
}

function packLooseMedia(nodes) {
  if (nodes.length <= 1) return nodes;
  if (nodes.some((n) => classList(n).includes("site-carousel"))) return nodes;
  return [el("div", { className: ["entry-media-row"] }, nodes)];
}

function mediaRail(videos, images, originalMedia, useCarousel) {
  if (!useCarousel || (videos.length <= 3 && images.length <= 3)) {
    return flattenMedia(originalMedia.length ? originalMedia : [...videos, ...images]);
  }
  return [...packLooseMedia(maybeCarousel("video", videos)), ...packLooseMedia(maybeCarousel("image", images))];
}

function nodeHasCarousel(nodes) {
  return (nodes || []).some(
    (n) => classList(n).includes("site-carousel") || (n.children || []).some((c) => classList(c).includes("site-carousel")),
  );
}

function isPersonHeading(title) {
  if (isAiToolEntry(title)) return false;
  if (/^(dr\.|prof\.)\s+[A-Z]/i.test(title)) return true;
  if (/[|:—!&/?]/.test(title)) return false;
  if (/\d/.test(title)) return false;
  const words = title
    .replace(/[(),’']/g, " ")
    .split(/\s+/)
    .filter(Boolean);
  if (words.length < 2 || words.length > 4) return false;
  const stop =
    /^(park|center|school|academy|program|award|awards|scholarship|workshop|biography|platforms|apps|websites|events|session|speech|tools|overview|highlights|classes|ministries|closet|pantry|library|chorus|recognition|institute|retreat|feature|presentation|conference|testimony|studio|armory|office|university|inclusion|research|abroad|education|accelerator|life|learning|piece|management|sustainability|definition|relationship|change|acknowledgment|booking|tips|deals|coming|innovation|imprint|episode|summer|bonus|spanish|food|weekly|career|civic|undergraduate|diversity|equity|teaching|writer|writers|ymca|habitat|humanity|restore|colegio|baptist|city|feed|starving|children|group|ventures|international|volunteerism|division|studies|entrepreneurship|chamber|community|resources|instructor|liaison|fellow|intern|consultant|representative|ambassador|scholar|scholars|leadership|certificate|coach|notebook|gemini)$/i;
  if (words.some((w) => stop.test(w))) return false;
  if (
    /^(singing|visiting|meeting|paying|partying|commencing|camel|monkeys|last|my|some|filter|mapping|building|teaching|quantifying|responsible|student|exploratory|assistant|coordinator|the|an|also|best|travel|transportation|accommodation|money|spring|all|special|what|how)$/i.test(
      words[0],
    )
  ) {
    return false;
  }
  const name = /^(?:[A-Z][a-z]+(?:-[A-Z][a-z]+)?|[A-Z]{2,3})$/;
  return words.every((w) => name.test(w) || /^(and|of|the|de|von|y)$/i.test(w));
}

function wrapH3Blocks(nodes) {
  const h3Count = nodes.filter((n) => isElement(n, "h3")).length;
  if (h3Count < 2) return nodes;
  const out = [];
  let i = 0;
  while (i < nodes.length) {
    if (isElement(nodes[i], "h3")) {
      const block = [nodes[i]];
      i += 1;
      while (i < nodes.length && !isElement(nodes[i], "h3")) {
        block.push(nodes[i]);
        i += 1;
      }
      out.push({
        type: "element",
        tagName: "div",
        properties: { className: ["entry-block"] },
        children: block,
      });
    } else {
      out.push(nodes[i]);
      i += 1;
    }
  }
  return out;
}

function measureText(nodes) {
  return nodes.map(nodeText).join(" ").replace(/\s+/g, " ").trim();
}

function textParagraphCount(nodes) {
  return nodes.filter(
    (n) => isElement(n, "p") && !isMediaNode(n) && nodeText(n).trim().length > 90,
  ).length;
}

function isCompact(heading, body, media, isHost) {
  if (isHost) return false;
  if (countYoutube(media) || body.some((n) => isElement(n, "h3"))) return false;
  if (countImgs(media) > 1) return false;
  if (heading.includes("|")) return false;
  const paras = textParagraphCount(body);
  if (paras >= 3) return false;
  if (countImgs(media) >= 1 && paras <= 2) return true;
  if (heading.length > 62) return false;
  return measureText(body).length < 1200;
}

function flattenMedia(nodes) {
  const out = [];
  for (const node of nodes) {
    if (classList(node).includes("youtube-stack")) {
      out.push(...(node.children || []).filter((c) => !isBlank(c)));
      continue;
    }
    if (isElement(node, "p")) {
      const kids = (node.children || []).filter((c) => !isBlank(c));
      const mediaKids = kids.filter((c) => isElement(c, "img") || isLinkedImage(c));
      if (mediaKids.length && mediaKids.length === kids.length) {
        for (const kid of mediaKids) {
          out.push(el("p", { className: classList(node) }, [kid]));
        }
        continue;
      }
    }
    if (isElement(node, "img")) {
      out.push(el("p", {}, [node]));
      continue;
    }
    out.push(node);
  }
  return out;
}

function extractImageParagraphs(nodes) {
  return flattenMedia(nodes).filter((node) => countImgs([node]) > 0);
}

function packInlineMediaRuns(nodes) {
  const out = [];
  let run = [];
  const flush = () => {
    if (!run.length) return;
    const { videos, images } = splitMedia(run);
    out.push(
      ...mixMedia(
        videos.map((n) => markFlowMedia(n, "spread")),
        packImageRows(images),
      ),
    );
    run = [];
  };
  for (const node of nodes) {
    if (isMediaNode(node) || isYoutube(node) || classList(node).includes("youtube-embed")) {
      run.push(node);
    } else {
      flush();
      out.push(node);
    }
  }
  flush();
  return out;
}

function splitMedia(media) {
  const videos = [];
  const images = [];
  for (const node of flattenMedia(media)) {
    if (isYoutube(node) || classList(node).includes("youtube-embed")) videos.push(node);
    else images.push(node);
  }
  return { videos, images };
}

function mixMedia(videos, images) {
  const mixed = [];
  const max = Math.max(videos.length, images.length);
  for (let i = 0; i < max; i += 1) {
    if (i < videos.length) mixed.push(videos[i]);
    if (i < images.length) mixed.push(images[i]);
  }
  return mixed;
}

function isVideoNode(node) {
  return isYoutube(node) || classList(node).includes("youtube-embed") || classList(node).includes("youtube-stack");
}

function isSpreadAnchor(node) {
  return isElement(node, "p") && !isMediaNode(node) && nodeText(node).trim().length > 50;
}

function isShortCaption(node) {
  if (!isElement(node, "p") || isMediaNode(node) || isKicker(node)) return false;
  const text = nodeText(node).trim();
  if (text.length < 12 || text.length > 220) return false;
  if (/\.\s+[A-Z]/.test(text)) return false;
  return true;
}

function markFlowMedia(node, kind) {
  if (isVideoNode(node)) {
    return el("div", { className: [kind === "spread" ? "spread-embed" : "block-embed"] }, [node]);
  }
  node.properties ||= {};
  node.properties.className = [
    ...classList(node).filter((c) => !String(c).startsWith("essay-figure") && c !== "block-figure" && c !== "spread-figure"),
    kind === "spread" ? "spread-figure" : "block-figure",
  ];
  return node;
}

function packImageRows(images) {
  const marked = extractImageParagraphs(images).map((n) => markFlowMedia(n, "spread"));
  if (marked.length <= 1) return marked;
  const rows = [];
  for (let i = 0; i < marked.length; i += 3) {
    const slice = marked.slice(i, i + 3);
    if (slice.length === 1) {
      rows.push(slice[0]);
      continue;
    }
    rows.push(el("div", { className: ["spread-row", `spread-row--${slice.length}`] }, slice));
  }
  return rows;
}

function markEssayFigure(node, side) {
  if (isVideoNode(node)) {
    return el("div", { className: ["spread-embed"] }, [node]);
  }
  node.properties ||= {};
  node.properties.className = [
    ...classList(node).filter(
      (c) =>
        !String(c).startsWith("essay-figure") && c !== "block-figure" && c !== "spread-figure",
    ),
    "essay-figure",
    side === "right" ? "essay-figure--right" : "essay-figure--left",
  ];
  return node;
}

function interleaveUnits(body, units) {
  if (!units.length) return body;
  const anchors = [];
  body.forEach((n, i) => {
    if (isSpreadAnchor(n)) anchors.push(i);
  });
  if (!anchors.length) return [...body, ...units];

  const insertAfter = new Map();
  units.forEach((item, i) => {
    const idx = anchors[targetSlot(i, units.length, anchors.length)];
    if (!insertAfter.has(idx)) insertAfter.set(idx, []);
    insertAfter.get(idx).push(item);
  });
  const out = [];
  body.forEach((n, i) => {
    out.push(n);
    if (insertAfter.has(i)) out.push(...insertAfter.get(i));
  });
  return out;
}

function interleaveBlocks(body, videos, images) {
  return interleaveUnits(
    body,
    mixMedia(
      videos.map((n) => markFlowMedia(n, "spread")),
      packImageRows(images),
    ),
  );
}

function isEssayFigure(node) {
  return isElement(node, "p") && classList(node).some((c) => String(c).startsWith("essay-figure"));
}

/** Trailing floated essay photos with no text after them leave empty space — span full width instead. */
function packTrailingEssayMedia(body) {
  if (!body.length) return body;
  let cut = body.length;
  while (cut > 0 && isEssayFigure(body[cut - 1])) cut -= 1;
  if (cut === body.length) return body;

  const trailing = body.slice(cut);
  const head = body.slice(0, cut);
  const stripFloat = (node) => {
    node.properties ||= {};
    node.properties.className = [
      ...classList(node).filter(
        (c) => !String(c).startsWith("essay-figure") && c !== "spread-figure",
      ),
      "spread-figure",
    ];
    return node;
  };

  if (trailing.length === 1) return [...head, stripFloat(trailing[0])];

  return [
    ...head,
    el(
      "div",
      { className: ["spread-row", `spread-row--${Math.min(trailing.length, 3)}`] },
      trailing.map(stripFloat),
    ),
  ];
}

function interleaveEssayMedia(body, videos, images) {
  const imageUnits = extractImageParagraphs(images).map((n, i) =>
    markEssayFigure(n, i % 2 === 0 ? "left" : "right"),
  );
  return packTrailingEssayMedia(
    interleaveUnits(
      body,
      mixMedia(
        videos.map((n) => markFlowMedia(n, "spread")),
        imageUnits,
      ),
    ),
  );
}

function zipMediaPairs(videos, images) {
  const clips = videos.map((node) => {
    node.properties ||= {};
    node.properties.className = [...new Set([...classList(node), "youtube-embed", "youtube-embed--short"])];
    return node;
  });
  const photos = flattenMedia(images);
  const rows = [];
  const count = Math.max(clips.length, photos.length);
  for (let i = 0; i < count; i += 1) {
    const kids = [];
    if (clips[i]) kids.push(clips[i]);
    if (photos[i]) kids.push(photos[i]);
    rows.push(el("div", { className: ["entry-media-pair"] }, kids));
  }
  return el("div", { className: ["entry-media-pairs"] }, rows);
}

function zipCaptions(images, captions) {
  const count = Math.max(images.length, captions.length);
  const cards = [];
  for (let i = 0; i < count; i += 1) {
    const kids = [];
    if (images[i]) kids.push(images[i]);
    if (captions[i]) {
      captions[i].properties ||= {};
      captions[i].properties.className = [...classList(captions[i]), "caption-card-text"];
      kids.push(captions[i]);
    }
    cards.push(el("figure", { className: ["caption-card"] }, kids));
  }
  return el("div", { className: ["caption-grid"] }, cards);
}

function splitProseAndExtra(rest) {
  const prose = [];
  const extra = [];
  let extraMode = false;
  for (const n of rest) {
    if (
      !extraMode &&
      (isElement(n, "h3") || isYoutube(n) || classList(n).includes("youtube-embed") || classList(n).includes("youtube-stack"))
    ) {
      extraMode = true;
    }
    if (extraMode) extra.push(n);
    else prose.push(n);
  }
  return { prose, extra };
}

function targetSlot(index, count, total) {
  if (total <= 1) return 0;
  return Math.min(total - 1, Math.round(((index + 1) * (total - 1)) / (count + 1)));
}

function isEntryBlock(node) {
  return classList(node).includes("entry-block");
}

function blockHasProse(node) {
  return (node.children || []).some(
    (n) => isElement(n, "p") && !isMediaNode(n) && nodeText(n).trim().length > 50,
  );
}

function markBlockItem(node) {
  if (isVideoNode(node)) {
    return el("div", { className: ["block-embed"] }, [node]);
  }
  node.properties ||= {};
  node.properties.className = [
    ...classList(node).filter((c) => !String(c).startsWith("essay-figure")),
    "block-figure",
  ];
  return node;
}

function attachMediaToBlocks(nodes, items) {
  if (!items.length) return nodes;
  const marked = items.map(markBlockItem);
  const blockIdxs = [];
  nodes.forEach((n, i) => {
    if (isEntryBlock(n)) blockIdxs.push(i);
  });
  if (!blockIdxs.length) return [...nodes, ...marked];

  const preferred = blockIdxs.filter((i) => blockHasProse(nodes[i]));
  const order = [...preferred, ...blockIdxs.filter((i) => !preferred.includes(i))];

  marked.forEach((item, i) => {
    const target = nodes[order[i % order.length]];
    const kids = [...(target.children || [])];
    const headingAt = kids.findIndex((k) => isElement(k, "h3"));
    let pos = headingAt >= 0 ? headingAt + 1 : 0;
    while (
      pos < kids.length &&
      (classList(kids[pos]).includes("block-figure") || classList(kids[pos]).includes("block-embed"))
    ) {
      pos += 1;
    }
    kids.splice(pos, 0, item);
    target.children = kids;
  });
  return nodes;
}

function el(tag, props, children = []) {
  return { type: "element", tagName: tag, properties: props || {}, children };
}

function partitionBody(nodes) {
  const media = [];
  const kickers = [];
  const rest = [];
  let collecting = true;
  for (const node of nodes) {
    if (collecting && isBlank(node)) continue;
    if (collecting && isMediaNode(node)) {
      media.push(node);
      continue;
    }
    if (collecting && isKicker(node)) {
      kickers.push(node);
      continue;
    }
    collecting = false;
    rest.push(node);
  }
  return { media, kickers, rest };
}

function personCard(section) {
  const title = section.title;
  const meaningful = section.body.filter((n) => !isBlank(n));
  const { media, rest } = partitionBody(meaningful);
  const id = section.heading.properties?.id || slugify(title);
  section.heading.properties ||= {};
  section.heading.properties.id = id;
  const summaryKids = [];
  if (media.length) summaryKids.push(el("div", { className: ["entry-media"] }, media));
  summaryKids.push(section.heading);
  summaryKids.push(el("span", { className: ["entry-person-more"], "aria-hidden": "true" }, []));
  const kids = [el("summary", { className: ["entry-person-summary"] }, summaryKids)];
  if (rest.length) kids.push(el("div", { className: ["entry-body"] }, rest));
  return el(
    "details",
    {
      className: ["entry-card", "entry-card--person"],
      "data-label": shortLabel(title),
      "data-anchor": id,
      "aria-labelledby": id,
    },
    kids,
  );
}

function sectionCard(section, people, { useCarousel = false, pageSlug = "" } = {}) {
  const title = section.title;
  const { heading, extras } = splitHeading(title);
  const meaningful = section.body.filter((n) => !isBlank(n));
  const { media, kickers, rest } = partitionBody(meaningful);
  const id = section.heading.properties?.id || slugify(title);
  section.heading.properties ||= {};
  section.heading.properties.id = id;
  if (heading !== title) setHeadingText(section.heading, heading);
  const extraKickers = extras.map((text) =>
    el("p", { className: ["entry-kicker", "entry-kicker--org"] }, [{ type: "text", value: text }]),
  );

  const peopleHost = people.length > 0;
  const { videos, images } = splitMedia(media);
  const captions = rest.filter(isShortCaption);
  const nonCaptions = rest.filter((n) => !isShortCaption(n));
  const captionGallery =
    !peopleHost &&
    videos.length === 0 &&
    images.length >= 2 &&
    captions.length >= 2 &&
    measureText(nonCaptions).length < 40;
  const photoOnly = !peopleHost && images.length === 1 && videos.length === 0 && !measureText(rest);
  const compact = !captionGallery && !peopleHost && isCompact(title, rest, media, peopleHost);
  const schoolQuadEntry =
    !peopleHost && compact && !photoOnly && isSchoolQuadEntry(title) && images.length === 1 && videos.length === 0;
  const aiToolEntry =
    !peopleHost && compact && !photoOnly && isAiToolEntry(title) && images.length === 1 && videos.length === 0;
  const solo =
    compact && !photoOnly && images.length === 1 && videos.length === 0 && !schoolQuadEntry && !aiToolEntry;
  const blocked = rest.filter((n) => isElement(n, "h3")).length >= 2;
  const longEssay = textParagraphCount(rest) >= 3 || measureText(rest).length > 1600;

  let rail = [];
  let blocks = [];
  let extra = [];
  let feature = [];
  let layout = "default";

  if (photoOnly) {
    rail = images;
    layout = "photo";
  } else if (captionGallery) {
    blocks = [zipCaptions(images, captions)];
    layout = "captions";
  } else if (solo || compact) {
    rail = flattenMedia(media);
    blocks = wrapH3Blocks(rest);
    layout = solo ? "solo" : "compact";
  } else if (blocked && images.length + videos.length >= 2) {
    rail = mediaRail(videos, images, media, useCarousel);
    blocks = wrapH3Blocks(rest);
    layout = "gallery";
  } else if (blocked && images.length + videos.length > 0) {
    blocks = attachMediaToBlocks(wrapH3Blocks(rest), mixMedia(videos, images));
    layout = "banded";
  } else if (longEssay && (images.length + videos.length > 0 || rest.some((n) => isMediaNode(n) || isYoutube(n)))) {
    const prose = [];
    const inlineMedia = [];
    for (const n of rest) {
      if (isMediaNode(n) || isYoutube(n) || classList(n).includes("youtube-embed") || classList(n).includes("youtube-stack")) {
        inlineMedia.push(n);
      } else if (!isBlank(n)) {
        prose.push(n);
      }
    }
    const merged = splitMedia([...media, ...inlineMedia]);
    const costaRica = /costa rica/i.test(title);
    const showcase =
      !costaRica &&
      (merged.videos.filter((n) => classList(n).includes("youtube-embed--short")).length >= 2 ||
        (merged.videos.length >= 3 && merged.images.length >= 2));
    if (useCarousel && (merged.images.length > 3 || merged.videos.length > 3)) {
      rail = mediaRail(merged.videos, merged.images, [], true);
      blocks = wrapH3Blocks(prose);
      layout = "gallery";
    } else if (costaRica) {
      if (merged.videos.length) {
        feature = [el("div", { className: ["entry-shorts"] }, merged.videos)];
      }
      blocks = wrapH3Blocks(interleaveEssayMedia(prose, [], merged.images));
      layout = "essay";
    } else if (showcase && merged.videos.length && merged.images.length) {
      feature = [zipMediaPairs(merged.videos, merged.images)];
      blocks = wrapH3Blocks(prose);
      layout = "showcase";
    } else {
      blocks = wrapH3Blocks(interleaveEssayMedia(prose, merged.videos, merged.images));
      layout = "essay";
    }
  } else if (images.length + videos.length >= 2 && measureText(rest)) {
    const parts = splitProseAndExtra(rest);
    rail = mediaRail(videos, images, media, useCarousel);
    blocks = wrapH3Blocks(parts.prose);
    extra = parts.extra;
    layout = "gallery";
  } else if (images.length + videos.length > 0 && measureText(rest)) {
    const parts = splitProseAndExtra(rest);
    rail = mediaRail(videos, images, media, useCarousel);
    blocks = wrapH3Blocks(parts.prose);
    extra = parts.extra;
    layout = "split";
  } else {
    rail = mediaRail(videos, images, media, useCarousel);
    blocks = wrapH3Blocks(rest);
  }

  const headerKids = [
    section.heading,
    ...extraKickers,
    ...kickers.map((k) => {
      k.properties ||= {};
      k.properties.className = [...classList(k), "entry-kicker"];
      return k;
    }),
  ];
  const children = [el("header", { className: ["entry-head"] }, headerKids)];
  if (rail.length) children.push(el("div", { className: ["entry-media"] }, rail));
  if (feature.length) children.push(...feature);
  if (blocks.length) {
    const bodyClass = blocks.some((n) => classList(n).includes("entry-block"))
      ? ["entry-body", "entry-body--blocks"]
      : ["entry-body"];
    children.push(el("div", { className: bodyClass }, blocks));
  }
  if (extra.length) children.push(el("div", { className: ["entry-extra"] }, extra));
  if (peopleHost) {
    children.push(el("div", { className: ["entry-people"] }, people.map(personCard)));
  }

  const classes = ["entry-card"];
  if (peopleHost) classes.push("entry-card--host");
  if (compact && !photoOnly) classes.push("entry-card--compact");
  if (solo) classes.push("entry-card--solo");
  if (layout === "photo") classes.push("entry-card--photo");
  if (layout === "captions") classes.push("entry-card--captions");
  if (layout === "split") classes.push("entry-card--split");
  if (layout === "essay") classes.push("entry-card--essay");
  if (layout === "gallery") classes.push("entry-card--gallery");
  if (layout === "showcase") classes.push("entry-card--showcase");
  if (nodeHasCarousel(rail) || nodeHasCarousel(feature)) classes.push("entry-card--carousel");

  const illinoisResource =
    pageSlug === "about/resources" &&
    !peopleHost &&
    compact &&
    !photoOnly &&
    !aiToolEntry &&
    !isWeekdayFoodTitle(title);

  return {
    mosaic: (photoOnly || (compact && !solo)) && !illinoisResource,
    illinoisCarousel: illinoisResource,
    card: el(
      "article",
      {
        className: classes,
        "data-label": shortLabel(title),
        "data-anchor": id,
        "aria-labelledby": id,
      },
      children,
    ),
  };
}

/**
 * Split markdown pages into scannable cards: jump-nav targets, media rails,
 * and compact mosaics for short photo/person entries.
 */
export function rehypeEntryCards() {
  return (tree, file) => {
    const pageSlug = pageSlugFromFile(file);
    const useCarousel = CAROUSEL_PAGES.has(pageSlug);
    const nodes = tree.children || [];
    if (!nodes.some((n) => isElement(n, "h2"))) return;

    const intro = [];
    let i = 0;
    while (i < nodes.length && !isElement(nodes[i], "h2")) {
      intro.push(nodes[i]);
      i += 1;
    }

    const sections = [];
    while (i < nodes.length) {
      const heading = nodes[i];
      i += 1;
      const body = [];
      while (i < nodes.length && !isElement(nodes[i], "h2")) {
        body.push(nodes[i]);
        i += 1;
      }
      const title = nodeText(heading).trim();
      const linked = (heading.children || []).some((n) => isElement(n, "a"));
      sections.push({
        heading,
        body,
        title,
        person: !linked && isPersonHeading(title),
        empty: body.every(isBlank),
      });
    }

    const out = [];
    if (intro.filter((n) => !isBlank(n)).length) {
      out.push(el("div", { className: ["page-lede"] }, intro));
    }

    let mosaic = null;
    const closeMosaic = () => {
      if (!mosaic) return;
      if (mosaic.children.length === 1) out.push(mosaic.children[0]);
      else {
        const photoMosaic = mosaic.children.some((child) => classList(child).includes("entry-card--photo"));
        if (mosaic.children.length === 4 && !photoMosaic) {
          mosaic.properties.className = ["entry-mosaic", "entry-mosaic--quad"];
        }
        out.push(mosaic);
      }
      mosaic = null;
    };

    let illinoisCards = [];
    const flushIllinois = () => {
      if (!illinoisCards.length) return;
      closeMosaic();
      if (illinoisCards.length <= 3) {
        mosaic = el("div", { className: ["entry-mosaic"] }, illinoisCards);
        closeMosaic();
      } else {
        out.push(wrapResourceCarousel(illinoisCards));
      }
      illinoisCards = [];
    };

    let index = 0;
    while (index < sections.length) {
      const section = sections[index];
      const id = section.heading.properties?.id || slugify(section.title);

      if (/^table of contents$/i.test(section.title)) {
        flushIllinois();
        closeMosaic();
        out.push(
          el("nav", { className: ["entry-toc"], id, hidden: true, "aria-hidden": "true" }, [
            section.heading,
            ...section.body,
          ]),
        );
        index += 1;
        continue;
      }

      if (section.empty && !section.person) {
        flushIllinois();
        closeMosaic();
        section.heading.properties ||= {};
        section.heading.properties.className = [...classList(section.heading), "entry-group-label"];
        section.heading.properties.id = id;
        out.push(section.heading);
        index += 1;
        continue;
      }

      if (section.person) {
        const people = [];
        while (index < sections.length && (sections[index].person || sections[index].empty)) {
          if (sections[index].person) people.push(sections[index]);
          index += 1;
        }
        flushIllinois();
        closeMosaic();
        if (people.length) out.push(el("div", { className: ["entry-people"] }, people.map(personCard)));
        continue;
      }

      const people = [];
      index += 1;
      while (index < sections.length) {
        const next = sections[index];
        if (next.person) {
          people.push(next);
          index += 1;
          continue;
        }
        if (next.empty && people.length) {
          index += 1;
          continue;
        }
        break;
      }

      const { card, mosaic: inMosaic, illinoisCarousel } = sectionCard(section, people, {
        useCarousel,
        pageSlug,
      });
      if (illinoisCarousel) {
        closeMosaic();
        illinoisCards.push(card);
        continue;
      }
      flushIllinois();
      if (inMosaic) {
        if (!mosaic) mosaic = el("div", { className: ["entry-mosaic"] }, []);
        mosaic.children.push(card);
      } else {
        closeMosaic();
        out.push(card);
      }
    }

    flushIllinois();
    closeMosaic();
    tree.children = out;
  };
}
