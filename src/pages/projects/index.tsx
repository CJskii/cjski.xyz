import { PageLayout } from "@/components/page-layout";
import { Typography } from "@/components/ui/typography";
import { NextPage } from "next";
import { ProjectCard } from "@/components/projects/project-card";

interface Props {}

const projectsData = [
  {
    id: 1,
    title: "Project 1",
    description: "description of the project",
    githubLink: "",
    demoLink: "",
  },
  {
    id: 2,
    title: "Project 2",
    description: "description of the project",
    githubLink: "",
    demoLink: "",
  },
  {
    id: 3,
    title: "Project 3",
    description: "description of the project",
    githubLink: "",
    demoLink: "",
  },
];

const ProjectsPage: NextPage<Props> = ({}) => {
  return (
    <PageLayout
      title="Example Page"
      description="This is an example page"
      flexDirection="col"
      justify="start"
      align="center"
      gap={12}
    >
      <Typography variant="h1" className="text-left">
        Projects
      </Typography>
      <div className="grid w-3/5 p-4 gap-8 py-20">
        {projectsData.map((project, index) => (
          <ProjectCard key={index} {...project} />
        ))}
      </div>
    </PageLayout>
  );
};

export default ProjectsPage;
