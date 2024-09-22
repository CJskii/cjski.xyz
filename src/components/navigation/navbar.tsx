// import logoDark from "@/assets/dark-logo.svg";
// import logoLight from "@/assets/light-logo.svg";
// import logo from "@/assets/logo-symbol.svg";
import Image from "next/image";
import Link from "next/link";
import { ThemeToggler } from "../ui/theme-toggler";
import { Button } from "../ui/button";
import { HeaderSheet } from "./header-sheet";
import { ConnectWalletButton } from "@/components/ui/connect-button";
import {
  NavigationMenu,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
  navigationMenuTriggerStyle,
} from "@/components/ui/navigation-menu";
import { Typography } from "../ui/typography";
import React from "react";

interface NavLink {
  label: string;
  href: string;
}

const linkData: NavLink[] = [
  {
    label: "Projects",
    href: "/projects",
  },
  {
    label: "About Me",
    href: "/about",
  },
  {
    label: "Contact",
    href: "/contact",
  },
];

export const Navbar: React.FC = () => {
  return (
    <div className="fixed z-50 flex w-full justify-between items-center border-b border-neutral-400/50 bg-white/50 p-4 backdrop-blur-xl dark:bg-black/50 md:px-16 md:py-4">
      <div className="flex-1 hidden md:block">
        <Link href="/" className="flex items-center justify-start">
          {/* 
          @
          @@
          @@@
          @@@@ Replace Typography component with theme aware Image components  
          @@@
          @@
          @
          */}
          {/* <Image
            src={logoDark}
            alt="dark mode logo"
            className="block w-40 dark:hidden"
          />
          <Image
            src={logoLight}
            alt="light mode logo"
            className="hidden w-40 dark:block"
          /> */}
          <Typography variant="h4" className="font-bold tracking-widest">
            cjski.xyz
          </Typography>
        </Link>
      </div>
      <Link href={"/"} className="md:hidden">
        {/* 
          @
          @@
          @@@
          @@@@ Replace Typography component with theme aware Image component for mobile view  
          @@@
          @@
          @
          */}
        {/* <Image
          src={logo}
          alt="mobile logo icon"
          className="block md:hidden"
          width={30}
          height={30}
        /> */}
        <Typography variant="h4" className="font-bold">
          cjski.xyz
        </Typography>
      </Link>
      <div className="flex-1 justify-center hidden items-center gap-3 lg:flex">
        <NaviLinks />
      </div>

      <div className="flex-1  justify-end items-center gap-3 hidden  lg:flex">
        <ThemeToggler />
        <ConnectWalletButton />
      </div>

      <div className="block lg:hidden">
        <HeaderSheet />
      </div>
    </div>
  );
};

export const NaviLinks: React.FC = () => {
  return (
    <NavigationMenu>
      <NavigationMenuList>
        {linkData.map((navLink, index) => (
          <NavigationMenuItem key={index}>
            <Link href={navLink.href} legacyBehavior passHref>
              <NavigationMenuLink className={navigationMenuTriggerStyle()}>
                {navLink.label}
              </NavigationMenuLink>
            </Link>
          </NavigationMenuItem>
        ))}
      </NavigationMenuList>
    </NavigationMenu>
  );
};

export const MobileNavLinks: React.FC = () => {
  return (
    <>
      {linkData.map((navLink, index) => (
        <React.Fragment key={index}>
          <Link href={navLink.href} passHref>
            <Button className="w-full">{navLink.label}</Button>
          </Link>
        </React.Fragment>
      ))}
    </>
  );
};
