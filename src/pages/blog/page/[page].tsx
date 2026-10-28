import type { GetStaticPaths, GetStaticProps } from "next";
import { BlogArchive, ARTICLES_PER_PAGE } from "@/components/blog/archive";
import { getPublicArticles } from "@/lib/public-content";
export const getStaticPaths: GetStaticPaths = async () => ({
  paths: Array.from(
    {
      length: Math.max(
        0,
        Math.ceil(getPublicArticles().length / ARTICLES_PER_PAGE) - 1,
      ),
    },
    (_, i) => ({ params: { page: String(i + 2) } }),
  ),
  fallback: false,
});
export const getStaticProps: GetStaticProps = async ({ params }) => {
  const page = Number(params?.page),
    total = Math.ceil(getPublicArticles().length / ARTICLES_PER_PAGE);
  return !Number.isSafeInteger(page) || page < 2 || page > total
    ? { notFound: true }
    : { props: { pageNumber: page } };
};
export default function BlogPage({ pageNumber }: { pageNumber: number }) {
  return <BlogArchive articles={getPublicArticles()} pageNumber={pageNumber} />;
}
