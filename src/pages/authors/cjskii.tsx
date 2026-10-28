import Link from "next/link";
import { PageLayout } from "@/components/page-layout";
import { site } from "@/lib/site";
export default function Author() {
  return (
    <PageLayout
      title={`${site.name}, author`}
      metaType="profile"
      description="CJSKI, software and AI engineer and author of Cold Boot."
    >
      <header className="page-heading">
        <h1>{site.name}.</h1>
        <p className="lead">{site.role}. Author of Cold Boot.</p>
      </header>
      <div className="prose">
        <p>
          Writing about AI systems, software and infrastructure. My background
          includes seven years working with robotics and automated systems.
        </p>
        <div className="profile-links">
          <Link href="/about">About me</Link>
          <a href={site.x} target="_blank" rel="noopener noreferrer">
            {site.handle}
          </a>
          <a href={site.github} target="_blank" rel="noopener noreferrer">
            GitHub
          </a>
        </div>
        <h2>Articles</h2>
        <p>No articles published yet.</p>
        <Link href="/blog">Cold Boot</Link>
      </div>
    </PageLayout>
  );
}
