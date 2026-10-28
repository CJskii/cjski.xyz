import type { GetServerSideProps, InferGetServerSidePropsType } from "next";
import Link from "next/link";
import Head from "next/head";
import { PageLayout } from "@/components/page-layout";
import { allowLocalReview } from "@/lib/local-review";
import { loadDraft, draftSlug } from "@/lib/draft-article";
import { site } from "@/lib/site";
export const getServerSideProps: GetServerSideProps<{
  article: Awaited<ReturnType<typeof loadDraft>>;
}> = async ({ req, res, params }) => {
  res.setHeader("X-Robots-Tag", "noindex, nofollow, noarchive");
  res.setHeader("Cache-Control", "private, no-store");
  if (!allowLocalReview(req) || params?.slug !== draftSlug)
    return { notFound: true };
  return { props: { article: await loadDraft() } };
};
export default function Review({
  article,
}: InferGetServerSidePropsType<typeof getServerSideProps>) {
  return (
    <PageLayout
      title={article.title}
      metaType="article"
      description="A missing model parameter caused false cloud fallback. Fixing the probe and evaluating the output are separate problems."
      noindex
      canonicalPath={new URL(article.canonical).pathname}
    >
      <Head>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@type": "TechArticle",
              headline: article.title,
              mainEntityOfPage: article.canonical,
              author: {
                "@type": "Person",
                name: site.name,
                url: new URL(site.authorPath, site.origin).href,
              },
            }).replace(/</g, "\\u003c"),
          }}
        />
      </Head>
      <div className="review-banner">
        <strong>Local private review · content {article.revision}</strong>
        <span>
          Draft — publication is not authorised. The canonical is an intended
          destination.
        </span>
      </div>
      <header className="article-heading">
        <Link className="eyebrow" href="/blog/">
          Cold Boot / Local inference & evaluation
        </Link>
        <h1>{article.title}</h1>
        <div className="article-byline">
          <Link href={site.authorPath}>By {site.name}</Link>
          <span>Content revision {article.revision} · unpublished</span>
        </div>
      </header>
      <div className="article-layout">
        <aside className="article-toc">
          <p className="eyebrow">In this article</p>
          <nav aria-label="Article sections">
            {article.headings.map((h) => (
              <a key={h.id} href={`#${h.id}`}>
                {h.title}
              </a>
            ))}
          </nav>
        </aside>
        <article
          className="prose article-body"
          dangerouslySetInnerHTML={{ __html: article.body }}
        />
      </div>
      <section className="article-end">
        <p className="eyebrow">Related reading</p>
        <h2>Which work should the local model own?</h2>
        <p>
          This investigation belongs to the local inference and evaluation
          story. Further articles will appear once reviewed.
        </p>
        <Link className="text-link" href={site.authorPath}>
          About the author
        </Link>
        <details>
          <summary>Import provenance</summary>
          <p>
            Content v3; website rendering is a separate revision requiring
            review.
          </p>
          <p>
            Source SHA256: <code>{article.sourceHash}</code>
          </p>
          <p>
            Upstream bundle: <code>{article.bundleDigest}</code>
          </p>
        </details>
      </section>
    </PageLayout>
  );
}
