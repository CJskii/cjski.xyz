import Link from "next/link";
import { PageLayout } from "@/components/page-layout";
import { PublicationDestination } from "@/components/publication-destination";
export default function Blog() {
  return (
    <PageLayout
      title="Cold Boot blog"
      description="Articles about AI systems, software and self-hosted tools by CJSKI."
    >
      <header className="page-heading">
        <h1>Cold Boot.</h1>
        <p className="lead">AI systems, software and self-hosted tools.</p>
      </header>
      <PublicationDestination kind="blog" />
      <div className="publication-followup">
        <h2>Related work</h2>
        <p>Explore the implementations behind the topics covered here.</p>
        <div className="profile-links">
          <Link href="/projects/1">Etherway case study</Link>
          <Link href="/lab/local-inference">Local inference lab</Link>
        </div>
      </div>
      <div className="publication-followup">
        <h2>Prefer it in your inbox?</h2>
        <p>
          The newsletter brings together selected writing, links and project
          updates.
        </p>
        <Link className="text-link" href="/newsletter">
          Explore the newsletter
        </Link>
      </div>
    </PageLayout>
  );
}
