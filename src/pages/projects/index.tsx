import { PageLayout } from "@/components/page-layout";
import { Typography } from "@/components/ui/typography";
import { NextPage } from "next";
import { ProjectCard } from "@/components/projects/project-card";
import projectsData from "@/constants/project-data.json";

interface Props {}

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
      <Typography variant="h1" className="text-center">
        Projects
      </Typography>
      <Typography variant="muted" className="text-center text-lg mt-8">
        Here are some of the projects I have worked on.<br></br> Click on the
        link icons to see the code or the live demo.
      </Typography>
      <div className="grid md:grid-cols-2  p-4 gap-8 py-20">
        {projectsData.map((project, index) => (
          <ProjectCard key={index} {...project} />
        ))}
      </div>
    </PageLayout>
  );
};

export default ProjectsPage;
