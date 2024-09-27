import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { GitHubIcon } from "@/assets/icons/social";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { ChevronRight, Globe } from "lucide-react";
import { Typography } from "../ui/typography";

interface ProjectCardProps {
  id: number;
  title: string;
  description: string;
  githubLink: string;
  demoLink: string;
}

export const ProjectCard: React.FC<ProjectCardProps> = ({
  id,
  title,
  description,
  githubLink = "",
  demoLink = "",
}) => {
  return (
    <Card className="w-full flex flex-col justify-between">
      <CardHeader>
        <CardTitle className="flex justify-between items-center">
          <Typography
            variant="blockquote"
            className="tracking-wide text-xl mt-0"
          >
            {title}{" "}
          </Typography>
          <div className="flex justify-center items-center gap-2">
            <Button variant="ghost" size="icon">
              <Link href={githubLink}>
                <GitHubIcon />
              </Link>
            </Button>
            <Button variant="ghost" size="icon">
              <Link href={demoLink} target="_blank">
                <Globe />
              </Link>
            </Button>
          </div>
        </CardTitle>
        {/* <CardDescription>{description}</CardDescription> */}
      </CardHeader>
      <CardContent className="flex-grow">
        <Typography variant="small" className="mt-2 text-md">
          {description}
        </Typography>
      </CardContent>
      {/* <CardFooter className="flex justify-end">
        <Button variant="ghost" size="sm">
          <Link href={`/projects/${id}`}>
            <Typography
              variant={"muted"}
              className="flex justify-center items-center gap-2"
            >
              View Details <ChevronRight size={24} />
            </Typography>
          </Link>
        </Button>
      </CardFooter> */}
    </Card>
  );
};
