import { defineCollection } from "astro:content";
import { z } from "astro/zod";
import { glob } from "astro/loaders";
const posts = defineCollection({
  loader: glob({
    base: new URL("../../.generated/blog/content", import.meta.url).pathname,
    pattern: "*.md",
  }),
  schema: z.object({
    slug: z.string(),
    title: z.string(),
    description: z.string(),
    publishedAt: z.coerce.date(),
    updatedAt: z.coerce.date().optional(),
    draft: z.boolean(),
    publicationAuthorised: z.boolean(),
    fixture: z.boolean(),
    cover: z.object({ url: z.string(), alt: z.string() }).optional(),
    readingTime: z.number().optional(),
    tags: z.array(z.string()),
    authors: z.array(z.string()),
    noindex: z.boolean(),
  }),
});
export const collections = { posts };
