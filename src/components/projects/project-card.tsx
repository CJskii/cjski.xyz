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
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="tracking-wide flex justify-between items-center">
          {title}{" "}
          <div className="flex justify-center items-center gap-2">
            <Button variant="ghost" size="icon">
              <Link href={githubLink}>
                <GitHubIcon />
              </Link>
            </Button>
            <Button variant="ghost" size="icon">
              <Link href={demoLink}>
                <Globe />
              </Link>
            </Button>
          </div>
        </CardTitle>
        <CardDescription>{description}</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="flex flex-col justify-center items-center">
          Lorem, ipsum dolor sit amet consectetur adipisicing elit. Iure neque
          magnam autem minus veniam excepturi deserunt omnis. Soluta aspernatur
          sed quisquam iure cupiditate repudiandae officiis error ab corrupti!
          Fuga, corporis?
        </div>
      </CardContent>
      <CardFooter className="flex justify-end">
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
      </CardFooter>
    </Card>
  );
};
