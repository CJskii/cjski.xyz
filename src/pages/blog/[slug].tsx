import fs from "fs";
import path from "path";
import matter from "gray-matter";
import { MDXRemote, MDXRemoteSerializeResult } from "next-mdx-remote";
import { serialize } from "next-mdx-remote/serialize";
import { GetStaticPaths, GetStaticProps } from "next";
import remarkGfm from "remark-gfm";
import remarkBreaks from "remark-breaks";
import { NextPage } from "next";
import { PageLayout } from "@/components/page-layout";
import { Typography } from "@/components/ui/typography";

type ArticleProps = {
  mdxSource: MDXRemoteSerializeResult;
  frontMatter: {
    title: string;
    date: string;
    excerpt: string;
  };
};

export const getStaticPaths: GetStaticPaths = async () => {
  const articlesDir = path.join(process.cwd(), "src/content/articles");
  const filenames = fs.readdirSync(articlesDir);

  const paths = filenames
    .filter((filename) => filename.endsWith(".md") || filename.endsWith(".mdx"))
    .map((filename) => ({
      params: { slug: filename.replace(/\.(md|mdx)$/, "") },
    }));

  return { paths, fallback: false };
};

export const getStaticProps: GetStaticProps = async ({ params }) => {
  const slug = params?.slug as string;
  const filePathMd = path.join(
    process.cwd(),
    "src/content/articles",
    `${slug}.md`
  );
  const filePathMdx = path.join(
    process.cwd(),
    "content/articles",
    `${slug}.mdx`
  );

  let filePath;
  if (fs.existsSync(filePathMd)) {
    filePath = filePathMd;
  } else if (fs.existsSync(filePathMdx)) {
    filePath = filePathMdx;
  } else {
    return { notFound: true };
  }

  const fileContent = fs.readFileSync(filePath, "utf-8");
  const { data, content } = matter(fileContent);

  const mdxSource = await serialize(content, {
    mdxOptions: {
      remarkPlugins: [remarkGfm, remarkBreaks],
    },
  });

  return { props: { mdxSource, frontMatter: data } };
};

const BlogPost: NextPage<ArticleProps> = ({
  mdxSource,
  frontMatter,
}: ArticleProps) => {
  return (
    <PageLayout
      title={frontMatter.title}
      description={frontMatter.title}
      gap={4}
      justify="start"
      align="start"
    >
      <div className="flex flex-col gap-4 mb-8">
        <Typography variant="h1">{frontMatter.title}</Typography>
        <Typography variant="h4">{frontMatter.excerpt}</Typography>
        <Typography variant="lead">{frontMatter.date}</Typography>
      </div>

      <MDXRemote {...mdxSource} />
    </PageLayout>
  );
};

export default BlogPost;
