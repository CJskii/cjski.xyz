import { BlogArchive } from "@/components/blog/archive";
import { getPublicArticles } from "@/lib/public-content";
export default function Blog() {
  return <BlogArchive articles={getPublicArticles()} />;
}
