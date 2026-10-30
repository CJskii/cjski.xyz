import type {
  GetStaticPaths,
  GetStaticProps,
  InferGetStaticPropsType,
} from "next";
import Link from "next/link";
import Image from "next/image";
import { PageLayout } from "@/components/page-layout";
import styles from "@/components/projects/home-security-flow.module.css";
import { HomeSecurityFlow } from "@/components/projects/home-security-flow";
import { ProjectCover } from "@/components/projects/project-cover";
import { projects, type Project } from "@/lib/projects";
export const getStaticPaths: GetStaticPaths = async () => ({
  paths: projects.map((p) => ({ params: { projectId: String(p.id) } })),
  fallback: false,
});
export const getStaticProps: GetStaticProps<{ project: Project }> = async ({
  params,
}) => {
  const project = projects.find((p) => String(p.id) === params?.projectId);
  return project ? { props: { project } } : { notFound: true };
};
export default function ProjectDetail({
  project,
}: InferGetStaticPropsType<typeof getStaticProps>) {
  return (
    <PageLayout title={project.title} description={project.summary}>
      <header className="page-heading">
        <Link className="back-link" href="/projects">
          Projects
        </Link>
        <h1>{project.title}</h1>
        <p className="lead">{project.summary}</p>
        {project.contribution && (
          <p className="project-contribution">{project.contribution}</p>
        )}
        <div className="project-stack">
          {project.stack.map((technology) => (
            <span key={technology}>{technology}</span>
          ))}
        </div>
        <div className="hero-actions">
          {project.demoAvailable && (
            <a
              className="button-primary"
              href={project.demoLink}
              target="_blank"
              rel="noopener noreferrer"
            >
              Open demo
            </a>
          )}
          {project.codeAvailable && (
            <a
              className="button-secondary"
              href={project.githubLink}
              target="_blank"
              rel="noopener noreferrer"
            >
              Source code
            </a>
          )}
        </div>
      </header>
      {project.cover && <ProjectCover project={project} expanded />}
      {project.image && (
        <div className="project-detail-image">
          <Image
            src={project.image}
            alt={project.imageAlt || project.title}
            width={project.imageWidth || 1360}
            height={project.imageHeight || 900}
            sizes="(max-width:1200px) 100vw, 1140px"
            priority
          />
        </div>
      )}
      <div className={`project-description${project.id === "home-security" ? ` ${styles.case}` : ""}`}>
        {project.caseStudy ? (
          <>
            <section className="project-scope">
              <h2>The problem</h2>
              {project.caseStudy.problem.split("\n\n").map((paragraph) => <p key={paragraph}>{paragraph}</p>)}
            </section>
            <section className="project-scope">
              <h2>My contribution</h2>
              <p>{project.caseStudy.contribution}</p>
            </section>
            {project.id === "home-security" && <HomeSecurityFlow />}
            <section className="project-scope">
              <h2>Architecture</h2>
              <div className="case-architecture">
                {project.caseStudy.architecture.map((part) => (
                  <div key={part.title}>
                    <h3>{part.title}</h3>
                    <p>{part.text}</p>
                  </div>
                ))}
              </div>
            </section>
            <section className="project-scope">
              <h2>Integration decisions</h2>
              {project.caseStudy.decisions.map((decision) => (
                <div className="case-decision" key={decision.title}>
                  <h3>{decision.title}</h3>
                  <p>{decision.text}</p>
                </div>
              ))}
            </section>
            <section className="project-scope">
              <h2>Evidence and current limits</h2>
              <p>{project.caseStudy.verification}</p>
              <ul>
                {project.caseStudy.limitations.map((item) => (
                  <li key={item}>{item}</li>
                ))}
              </ul>
            </section>
          </>
        ) : (
          <p>{project.description}</p>
        )}
        {project.scope && !project.caseStudy && (
          <section className="project-scope">
            <h2>What’s included</h2>
            <ul>
              {project.scope.map((item) => (
                <li key={item}>{item}</li>
              ))}
            </ul>
          </section>
        )}
        {project.evidence && (
          <section className="project-evidence">
            <h2>Inside the repository</h2>
            <div>
              {project.evidence.map((item) => (
                <a
                  key={item.path}
                  href={`${project.githubLink}/blob/main/${item.path}`}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <strong>{item.label}</strong>
                  <span>{item.path}</span>
                </a>
              ))}
            </div>
          </section>
        )}
      </div>
    </PageLayout>
  );
}
