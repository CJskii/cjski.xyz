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
  return (
    <Card className="w-full flex flex-col justify-between">
      <CardHeader className="flex-row justify-between">
        <div>
          <CardTitle className="tracking-wide flex justify-between items-start">
            {title}
          </CardTitle>
          <CardDescription>{description}</CardDescription>
        </div>

        {icon}
      </CardHeader>
      <CardContent className="flex-grow">{children}</CardContent>
      {footer && (
        <CardFooter>
          {href ? (
            <Typography variant="muted" className="hover:underline">
              <Link href={href}>{footerText}</Link>
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
