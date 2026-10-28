import entries from "../../content/articles.json";
import { publicArticles } from "../../scripts/content-policy.mjs";
export interface PublicArticle {
  slug: string;
  title: string;
  description: string;
  publishedAt: string;
  draft: boolean;
  fixture?: boolean;
  publicationAuthorised: boolean;
}
export function getPublicArticles(now = new Date()): PublicArticle[] {
  return publicArticles(entries as PublicArticle[], now);
}
