import { PageLayout } from "@/components/page-layout";
import { Button } from "@/components/ui/button";
import { NextPage } from "next/types";
import React from "react";
import { Typography } from "@/components/ui/typography";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  DeployedContractsCard,
  LatestCommitCard,
  ProjectsCard,
} from "@/components/landing-page/cards";

const HomePage: NextPage = () => {
  return (
    <PageLayout
      title="Homepage"
      description="Welcome to next-web-template"
      justify="start"
      align="center"
    >
      <div className="px-8 flex flex-col-reverse lg:flex-row justify-center items-center gap-16">
        <div>
          <Typography variant="h2" className="text-left">
            Hey there! 👋
          </Typography>
          <Typography variant="lead" className="text-left text-foreground mt-4">
            I am Cezary, a full stack developer and a tech enthusiast, I enjoy
            working on user center applications and building cool stuff.
          </Typography>
          <Typography variant="lead" className="text-left text-foreground pt-4">
            I am Cezary, a full stack developer and a tech enthusiast, I enjoy
            working on user centring applications and building cool stuff.
          </Typography>
        </div>

        <Avatar className="w-64 h-64">
          <AvatarImage src="https://github.com/shadcn.png" />
          <AvatarFallback>CN</AvatarFallback>
        </Avatar>
      </div>

      <div className="grid md:grid-cols-2 xl:grid-cols-3 gap-4 flex-grow px-8 py-20 w-full">
        <DeployedContractsCard />
        <ProjectsCard />
        <LatestCommitCard />
      </div>

      <div className="flex flex-col justify-center items-center gap-4 p-8">
        Cards with pinned repos from github
      </div>

      <div className="flex flex-col justify-center items-center gap-4 p-8">
        <Typography variant="h2" className="text-center">
          Looking for a dev or want to have chat?
        </Typography>
        <Button size="lg">Contact me</Button>
      </div>
    </PageLayout>
  );
};

export default HomePage;
