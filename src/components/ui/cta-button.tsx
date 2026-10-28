import Link from "next/link";
import { Typography } from "./typography";
import { PulsatingButton } from "../magicui/pulsating-button";
import { Button } from "./button";

export const CtaButton: React.FC = () => {
  return (
    <Link
      href="https://cal.com/cjski"
      target="_blank"
      rel="noopener noreferrer"
    >
      <PulsatingButton className="mt-4 px-6 py-3 rounded-lg">
        <Typography variant="small" className="font-medium">
          📅 Book a call
        </Typography>
      </PulsatingButton>
    </Link>
  );
};

export const CtaButtonNavbar: React.FC = () => {
  return (
    <Link
      href="https://cal.com/cjski"
      target="_blank"
      rel="noopener noreferrer"
    >
      <Button className="bg-gradient" size={"icon"}>
        <Typography variant="small" className="font-medium">
          📅
        </Typography>
      </Button>
    </Link>
  );
};
