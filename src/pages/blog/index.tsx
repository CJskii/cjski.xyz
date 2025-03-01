import fs from "fs";
import path from "path";
import matter from "gray-matter";
import { NextPage } from "next";
import { Typography } from "@/components/ui/typography";
import { PageLayout } from "@/components/page-layout";
import { CardWrapper } from "@/components/card";

interface Props {
  articles: Article[];
}

type Article = {
  slug: string;
  title: string;
  date: string;
  excerpt: string;
};

export async function getStaticProps() {
  const articlesDir = path.join(process.cwd(), "src/content/articles");
  const filenames = fs.readdirSync(articlesDir);

  const articles: Article[] = filenames
    .filter((filename) => filename.endsWith(".md") || filename.endsWith(".mdx"))
    .map((filename) => {
      const filePath = path.join(articlesDir, filename);
      const fileContent = fs.readFileSync(filePath, "utf-8");
      const { data } = matter(fileContent);

      return {
        slug: filename.replace(/\.(md|mdx)$/, ""),
        title: data.title,
        date: data.date,
        excerpt: data.excerpt,
      };
    });

  return { props: { articles } };
}

const Blog: NextPage<Props> = ({ articles }: { articles: Article[] }) => {
  return (
    <PageLayout
      title="Blog"
      description="A collection of articles about development, home server, automation and other topics."
      justify="start"
      align="start"
    >
      <Typography variant="h1" className="px-8 ">
        Blog
      </Typography>
      <div className="grid md:grid-cols-2 xl:grid-cols-2 gap-4 flex-grow px-8 py-20 w-full">
        {articles.map((article) => (
          <CardWrapper
            key={article.slug}
            href={`/blog/${article.slug}`}
            title={article.title}
            description={article.excerpt}
            footerText={article.date}
            footer={true}
            // icon={} - TODO: select icon based on the category of the article
          >
            <span>Article intro placeholder</span>
          </CardWrapper>
        ))}
      </div>
    </PageLayout>
  );
};

export default Blog;
