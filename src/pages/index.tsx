import { PageLayout } from "@/components/page-layout";
import { NextPage } from "next/types";
import React from "react";
import { Typography } from "@/components/ui/typography";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  DeployedContractsCard,
  LatestCommitCard,
  TransactionCard,
} from "@/components/landing-page/index";
import { FeaturedRepos } from "@/components/landing-page/featured-repos";
import { CtaButton } from "@/components/ui/cta-button";

const HomePage: NextPage = () => {
  return (
    <PageLayout
      title="Welcome to My Portfolio"
      description="I'm a full-stack developer passionate about Web3 and building user-centric applications. Explore my projects, deployments, and get in touch!"
      justify="start"
      align="center"
    >
      <div className="px-8 flex flex-col-reverse lg:flex-row justify-center items-center gap-16">
        <div>
          <Typography variant="h2" className="text-left">
            Hey, what's up? 👋
          </Typography>
          <Typography
            variant="lead"
            className="text-left text-foreground pt-4 text-md"
          >
            I&rsquo;m Cezary, a full stack developer currently based in the UK.
            I love building user-centric apps and turning cool ideas into
            reality.
          </Typography>

          <Typography
            variant="lead"
            className="text-left text-foreground pt-4 text-md"
          >
            I&rsquo;m a quick learner who&rsquo;s always up for a new challenge.
            Whether you&rsquo;re looking to create the next big thing or want to
            launch a fun degen project, I&rsquo;m here to help you make it
            happen.
          </Typography>
        </div>

        <Avatar className="w-64 h-64">
          <AvatarImage src="/static/avatar.png" />
          <AvatarFallback>CN</AvatarFallback>
        </Avatar>
      </div>

      <div className="grid md:grid-cols-2 xl:grid-cols-3 gap-4 flex-grow px-8 py-20 w-full">
        <DeployedContractsCard />
        <TransactionCard />
        <LatestCommitCard />
      </div>

      <div className="grid md:grid-cols-2 gap-4 flex-grow px-8 py-20 w-full">
        <Typography
          variant="h2"
          className="text-center col-span-2 border-0 mb-4"
        >
          Featured Repositories
        </Typography>
        <FeaturedRepos />
      </div>

      <div className="flex flex-col justify-center items-center gap-6 p-8 bg-card rounded-lg">
        <Typography variant="h2" className="text-center">
          Ready to build something cool? 🚀
        </Typography>
        <Typography
          variant="lead"
          className="text-center text-muted-foreground max-w-2xl text-lg"
        >
          Got an idea, need a dev on your team, or just wanna chat about Web3
          and tech? I&rsquo;m down to connect.
        </Typography>
        <Typography
          variant="lead"
          className="text-center text-muted-foreground text-lg"
        >
          Let&rsquo;s create something awesome together! 💲💰
        </Typography>

        <CtaButton />
      </div>
    </PageLayout>
  );
};

export default HomePage;
