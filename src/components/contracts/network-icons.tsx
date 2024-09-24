import { networks } from "@/constants/contracts";
import AvatarCircles from "../magicui/avatar-circles";

interface NetworkIconsProps {
  display: string;
  numNetworks?: number;
}

export const NetworkIcons: React.FC<NetworkIconsProps> = ({
  display,
  numNetworks = 0,
}) => {
  const networkIcons = networks.map((network) => {
    return network.iconUrl;
  });

  if (display === "all") {
    return <AvatarCircles avatarUrls={networkIcons} numPeople={numNetworks} />;
  }

  const displayNumber = parseInt(display);
  if (!isNaN(displayNumber)) {
    return (
      <AvatarCircles
        avatarUrls={networkIcons.slice(0, displayNumber)}
        numPeople={networkIcons.length - displayNumber}
      />
    );
  }

  return <AvatarCircles avatarUrls={networkIcons} numPeople={28} />;
};
