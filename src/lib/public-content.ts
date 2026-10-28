import entries from "../../content/articles.json";
import { publicArticles } from "../../scripts/content-policy.mjs";
export interface PublicArticle {
  slug: string;
  title: string;
  description: string;
  publishedAt: string;
  tags?: string[];
  readingTime?: number;
  cover?: { url: string; alt: string; width?: number; height?: number };
  draft: boolean;
  fixture?: boolean;
  publicationAuthorised: boolean;
}
export function getPublicArticles(now = new Date()): PublicArticle[] {
  return publicArticles(entries as PublicArticle[], now).sort(
    (a, b) => Date.parse(b.publishedAt) - Date.parse(a.publishedAt),
  );
}
