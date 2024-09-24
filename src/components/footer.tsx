import Link from "next/link";
import {
  FarcasterIcon,
  GitHubIcon,
  TelegramIcon,
  XIcon,
} from "@/assets/icons/social";
import { Button } from "./ui/button";

interface FooterData {
  label: string;
  href: string;
  children?: React.ReactNode;
}

const socialLinks: FooterData[] = [
  {
    label: "Warpcast",
    href: "https://warpcast.com/cjski",
    children: <FarcasterIcon />,
  },
  {
    label: "Twitter/X",
    href: "https://twitter.com/cjski_web3",
    children: <XIcon />,
  },
  {
    label: "GitHub",
    href: "https://github.com/CJskii",
    children: <GitHubIcon />,
  },
  {
    label: "Telegram",
    href: "https://t.me/cj2077",
    children: <TelegramIcon />,
  },
];

export const Footer: React.FC = () => {
  return (
    <FooterContainer>
      <FooterContent />
    </FooterContainer>
  );
};

const FooterContent: React.FC = () => {
  return (
    <div className="flex flex-col md:flex-row justify-center items-center gap-4 w-full p-4">
      <div className="flex flex-row gap-8">
        {socialLinks.map((social, index) => (
          <FooterIconLink key={index} href={social.href} label={social.label}>
            {social.children}
          </FooterIconLink>
        ))}
      </div>
    </div>
  );
};

const FooterLink: React.FC<FooterData> = ({ href, children }) => {
  return (
    <Link
      href={href}
      className="text-sm text-muted-foreground hover:text-muted-foreground/60 transition"
    >
      {children}
    </Link>
  );
};

const FooterIconLink: React.FC<FooterData> = ({ href, label, children }) => {
  return (
    <Button variant={"ghost"} size={"icon"}>
      <Link
        href={href}
        target="_blank"
        rel="noopener noreferrer"
        aria-label={label}
        className="text-muted-foreground"
      >
        {children}
      </Link>
    </Button>
  );
};

const FooterContainer: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  return (
    <footer className="bg-white/50 dark:bg-black/50 rounded-t-xl px-6 pb-10 pt-12 md:p-16 md:py-8 flex flex-col lg:flex-row items-start justify-between gap-4">
      {children}
    </footer>
  );
};
