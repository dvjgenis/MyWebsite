import { getCollection, render } from "astro:content";

export async function getPageBySlug(slug: string) {
  const pages = await getCollection("pages");
  const page = pages.find((p) => p.data.slug === slug);
  if (!page) return null;
  const { Content } = await render(page);
  return { page, Content };
}

export async function getPageData(slug: string) {
  const pages = await getCollection("pages");
  return pages.find((p) => p.data.slug === slug)?.data ?? null;
}
