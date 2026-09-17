// @ts-check
import { defineConfig } from "astro/config";
import react from "@astrojs/react";
import sitemap from "@astrojs/sitemap";
import tailwindcss from "@tailwindcss/vite";
import { googleSitesRedirects } from "./src/data/navigation.ts";
import { rehypeEntryCards } from "./src/lib/rehype-entry-cards.js";

/** Prefer unsuffixed keys so `/about-me` and `/about-me/` both resolve. */
function withSlashVariants(map) {
  /** @type {Record<string, string>} */
  const out = {};
  for (const [from, to] of Object.entries(map)) {
    const key = from.endsWith("/") ? from.slice(0, -1) : from;
    out[key] = to;
  }
  return out;
}

function nodeText(node) {
  if (!node) return "";
  if (node.type === "text") return node.value || "";
  if (!node.children) return "";
  return node.children.map(nodeText).join("");
}

/** Same slug rule as scripts/extract-export.mjs so Background TOC jumps work. */
function rehypeMatchTocIds() {
  return (tree) => {
    const walk = (node) => {
      if (node?.type === "element" && /^h[1-6]$/.test(node.tagName)) {
        const id = nodeText(node)
          .toLowerCase()
          .replace(/[^a-z0-9]+/g, "-")
          .replace(/^-|-$/g, "");
        if (id) {
          node.properties ||= {};
          node.properties.id = id;
        }
      }
      node?.children?.forEach(walk);
    };
    walk(tree);
  };
}

/** Turn `youtube:VIDEO_ID` paragraphs into inline embeds. */
function youtubeEmbed(id, short = false) {
  return {
    type: "element",
    tagName: "div",
    properties: { className: short ? ["youtube-embed", "youtube-embed--short"] : ["youtube-embed"] },
    children: [
      {
        type: "element",
        tagName: "iframe",
        properties: {
          src: `https://www.youtube-nocookie.com/embed/${id}`,
          title: "YouTube video",
          loading: "lazy",
          allow:
            "accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share",
          allowFullScreen: true,
          referrerpolicy: "strict-origin-when-cross-origin",
        },
        children: [],
      },
    ],
  };
}

function rehypeYoutubeEmbeds() {
  return (tree) => {
    const walk = (node, parent, index) => {
      if (node?.type === "element" && node.tagName === "p" && parent && typeof index === "number") {
        const lines = nodeText(node)
          .trim()
          .split(/\n+/)
          .map((line) => line.trim())
          .filter(Boolean);
        const parsed = lines
          .map((line) => line.match(/^youtube(-short)?:([A-Za-z0-9_-]{11})$/))
          .filter(Boolean)
          .map((m) => ({ short: Boolean(m[1]), id: m[2] }));
        if (parsed.length && parsed.length === lines.length) {
          const embeds = parsed.map((item) => youtubeEmbed(item.id, item.short));
          parent.children[index] =
            embeds.length === 1
              ? embeds[0]
              : {
                  type: "element",
                  tagName: "div",
                  properties: { className: ["youtube-stack"] },
                  children: embeds,
                };
          return;
        }
      }
      node?.children?.forEach((child, i) => walk(child, node, i));
    };
    walk(tree, null, 0);
  };
}

/** Turn a quoted paragraph + short attribution into a proper blockquote. */
function rehypeVerseQuotes() {
  return (tree) => {
    const walk = (node) => {
      const kids = node?.children;
      if (!Array.isArray(kids) || !kids.length) return;
      const out = [];
      for (let i = 0; i < kids.length; i += 1) {
        const cur = kids[i];
        const next = kids[i + 1];
        const text = nodeText(cur).trim();
        const quoted =
          cur?.type === "element" &&
          cur.tagName === "p" &&
          /^[“"]/.test(text) &&
          /[”"]$/.test(text) &&
          text.length > 20 &&
          text.length < 900;
        const nextText = next ? nodeText(next).trim() : "";
        const nextIsList = next?.type === "element" && next.tagName === "ul";
        const nextIsDashP = next?.type === "element" && next.tagName === "p" && /^[–—-]\s+\S/.test(nextText);
        const cite =
          next &&
          nextText.length > 2 &&
          nextText.length < 100 &&
          ((nextIsList && (next.children || []).filter((n) => n.type === "element").length === 1) || nextIsDashP);
        if (quoted && cite) {
          out.push({
            type: "element",
            tagName: "blockquote",
            properties: { className: ["pull-quote"] },
            children: [
              cur,
              {
                type: "element",
                tagName: "footer",
                properties: {},
                children: [{ type: "text", value: nextText.replace(/^[–—-]\s*/, "") }],
              },
            ],
          });
          i += 1;
          continue;
        }
        out.push(cur);
      }
      node.children = out;
      out.forEach(walk);
    };
    walk(tree);
  };
}

// https://astro.build/config
export default defineConfig({
  site: "https://dulfvincent.com",
  trailingSlash: "ignore",
  integrations: [react(), sitemap()],
  redirects: withSlashVariants(googleSitesRedirects),
  markdown: {
    // Rehype plugins run at markdown compile time; restart `astro dev` after editing them.
    // cache-bust: quotes + cumulative media (2026-09-17j)
    rehypePlugins: [rehypeYoutubeEmbeds, rehypeMatchTocIds, rehypeVerseQuotes, rehypeEntryCards],
  },
  vite: {
    plugins: [tailwindcss()],
  },
});
