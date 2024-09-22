import { PageLayout } from "@/components/page-layout";
import { Button } from "@/components/ui/button";
import { NextPage } from "next/types";
import React from "react";
import { Typography } from "@/components/ui/typography";
import Link from "next/link";
import { GitFork, StarIcon } from "lucide-react";
import {
  DiscordIcon,
  GitHubIcon,
  TelegramIcon,
  XIcon,
} from "@/assets/icons/social";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

const HomePage: NextPage = () => {
  return (
    <PageLayout
      title="Homepage"
      description="Welcome to next-web-template"
      justify="start"
      align="center"
    >
      <div className="px-8 flex justify-center items-center gap-40 w-3/5">
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

      <div className="flex justify-center items-start gap-4 flex-grow w-3/5 px-8 py-20">
        <Card className="w-full">
          <CardHeader>
            <CardTitle className="tracking-wide">Smart contracts</CardTitle>
            <CardDescription>Deployed on mainnet</CardDescription>
          </CardHeader>
          <CardContent>
            <p>Card Content</p>
          </CardContent>
          <CardFooter>
            <Typography variant="muted" className="">
              <Link href="/contracts">View all deployments</Link>
            </Typography>
          </CardFooter>
        </Card>
        <Card className="w-full">
          <CardHeader>
            <CardTitle className="tracking-wide">Projects</CardTitle>
            <CardDescription>Deployed on mainnet</CardDescription>
          </CardHeader>
          <CardContent>
            <p>Card Content</p>
          </CardContent>
          <CardFooter>
            <Typography variant="muted" className="">
              <Link href="/projects">View all projects</Link>
            </Typography>
          </CardFooter>
        </Card>
        <Card className="w-full">
          <CardHeader>
            <CardTitle>Latest Commit</CardTitle>
            <CardDescription>Find me here</CardDescription>
          </CardHeader>
          <CardContent className="flex flex-col justify-center items-start">
            Repo Name
          </CardContent>
          <CardFooter>
            <Typography variant="muted" className="">
              <Link href="/projects">{"when"}</Link>
            </Typography>
          </CardFooter>
        </Card>
      </div>

      <div className="flex flex-col justify-center items-center gap-4 w-3/5 px-8 py-8">
        Cards with pinned repos from github
      </div>

      <div className="flex flex-col justify-center items-center gap-4 w-3/5 px-8 py-8">
        <Typography variant="h2">
          Looking for a dev or want to have chat?
        </Typography>
        <Button size="lg">Contact me</Button>
      </div>
    </PageLayout>
  );
};

export default HomePage;
