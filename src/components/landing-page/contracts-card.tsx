import { useState, useEffect } from "react";
import { CardWrapper } from "../card";
import { NetworkIcons } from "../contracts/network-icons";
import { EthereumIcon } from "@/assets/icons/social";

export const DeployedContractsCard: React.FC = () => {
  return (
    <CardWrapper
      title="Smart contracts"
      description="Deployed on mainnet"
      footerText="View all deployments"
      href="/contracts"
      footer={true}
      icon={<EthereumIcon />}
    >
      <NetworkIcons display="10" />
    </CardWrapper>
  );
};
