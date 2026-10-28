import Head from "next/head";
import Image from "next/image";
import { useMemo, useState } from "react";
import Link from "next/link";
import { site } from "@/lib/site";
import { PageLayout } from "@/components/page-layout";
import type { PublicArticle } from "@/lib/public-content";
export const ARTICLES_PER_PAGE = 12;
export function topicLabel(tag: string) {
  return tag
    .replaceAll("-", " ")
    .replace(/\bai\b/gi, "AI")
    .replace(/^./, (c) => c.toUpperCase());
}
export function BlogArchive({
  articles,
  pageNumber = 1,
  preview = false,
}: {
  articles: PublicArticle[];
  pageNumber?: number;
  preview?: boolean;
}) {
  const [query, setQuery] = useState("");
  const [topic, setTopic] = useState("");
  const [page, setPage] = useState(pageNumber);
  const topics = useMemo(
    () => [...new Set(articles.flatMap((a) => a.tags || []))].sort(),
    [articles],
  );
  const filtered = articles.filter(
    (a) =>
      (!topic || a.tags?.includes(topic)) &&
      (!query.trim() ||
        [a.title, a.description, ...(a.tags || [])]
          .join(" ")
          .toLowerCase()
          .includes(query.trim().toLowerCase())),
  );
  const pages = Math.max(1, Math.ceil(filtered.length / ARTICLES_PER_PAGE)),
    current = Math.min(page, pages),
    visible = filtered.slice(
      (current - 1) * ARTICLES_PER_PAGE,
      current * ARTICLES_PER_PAGE,
    ),
    active = !!query.trim() || !!topic;
  return (
    <PageLayout
      noindex={preview}
      title={
        pageNumber > 1 ? `Cold Boot — page ${pageNumber}` : "Cold Boot blog"
      }
      description="Field notes on AI systems, software and self-hosted tools. What worked, what broke, and what I learned."
      canonicalPath={pageNumber > 1 ? `/blog/page/${pageNumber}` : "/blog"}
    >
      <Head>
        <meta property="og:type" content="website" />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@type": "Blog",
              name: "Cold Boot",
              url: site.origin + "/blog",
              author: {
                "@type": "Person",
                name: site.name,
                url: site.origin + site.authorPath,
              },
              blogPost: visible.map((a) => ({
                "@type": "BlogPosting",
                headline: a.title,
                description: a.description,
                url: site.origin + "/blog/" + a.slug,
                datePublished: a.publishedAt,
                ...(a.cover && !a.cover.url.endsWith(".svg")
                  ? { image: site.origin + a.cover.url }
                  : {}),
              })),
            }).replace(/</g, "\\u003c"),
          }}
        />
      </Head>
      {preview && (
        <div className="review-banner">
          <strong>Temporary layout preview</strong>
          <span>
            Sample articles and dates only — these are not published field
            notes.
          </span>
        </div>
      )}
      <header className="page-heading blog-heading">
        <p className="eyebrow">The field notes</p>
        <h1>Cold Boot.</h1>
        <p className="lead">
          Building useful AI systems, one experiment at a time.
        </p>
        <p className="blog-intro">
          Notes from the lab, explanations worth keeping, and the occasional
          thing I had to break to understand.
        </p>
        <div className="profile-links">
          <Link href="/newsletter">
            Get the newsletter <span aria-hidden="true">↗</span>
          </Link>
          <a href="/rss.xml">Follow via RSS</a>
        </div>
      </header>
      {articles.length > 0 ? (
        <section aria-label="Articles" className="blog-archive">
          {articles.length > 0 && (
            <div className="blog-toolbar">
              <label className="blog-search">
                <span>Search articles</span>
                <input
                  type="search"
                  value={query}
                  onChange={(e) => {
                    setQuery(e.target.value);
                    setPage(1);
                  }}
                  placeholder="Models, networking, agents…"
                />
              </label>
              {topics.length > 0 && (
                <div
                  className="filters"
                  role="group"
                  aria-label="Article topics"
                >
                  {["", ...topics].map((t) => (
                    <button
                      key={t}
                      type="button"
                      aria-pressed={topic === t}
                      onClick={() => {
                        setTopic(t);
                        setPage(1);
                      }}
                    >
                      {t ? topicLabel(t) : "All topics"}
                    </button>
                  ))}
                </div>
              )}
            </div>
          )}
          <p className="blog-result-count" role="status">
            {filtered.length} {filtered.length === 1 ? "article" : "articles"}
            {active ? " found" : " · newest first"}
          </p>
          {visible.length ? (
            <div className="blog-index-card-grid">
              {visible.map((a) => (
                <article key={a.slug} className="blog-index-card">
                  <a
                    className="blog-index-card-visual"
                    href={`/blog/${a.slug}`}
                    tabIndex={-1}
                    aria-hidden="true"
                  >
                    {a.cover ? (
                      <Image
                        src={a.cover.url}
                        alt=""
                        width={a.cover.width || 1200}
                        height={a.cover.height || 630}
                        loading="lazy"
                        sizes="(max-width: 650px) 100vw, (max-width: 1050px) 50vw, 33vw"
                        decoding="async"
                      />
                    ) : (
                      <div className="blog-index-card-type" aria-hidden="true">
                        <span>Field note</span>
                        <strong>{a.title}</strong>
                      </div>
                    )}
                  </a>
                  <div className="blog-index-card-body">
                    <div className="blog-index-card-meta">
                      <time dateTime={a.publishedAt}>
                        {new Date(a.publishedAt).toLocaleDateString("en-GB", {
                          day: "numeric",
                          month: "short",
                          year: "numeric",
                          timeZone: "UTC",
                        })}
                      </time>
                      {a.readingTime && <span>{a.readingTime} min read</span>}
                    </div>
                    <h2>
                      <a href={`/blog/${a.slug}`}>{a.title}</a>
                    </h2>
                    <p>{a.description}</p>
                    {!!a.tags?.length && (
                      <ul
                        className="blog-index-card-topics"
                        aria-label="Topics"
                      >
                        {a.tags.slice(0, 3).map((t) => (
                          <li key={t}>{topicLabel(t)}</li>
                        ))}
                      </ul>
                    )}
                    <a
                      className="text-link blog-index-card-link"
                      href={`/blog/${a.slug}`}
                    >
                      Read field note <span aria-hidden="true">↗</span>
                      <span className="sr-only">: {a.title}</span>
                    </a>
                  </div>
                </article>
              ))}
            </div>
          ) : (
            <div className="blog-empty">
              <h2>No matching field notes.</h2>
              <p>Try another topic or a shorter search.</p>
              <button
                type="button"
                className="text-link"
                onClick={() => {
                  setQuery("");
                  setTopic("");
                  setPage(1);
                }}
              >
                Clear filters
              </button>
            </div>
          )}
          {pages > 1 && (
            <nav className="blog-pagination" aria-label="Article pages">
              {Array.from({ length: pages }, (_, i) => i + 1).map((n) =>
                active ? (
                  <button
                    key={n}
                    type="button"
                    aria-current={n === current ? "page" : undefined}
                    onClick={() => setPage(n)}
                  >
                    {n}
                  </button>
                ) : (
                  <a
                    key={n}
                    href={n === 1 ? "/blog" : `/blog/page/${n}`}
                    aria-current={n === current ? "page" : undefined}
                  >
                    {n}
                  </a>
                ),
              )}
            </nav>
          )}
        </section>
      ) : (
        <section className="blog-empty">
          <p className="eyebrow">First notes on the way</p>
          <h2>The lab is busy. The archive is warming up.</h2>
          <p>
            The first articles are being reviewed. Get the next one in your
            inbox, or explore the systems behind the writing.
          </p>
          <Link className="text-link" href="/lab">
            Explore the lab <span aria-hidden="true">↗</span>
          </Link>
        </section>
      )}
      <aside className="blog-newsletter">
        <div>
          <p className="eyebrow">Cold Boot, in your inbox</p>
          <h2>Keep the useful bits.</h2>
          <p>
            Selected field notes, lessons from the lab, and things worth trying
            yourself.
          </p>
        </div>
        <Link className="button-primary" href="/newsletter">
          Explore the newsletter <span aria-hidden="true">↗</span>
        </Link>
      </aside>
    </PageLayout>
  );
}
