import { getAuthorUrl } from "./urls.ts";

export interface JsonLdOptions {
  post?: {
    data: {
      slug: string;
      title: string;
      description: string;
      publishedAt: Date;
      draft?: boolean;
      noindex?: boolean;
      publicationAuthorised?: boolean;
      updatedAt?: Date;
      articleType?: "Article" | "TechArticle";
      tags?: string[];
      hero?: { src: string };
    };
  };
  authors?: Array<{
    id: string;
    data: {
      name: string;
      bio?: string;
      avatar?: { src: string };
      sameAs?: string[];
    };
  }>;
  canonicalUrl: string;
  pageTitle?: string;
  pageDescription?: string;
  siteOrigin: string;
}

export function generateJsonLdGraph(
  options: JsonLdOptions,
): Record<string, any> {
  const graph: any[] = [];
  const { post, authors = [], canonicalUrl, siteOrigin } = options;

  // Author Person nodes
  for (const author of authors) {
    const authorUrl = getAuthorUrl(author.id, siteOrigin);
    const personNode: Record<string, any> = {
      "@type": "Person",
      "@id": `${authorUrl}#person`,
      name: author.data.name,
      url: authorUrl,
    };
    if (author.data.bio) {
      personNode.description = author.data.bio;
    }
    if (author.data.avatar?.src) {
      personNode.image = `${siteOrigin.replace(/\/+$/, "")}${author.data.avatar.src}`;
    }
    if (author.data.sameAs && author.data.sameAs.length > 0) {
      personNode.sameAs = author.data.sameAs;
    }
    graph.push(personNode);
  }

  // Post Article/TechArticle node
  if (post) {
    const articleType = post.data.articleType ?? "TechArticle";
    const authorRefs = authors.map((a) => ({
      "@id": `${getAuthorUrl(a.id, siteOrigin)}#person`,
    }));

    const articleNode: Record<string, any> = {
      "@type": articleType,
      "@id": `${canonicalUrl}#article`,
      isPartOf: {
        "@type": "WebSite",
        "@id": `${siteOrigin.replace(/\/+$/, "")}/#website`,
        name: "Cold Boot",
        url: siteOrigin,
      },
      headline: post.data.title,
      description: post.data.description,
      mainEntityOfPage: canonicalUrl,
      url: canonicalUrl,
      ...(!post.data.draft &&
      !post.data.noindex &&
      post.data.publicationAuthorised === true
        ? {
            datePublished: post.data.publishedAt.toISOString(),
            dateModified: (
              post.data.updatedAt ?? post.data.publishedAt
            ).toISOString(),
          }
        : {}),
      author:
        authorRefs.length > 0
          ? authorRefs
          : [{ "@type": "Person", name: "Editor" }],
      publisher: {
        "@type": "Person",
        "@id": `${siteOrigin}/authors/cjskii#person`,
        name: "CJSKI",
        url: `${siteOrigin}/authors/cjskii`,
      },
    };

    if (post.data.tags && post.data.tags.length > 0) {
      articleNode.keywords = post.data.tags;
    }

    if (post.data.hero?.src) {
      articleNode.image = `${siteOrigin.replace(/\/+$/, "")}${post.data.hero.src}`;
    }

    const cover = (post.data as { cover?: { url: string } }).cover;
    if (cover && !cover.url.endsWith(".svg"))
      articleNode.image = siteOrigin + cover.url;
    graph.push(articleNode);
  } else {
    // Website / WebPage node
    graph.push({
      "@type": "WebPage",
      "@id": `${canonicalUrl}#webpage`,
      url: canonicalUrl,
      name: options.pageTitle ?? "Cold Boot",
      description: options.pageDescription ?? "",
      isPartOf: {
        "@type": "WebSite",
        "@id": `${siteOrigin.replace(/\/+$/, "")}/#website`,
        name: "Cold Boot",
        url: siteOrigin,
      },
    });
  }

  return {
    "@context": "https://schema.org",
    "@graph": graph,
  };
}

export function serializeJsonLd(graph: Record<string, any>): string {
  return JSON.stringify(graph)
    .replace(/</g, "\\u003c")
    .replace(/\u2028/g, "\\u2028")
    .replace(/\u2029/g, "\\u2029");
}
