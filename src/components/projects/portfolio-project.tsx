import Image from "next/image";
import Link from "next/link";
import type { Project } from "@/lib/projects";
export function PortfolioProject({
  project,
  heading = "h3",
  showLink = false,
}: {
  project: Project;
  heading?: "h2" | "h3";
  showLink?: boolean;
}) {
  const Heading = heading;
  return (
    <article className="portfolio-project">
      <Link
        className="project-image-link"
        href={`/projects/${project.id}`}
        tabIndex={-1}
        aria-hidden="true"
      >
        {project.image && (
          <Image
            src={project.image}
            alt=""
            width={project.imageWidth || 1360}
            height={project.imageHeight || 900}
            sizes="(max-width:700px) 100vw, 550px"
          />
        )}
      </Link>
      <div className="project-card-content">
        <div className="project-card-heading">
          <Heading>
            <Link href={`/projects/${project.id}`}>{project.title}</Link>
          </Heading>
        </div>
        <p className="project-summary">{project.summary}</p>
        <div className="project-stack">
          {project.stack.map((technology) => (
            <span key={technology}>{technology}</span>
          ))}
        </div>
        {showLink && (
          <Link
            className="text-link project-detail-link"
            href={`/projects/${project.id}`}
          >
            View project
          </Link>
        )}
      </div>
    </article>
  );
}
