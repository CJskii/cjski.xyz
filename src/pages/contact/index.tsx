import { GitHubIcon } from "@/assets/icons/social";
import { PageLayout } from "@/components/page-layout";
import { site } from "@/lib/site";
import { CalendarDays, ArrowUpRight } from "lucide-react";
export default function Contact() {
  return (
    <PageLayout
      title="Contact"
      description="Contact CJSKI for projects, collaboration and engineering opportunities."
    >
      <section className="contact-page">
        <h1>Let’s talk.</h1>
        <p className="lead">
          For projects, collaboration or engineering opportunities.
        </p>
        <a
          className="button-primary booking-contact"
          href={site.booking}
          target="_blank"
          rel="noopener noreferrer"
        >
          <CalendarDays size={18} aria-hidden="true" />
          Book a call
        </a>
        <a className="contact-email" href={`mailto:${site.email}`}>
          {site.email}
          <ArrowUpRight aria-hidden="true" />
        </a>
        <div className="contact-socials">
          <a href={site.github} target="_blank" rel="noopener noreferrer">
            <span className="brand-icon" aria-hidden="true">
              <GitHubIcon />
            </span>
            <span>
              GitHub<strong>{site.name}</strong>
            </span>
          </a>
          <a href={site.x} target="_blank" rel="noopener noreferrer">
            <span className="x-symbol" aria-hidden="true">
              𝕏
            </span>
            <span>
              X<strong>{site.handle}</strong>
            </span>
          </a>
        </div>
      </section>
    </PageLayout>
  );
}
