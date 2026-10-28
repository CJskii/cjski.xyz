import { useState } from "react";
import { PageLayout } from "@/components/page-layout";
import { portfolioProjects } from "@/lib/projects";
import { PortfolioProject } from "@/components/projects/portfolio-project";
const categories = [
  "All",
  ...new Set(portfolioProjects.map((project) => project.category)),
];
export default function Projects() {
  const [category, setCategory] = useState("All");
  const [sort, setSort] = useState("featured");
  const visibleProjects = portfolioProjects.filter(
    (project) => category === "All" || project.category === category,
  );
  if (sort !== "featured")
    visibleProjects.sort((a, b) => {
      const difference =
        Date.parse(a.repositoryCreatedAt!) - Date.parse(b.repositoryCreatedAt!);
      return sort === "newest" ? -difference : difference;
    });
  const sections =
    category === "All" && sort === "featured"
      ? [
          {
            id: "featured-work",
            title: "Featured work",
            projects: visibleProjects.filter(
              (project) => project.area === "featured",
            ),
          },
          {
            id: "earlier-projects",
            title: "Earlier projects",
            projects: visibleProjects.filter(
              (project) => project.area === "earlier",
            ),
          },
        ]
      : [{ id: "filtered-projects", title: null, projects: visibleProjects }];
  return (
    <PageLayout
      title="Projects"
      description="Selected applications and integrations by CJSKI."
    >
      <header className="page-heading">
        <h1>Projects.</h1>
        <p className="lead">
          Applications, developer tools and self-hosted systems.
        </p>
      </header>
      <section className="projects-section">
        <div className="project-toolbar">
          <div className="filters" role="group" aria-label="Project categories">
            {categories.map((name) => (
              <button
                key={name}
                type="button"
                aria-pressed={category === name}
                onClick={() => setCategory(name)}
              >
                {name}
              </button>
            ))}
          </div>
          <label className="project-sort">
            <span>Sort by</span>
            <select
              value={sort}
              onChange={(event) => setSort(event.target.value)}
            >
              <option value="featured">Featured</option>
              <option value="newest">Newest first</option>
              <option value="oldest">Oldest first</option>
            </select>
          </label>
        </div>
        <div className="project-index-meta">
          <p role="status">
            {visibleProjects.length}{" "}
            {visibleProjects.length === 1 ? "project" : "projects"}
          </p>
          <p>Dates reflect repository creation.</p>
        </div>
        {sections.map((section) => (
          <div className="portfolio-group" key={section.id}>
            {section.title && (
              <h2 className="portfolio-group-heading" id={section.id}>
                {section.title}
              </h2>
            )}
            <div className="project-grid portfolio-card-grid">
              {section.projects.map((project) => (
                <PortfolioProject
                  key={project.id}
                  project={project}
                  heading={section.title ? "h3" : "h2"}
                  showLink
                />
              ))}
            </div>
          </div>
        ))}
      </section>
    </PageLayout>
  );
}
