import { defineCollection, z } from "astro:content";
import { glob } from "astro/loaders";

const pageSchema = z.object({
  title: z.string(),
  slug: z.string(),
  description: z.string().optional(),
  quote: z.string().optional(),
  quoteAuthor: z.string().optional(),
  heroImage: z.string().optional(),
  featuredLeftImage: z.string().optional(),
  featuredChartImage: z.string().optional(),
  featuredRightImage: z.string().optional(),
  featuredProjectsImage: z.string().optional(),
  featuredSpeakingImage: z.string().optional(),
  cardBackgroundImage: z.string().optional(),
  cardEducationImage: z.string().optional(),
  cardInvolvementsImage: z.string().optional(),
  cardResourcesImage: z.string().optional(),
  images: z.array(z.string()).optional(),
  youtube: z.array(z.string()).optional(),
});

const pages = defineCollection({
  loader: glob({ base: "./src/content/pages", pattern: "**/index.md" }),
  schema: pageSchema,
});

export const collections = { pages };
