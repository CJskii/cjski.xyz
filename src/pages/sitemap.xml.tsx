import type { GetServerSideProps } from "next";
import { site } from "@/lib/site";
import { labProjects } from "@/lib/lab";
import { projects } from "@/lib/projects";
import { getPublicArticles } from "@/lib/public-content";
import { escapeXml } from "../../scripts/content-policy.mjs";
export const getServerSideProps: GetServerSideProps = async ({ res }) => {
  const paths = [
    "/",
    "/about",
    "/authors/cjskii",
    "/projects",
    "/lab",
    ...labProjects.map((project) => `/lab/${project.id}`),
    "/contracts",
    "/blog",
    "/newsletter",
    "/contact",
    ...projects.map((p) => `/projects/${p.id}`),
    ...getPublicArticles().map((p) => `/blog/${p.slug}/`),
  ];
  res.setHeader("Content-Type", "application/xml; charset=utf-8");
  res.write(
    `<?xml version="1.0" encoding="UTF-8"?><urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">${paths.map((p) => `<url><loc>${escapeXml(new URL(p, site.origin).href)}</loc></url>`).join("")}</urlset>`,
  );
  res.end();
  return { props: {} };
};
export default function Sitemap() {
  return null;
}
