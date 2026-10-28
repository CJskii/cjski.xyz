import type { GetServerSideProps } from "next";
import { site } from "@/lib/site";
import { getPublicArticles } from "@/lib/public-content";
import { escapeXml } from "../../scripts/content-policy.mjs";
export const getServerSideProps: GetServerSideProps = async ({ res }) => {
  const items = getPublicArticles()
    .map(
      (p) =>
        `<item><title>${escapeXml(p.title)}</title><description>${escapeXml(p.description)}</description><link>${site.origin}/blog/${escapeXml(p.slug)}</link><guid>${site.origin}/blog/${escapeXml(p.slug)}</guid><pubDate>${new Date(p.publishedAt).toUTCString()}</pubDate></item>`,
    )
    .join("");
  res.setHeader("Content-Type", "application/rss+xml; charset=utf-8");
  res.write(
    `<?xml version="1.0" encoding="UTF-8"?><rss version="2.0"><channel><title>Cold Boot</title><link>${site.origin}/blog</link><description>${escapeXml(site.description)}</description><language>en</language>${items}</channel></rss>`,
  );
  res.end();
  return { props: {} };
};
export default function Feed() {
  return null;
}
