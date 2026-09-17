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
function youtubeEmbed(id) {
  return {
    type: "element",
    tagName: "div",
    properties: { className: ["youtube-embed"] },
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
        const ids = lines
          .map((line) => line.match(/^youtube:([A-Za-z0-9_-]{11})$/))
          .filter(Boolean)
          .map((m) => m[1]);
        if (ids.length && ids.length === lines.length) {
          parent.children[index] =
            ids.length === 1
              ? youtubeEmbed(ids[0])
              : {
                  type: "element",
                  tagName: "div",
                  properties: { className: ["youtube-stack"] },
                  children: ids.map(youtubeEmbed),
                };
          return;
        }
      }
      node?.children?.forEach((child, i) => walk(child, node, i));
    };
    walk(tree, null, 0);
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
    // cache-bust: explode grouped imgs; essay 3-up throughout copy (2026-09-17c)
    rehypePlugins: [rehypeYoutubeEmbeds, rehypeMatchTocIds, rehypeEntryCards],
  },
  vite: {
    plugins: [tailwindcss()],
  },
});
