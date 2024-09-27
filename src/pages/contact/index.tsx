import { PageLayout } from "@/components/page-layout";
import { Typography } from "@/components/ui/typography";
import { NextPage } from "next";
import { CardWrapper } from "@/components/card";
import { Mail } from "lucide-react";

import { XIcon, FarcasterIcon, TelegramIcon } from "@/assets/icons/social";

interface Props {}

const ContactPage: NextPage<Props> = () => {
  return (
    <PageLayout
      title="Get in Touch"
      description="Let's connect! Here are some ways you can reach out to me."
      flexDirection="col"
      justify="start"
      align="center"
      gap={12}
    >
      <Typography variant="h1" className="text-center">
        Let's Connect
      </Typography>

      <Typography variant="muted" className="text-center mt-8 text-lg">
        Whether you have a question, want to collaborate, or just chat about
        Web3, here&rsquo;s how you can reach me:
      </Typography>

      <div className="grid md:grid-cols-2 gap-8 py-20 w-full px-8">
        <CardWrapper
          title="Email"
          description="Reach out to me via email."
          href="mailto:devcj@pm.me"
          footerText="Send an Email"
          footer={true}
          icon={<Mail />}
        >
          <Typography variant="small" className="font-bold tracking-wider">
            devcj@pm.me
          </Typography>
        </CardWrapper>

        <CardWrapper
          title="Telegram"
          description="Connect with me on Telegram."
          href="https://t.me/cj2077"
          footerText="Open Telegram"
          footer={true}
          icon={<TelegramIcon />}
        >
          <Typography variant="small" className="font-bold tracking-wider">
            @cj2077
          </Typography>
        </CardWrapper>

        <CardWrapper
          title="X / Twitter"
          description="Follow and message me on X/Twitter."
          href="https://twitter.com/cjski_web3"
          footerText="Visit Profile"
          footer={true}
          icon={<XIcon />}
        >
          <Typography variant="small" className="font-bold tracking-wider">
            @cjski_web3
          </Typography>
        </CardWrapper>

        <CardWrapper
          title="Farcaster"
          description="Connect with me on Farcaster."
          href="https://warpcast.com/cjski"
          footerText="Visit Farcaster"
          footer={true}
          icon={<FarcasterIcon />}
        >
          <Typography variant="small" className="font-bold tracking-wider">
            @cjski
          </Typography>
        </CardWrapper>
      </div>
    </PageLayout>
  );
};

export default ContactPage;
