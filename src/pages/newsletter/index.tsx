import Link from "next/link";
import { PageLayout } from "@/components/page-layout";
import { NewsletterSignup } from "@/components/newsletter-signup";
export default function Newsletter() {
  return (
    <PageLayout
      title="Cold Boot newsletter"
      description="Selected articles, useful links and project updates from CJSKI."
    >
      <header className="page-heading">
        <h1>The newsletter.</h1>
        <p className="lead">
          A selection of writing, links and project updates.
        </p>
      </header>
      <section className="blog-newsletter" aria-label="Subscribe to Cold Boot">
        <div>
          <p className="eyebrow">Cold Boot, in your inbox</p>
          <h2>Keep the useful bits.</h2>
          <p>
            What worked, what broke, and what I learned building useful systems
            in my home lab.
          </p>
        </div>
        <NewsletterSignup />
      </section>
      <div className="publication-followup">
        <h2>More to explore</h2>
        <p>
          Find the full articles on the blog, or take a look at the projects
          behind them.
        </p>
        <div className="profile-links">
          <Link href="/blog">Cold Boot blog</Link>
          <Link href="/projects">Browse projects</Link>
        </div>
      </div>
    </PageLayout>
  );
}
