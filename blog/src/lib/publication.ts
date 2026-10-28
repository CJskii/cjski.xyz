export interface PostLike {
  data: {
    slug: string;
    title?: string;
    description?: string;
    publishedAt: Date;
    updatedAt?: Date;
    draft: boolean;
    fixture?: boolean;
    publicationAuthorised?: boolean;
    authors?: any[];
    tags?: string[];
    featured?: boolean;
    readingTime?: number;
    noindex?: boolean;
  };
  body?: string;
}

export function calculateReadingTime(text: string): number {
  if (!text) return 1;
  const words = text.trim().split(/\s+/).filter(Boolean).length;
  const minutes = Math.ceil(words / 200);
  return Math.max(1, minutes);
}

export function publishedPosts<T extends PostLike>(
  posts: T[],
  buildTime = new Date(),
): T[] {
  return posts
    .filter(
      (post) =>
        post.data.draft === false &&
        post.data.fixture !== true &&
        post.data.publicationAuthorised === true &&
        post.data.publishedAt.getTime() <= buildTime.getTime(),
    )
    .sort((a, b) => {
      const timeDiff =
        b.data.publishedAt.getTime() - a.data.publishedAt.getTime();
      if (timeDiff !== 0) return timeDiff;
      return a.data.slug.localeCompare(b.data.slug);
    });
}

export function getFeaturedPosts<T extends PostLike>(
  posts: T[],
  buildTime = new Date(),
): T[] {
  return publishedPosts(posts, buildTime).filter((post) =>
    Boolean(post.data.featured),
  );
}

export function getAllTags<T extends { data: { tags?: string[] } }>(
  posts: T[],
): { tag: string; count: number }[] {
  const tagCounts = new Map<string, number>();
  for (const post of posts) {
    for (const tag of post.data.tags ?? []) {
      tagCounts.set(tag, (tagCounts.get(tag) ?? 0) + 1);
    }
  }
  return Array.from(tagCounts.entries())
    .map(([tag, count]) => ({ tag, count }))
    .sort((a, b) => b.count - a.count || a.tag.localeCompare(b.tag));
}

declare const __HERMES_PRIVATE_PREVIEW__: boolean;
declare const __HERMES_PREVIEW_SLUG__: string;

export function isPrivatePreview(): boolean {
  return (
    typeof __HERMES_PRIVATE_PREVIEW__ !== "undefined" &&
    __HERMES_PRIVATE_PREVIEW__
  );
}

export function previewPosts<T extends PostLike>(
  posts: T[],
  buildTime = new Date(),
): T[] {
  if (
    !isPrivatePreview() ||
    typeof __HERMES_PREVIEW_SLUG__ === "undefined" ||
    !__HERMES_PREVIEW_SLUG__
  )
    return publishedPosts(posts, buildTime);
  return posts.filter((post) => post.data.slug === __HERMES_PREVIEW_SLUG__);
}
