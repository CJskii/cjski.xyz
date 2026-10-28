import Link from "next/link";
import { BookOpen, Mail } from "lucide-react";
import { publicationLinks } from "@/lib/site";
export function PublicationLinks() {
  const newsletterUrl = publicationLinks.newsletter;
  return (
    <section
      className="publication-section"
      aria-labelledby="publication-heading"
    >
      <div className="section-heading">
        <h2 id="publication-heading">Writing & updates</h2>
      </div>
      <div className="publication-grid">
        <Link href="/blog" className="publication-card blog-card">
          <BookOpen size={25} aria-hidden="true" />
          <div>
            <h3>Cold Boot</h3>
            <p>Articles on AI systems, software and self-hosted tools.</p>
            <span className="publication-action">Explore the blog</span>
          </div>
        </Link>
        <Link
          href={newsletterUrl || "/newsletter"}
          className="publication-card newsletter-card"
          target={newsletterUrl ? "_blank" : undefined}
          rel={newsletterUrl ? "noopener noreferrer" : undefined}
        >
          <Mail size={25} aria-hidden="true" />
          <div>
            <h3>The newsletter</h3>
            <p>Selected articles, useful links and project updates.</p>
            <span className="publication-action">
              {newsletterUrl ? "Subscribe" : "Newsletter details"}
            </span>
          </div>
        </Link>
      </div>
    </section>
  );
}
