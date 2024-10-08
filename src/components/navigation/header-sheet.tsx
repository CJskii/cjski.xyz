import Image from "next/image";
// import logoBlack from "@/../assets/logo-black.svg";
// import logoWhite from "@/../assets/logo-white.svg";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { MenuIcon } from "lucide-react";
import { MobileNavLinks } from "./navbar";
import { ThemeToggler } from "../ui/theme-toggler";
import { useState } from "react";
import { ConnectWalletButton } from "../ui/connect-button";
import { Typography } from "../ui/typography";
import { VisuallyHidden } from "@radix-ui/react-visually-hidden";
import { CtaButton, CtaButtonNavbar } from "../ui/cta-button";

export const HeaderSheet: React.FC = () => {
  const [isNavbarOpen, setIsNavbarOpen] = useState(false);

  return (
    <Sheet
      open={isNavbarOpen}
      onOpenChange={() => setIsNavbarOpen(!isNavbarOpen)}
    >
      <SheetTrigger asChild className="z-[500]">
        <MenuIcon className="rotate-90" />
      </SheetTrigger>
      <SheetContent className=" border-neutral-600">
        <VisuallyHidden>
          <SheetTitle>Mobile Menu</SheetTitle>
          <SheetDescription>
            Navigate through the application using the mobile menu options.
          </SheetDescription>
        </VisuallyHidden>

        <div className="mb-6">
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
            src={logoBlack}
            alt="mobile logo dark"
            className="block w-40 dark:hidden"
          />
          <Image
            src={logoWhite}
            alt="mobile logo light"
            className="hidden w-40 dark:block"
          /> */}
          <Typography variant="h3" className="font-bold">
            Mobile Menu
          </Typography>
        </div>
        <div className="flex flex-col items-stretch gap-2">
          {/* <ConnectWalletButton /> */}

          <MobileNavLinks />
        </div>
        <div className=" absolute bottom-4 left-4 flex justify-center items-center gap-4">
          <ThemeToggler />
          <CtaButtonNavbar />
        </div>
      </SheetContent>
    </Sheet>
  );
};
