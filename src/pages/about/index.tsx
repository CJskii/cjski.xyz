import Image from "next/image";
import Link from "next/link";
import { PageLayout } from "@/components/page-layout";
import { site } from "@/lib/site";
export default function About() {
  return (
    <PageLayout
      title="About"
      description="CJSKI, software and AI engineer with seven years of experience in robotics and automated systems."
    >
      <section className="about-layout">
        <div>
          <h1>About me.</h1>
          <p className="lead">
            I’m {site.name}, a software and AI engineer. I build web
            applications, AI integrations and self-hosted systems.
          </p>
          <div className="about-copy">
            <p>
              My background is in robotics and automated systems, with seven
              years of hands-on experience.
            </p>
            <p>
              I also write about AI and software at{" "}
              <Link href="/blog">Cold Boot</Link>.
            </p>
            <p>Outside of code: reading and training.</p>
          </div>
          <div className="hero-actions">
            <Link className="button-primary" href="/projects">
              View projects
            </Link>
            <Link className="button-secondary" href="/contact">
              Get in touch
            </Link>
          </div>
          <div className="profile-links">
            <a href={site.github} target="_blank" rel="noopener noreferrer">
              GitHub
            </a>
            <a href={site.x} target="_blank" rel="noopener noreferrer">
              {site.handle}
            </a>
          </div>
        </div>
        <Image
          className="about-portrait"
          src="/static/avatar.png"
          alt={site.name}
          width={1024}
          height={1024}
          sizes="(max-width:700px) 230px, 320px"
          priority
        />
      </section>
    </PageLayout>
  );
}
