import { NextPage } from "next";
import { PageLayout } from "@/components/page-layout";
import { Typography } from "@/components/ui/typography";
import { useRouter } from "next/router";
import Image from "next/image";
import { ProjectWrapper } from "@/components/projects/project-details";

const ProjectDetailPage: NextPage = () => {
  const router = useRouter();

  const { projectId } = router.query;

  return (
    <PageLayout
      title="Project Detail"
      description="This is the project detail page"
      flexDirection="col"
      justify="start"
      align="center"
      gap={12}
    >
      <ProjectWrapper>
        <Typography variant="h1" className="text-left">
          Project Detail
        </Typography>
        <Typography variant="h2" className="text-left">
          {projectId}
        </Typography>
        <Image
          src="/assets/images/placeholder.png"
          alt="Project Image"
          width={400}
          height={300}
        />
        <Typography variant="small" className="text-left">
          Lorem ipsum dolor sit amet consectetur adipisicing elit. Quisquam
          voluptates, quae, laboriosam, doloremque quod dolorum aperiam
          consequuntur quos tempora quidem voluptatum. Quisquam voluptates,
          quae, laboriosam, doloremque quod dolorum aperiam consequuntur quos
          tempora quidem voluptatum.
        </Typography>
      </ProjectWrapper>
    </PageLayout>
  );
};

export default ProjectDetailPage;
