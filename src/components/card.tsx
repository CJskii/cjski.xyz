import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

import { Typography } from "./ui/typography";
import Link from "next/link";

import { formatDistanceToNow, parseISO } from "date-fns";

interface CardWrapperProps {
  children: React.ReactNode;
  title: string;
  description: string;
  href?: string;
  footerText: string;
  footer: boolean;
  icon?: React.ReactNode;
}

export const CardWrapper: React.FC<CardWrapperProps> = ({
  children,
  title,
  description,
  href,
  footerText,
  footer,
  icon,
}) => {
  const isExternalLink =
    href?.startsWith("http://") || href?.startsWith("https://");

  return (
    <Card className="w-full flex flex-col justify-between">
      <CardHeader className="flex-row justify-between m-0">
        <div>
          <CardTitle className="tracking-wide flex justify-between items-start">
            {title}
          </CardTitle>
          <CardDescription>{description}</CardDescription>
        </div>
        <span>{icon}</span>
      </CardHeader>
      <CardContent className="flex-grow">{children}</CardContent>
      {footer && (
        <CardFooter>
          {href ? (
            <Typography variant="muted" className="hover:underline">
              {isExternalLink ? (
                <Link href={href} target="_blank" rel="noopener noreferrer">
                  {footerText}
                </Link>
              ) : (
                <Link href={href}>{footerText}</Link>
              )}
            </Typography>
          ) : (
            <Typography variant="muted" className="">
              {footerText}
            </Typography>
          )}
        </CardFooter>
      )}
    </Card>
  );
};

interface GithubRepoCardProps {
  name: string;
  description: string;
  url: string;
  lastCommitDate: string;
  primaryLanguage: string;
  primaryLanguageColor: string;
}

export const GithubRepoCard: React.FC<GithubRepoCardProps> = ({
  name,
  description,
  url,
  lastCommitDate,
  primaryLanguage,
  primaryLanguageColor,
}) => {
  return (
    <Card className="w-full flex flex-col justify-between p-2 rounded-md hover:shadow-md transition-shadow">
      <CardHeader className="flex-row justify-between">
        <Link
          href={url}
          passHref
          target="_blank"
          rel="noopener noreferrer"
          className="hover:underline"
        >
          <CardTitle className="tracking-wide ">{name}</CardTitle>
        </Link>
      </CardHeader>
      <CardContent className="flex-grow">
        <Typography variant="muted" className="text-xs">
          {description || "No description provided."}
        </Typography>
      </CardContent>
      <CardFooter className="flex justify-start items-center gap-4">
        <div className="flex items-center">
          <span
            className="w-3 h-3 rounded-full mr-2"
            style={{ backgroundColor: primaryLanguageColor }}
          ></span>
          <Typography variant="extraSmall" className="text-muted-foreground">
            {primaryLanguage}
          </Typography>
        </div>
        <Typography variant="extraSmall" className="text-muted-foreground">
          {`Updated ${formatDistanceToNow(parseISO(lastCommitDate), {
            addSuffix: true,
          })}`}
        </Typography>
      </CardFooter>
    </Card>
  );
};
