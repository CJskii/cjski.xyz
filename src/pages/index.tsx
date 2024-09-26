import { PageLayout } from "@/components/page-layout";
import { Button } from "@/components/ui/button";
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
import { PulsatingButton } from "@/components/magicui/pulsating-button";
import Link from "next/link";

// TODO: Add crypto price ticker
// TODO: Add downloadable resume
// TODO: Add about me page
// TODO: Add projects section

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
          Let's work together or just have a chat! 🚀
        </Typography>
        <Typography
          variant="lead"
          className="text-center text-muted-foreground max-w-2xl text-lg"
        >
          Whether you have a project idea, need a developer for your team, or
          simply want to talk about tech and Web3, I'm here to connect.
        </Typography>
        <Typography
          variant="lead"
          className="text-center text-muted-foreground text-lg"
        >
          Let's make something great together! 💲 💰
        </Typography>

        <Link href="https://cal.com/cjski" target="_blank">
          <PulsatingButton className="mt-4 px-6 py-3 rounded-lg">
            <Typography variant="small" className="font-medium">
              📅 Book a call
            </Typography>
          </PulsatingButton>
        </Link>
      </div>
    </PageLayout>
  );
};

export default HomePage;
