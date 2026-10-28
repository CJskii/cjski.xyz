import type { GetStaticProps, InferGetStaticPropsType } from "next";
import { getGithubSnapshot } from "@/lib/github-service";
import type { GithubSnapshot } from "@/lib/github";
import { GithubActivity } from "@/components/github-activity";
import { PublicationLinks } from "@/components/publication-links";
import { GitHubIcon } from "@/assets/icons/social";
import Image from "next/image";
import Link from "next/link";
import { Mail } from "lucide-react";
import { PageLayout } from "@/components/page-layout";
import { site } from "@/lib/site";
import { labProjects } from "@/lib/lab";
import { selectedProjects } from "@/lib/projects";
import { PortfolioProject } from "@/components/projects/portfolio-project";
export const getStaticProps: GetStaticProps<{
  github: GithubSnapshot;
}> = async () => ({
  props: { github: await getGithubSnapshot() },
  revalidate: 900,
});
export default function Home({
  github,
}: InferGetStaticPropsType<typeof getStaticProps>) {
  return (
    <PageLayout title={site.role} description={site.description}>
      <section className="portfolio-hero">
        <div className="portfolio-intro">
          <h1>{site.name}.</h1>
          <p className="portfolio-role">{site.role}.</p>
          <p className="portfolio-bio">
            Web applications, AI integrations and self-hosted systems. Seven
            years of experience in robotics and automated systems.
          </p>
          <div className="hero-actions">
            <Link className="button-primary" href="/projects">
              View projects
            </Link>
            <a
              className="button-secondary"
              href={site.booking}
              target="_blank"
              rel="noopener noreferrer"
            >
              Book a call
            </a>
          </div>
          <div className="profile-links">
            <a href={site.github} target="_blank" rel="noopener noreferrer">
              <span className="brand-icon" aria-hidden="true">
                <GitHubIcon />
              </span>
              GitHub
            </a>
            <a href={`mailto:${site.email}`}>
              <Mail size={17} aria-hidden="true" />
              Email me
            </a>
            <a href={site.x} target="_blank" rel="noopener noreferrer">
              <span className="x-symbol" aria-hidden="true">
                𝕏
              </span>
              {site.handle}
            </a>
          </div>
        </div>
        <div className="portrait-composition">
          <div className="portrait-backplate" aria-hidden="true" />
          <Image
            className="portrait"
            src="/static/avatar.png"
            alt={site.name}
            width={1024}
            height={1024}
            priority
            sizes="(max-width:700px) 230px, 360px"
          />
        </div>
      </section>
      <section className="selected-work" aria-labelledby="selected-projects">
        <div className="section-heading">
          <h2 id="selected-projects">Featured work</h2>
          <Link className="text-link" href="/projects">
            Project details
          </Link>
        </div>
        <div className="selected-project-grid featured-three">
          {selectedProjects.map((project) => (
            <PortfolioProject key={project.id} project={project} />
          ))}
        </div>
      </section>
      <section className="lab-overview" aria-labelledby="lab-heading">
        <div className="section-heading">
          <h2 id="lab-heading">In the lab</h2>
          <Link className="text-link" href="/lab">
            Explore the lab
          </Link>
        </div>
        <div className="lab-overview-grid">
          {labProjects
            .filter((project) => project.id !== "home-assistant")
            .map((project) => (
              <article key={project.id}>
                <p className="lab-status">{project.status}</p>
                <h3>
                  <Link href={`/lab/${project.id}`}>{project.title}</Link>
                </h3>
                <p className="lab-summary">{project.summary}</p>
                {project.id === "home-lab" && (
                  <Link
                    className="lab-secondary-link"
                    href="/lab/home-assistant"
                  >
                    Home Assistant & home automation
                  </Link>
                )}
              </article>
            ))}
        </div>
      </section>
      <section
        className="earlier-work-preview"
        aria-labelledby="earlier-work-heading"
      >
        <div>
          <h2 id="earlier-work-heading">Earlier work</h2>
          <h3>Etherway</h3>
          <p>
            A cross-chain application I built end to end, bringing together
            swaps, transfers and gas refuelling.
          </p>
        </div>
        <Link className="text-link" href="/projects/1">
          Read the case study
        </Link>
      </section>
      <GithubActivity initial={github} />
      <PublicationLinks />
      <section className="contact-strip">
        <h2>Have something in mind?</h2>
        <div className="contact-strip-actions">
          <a
            className="button-primary"
            href={site.booking}
            target="_blank"
            rel="noopener noreferrer"
          >
            Book a call
          </a>
          <Link className="text-link" href="/contact">
            Other ways to connect
          </Link>
        </div>
      </section>
    </PageLayout>
  );
}
