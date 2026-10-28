export function publicArticles<
  T extends {
    draft: boolean;
    fixture?: boolean;
    publicationAuthorised: boolean;
    publishedAt?: string;
  },
>(entries: T[], now?: Date): T[];
export function escapeXml(value: unknown): string;
