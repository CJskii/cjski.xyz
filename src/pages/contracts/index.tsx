import { NextPage } from "next";
import { PageLayout } from "@/components/page-layout";
import { Typography } from "@/components/ui/typography";

import deploymentsData from "@/constants/deployed-contracts.json";
import { networks } from "@/constants/contracts";

import { Contract, columns } from "@/components/contracts/columns";
import { DataTable } from "@/components/contracts/data-table";

interface DeploymentData {
  [key: string]: {
    networkName: string;
    deployedContracts: {
      name: string;
      address: string;
    }[];
  };
}

const data: DeploymentData = deploymentsData;

const getNetworkData = (chainId: string) => {
  const network = networks.find((network) => network.id === Number(chainId));
  return {
    explorerLink: network ? network.blockExplorers.default.url : "",
    iconUrl: network ? network.iconUrl : "",
    networkName: network ? network.name : "",
  };
};

const sortContracts = (
  contracts: {
    address: string;
    name: string;
  }[],
) => {
  const rank = (name: string) =>
    name.includes("Mintly") ? 0 : name.includes("Etherway") ? 1 : 2;
  return [...contracts].sort(
    (a, b) => rank(a.name) - rank(b.name) || a.name.localeCompare(b.name),
  );
};

const sanitizeUrl = (url: string) => {
  return url.replace(/([^:]\/)\/+/g, "$1");
};

const transformedData: Contract[] = Object.keys(data).flatMap((key) => {
  const { deployedContracts } = data[key];
  const networkData = getNetworkData(key);

  const sortedContracts = sortContracts(deployedContracts);

  return sortedContracts.map((contract, index) => ({
    id: contract.address,
    chainId: key,
    contractNumber: index + 1,
    contractName: contract.name,
    address: contract.address,
    chain: networkData.networkName,
    explorerUrl: sanitizeUrl(
      `${networkData.explorerLink}/address/${contract.address}`,
    ),
    iconUrl: networkData.iconUrl,
  }));
});

const ContractsPage: NextPage = () => {
  return (
    <PageLayout
      title="Contract deployments"
      description="Smart contract deployments and network explorer links."
      flexDirection="col"
      justify="start"
      align="center"
      gap={12}
    >
      <Typography variant="h1" className="text-left">
        Contract deployments
      </Typography>

      <Typography
        variant="paragraph"
        className="text-left text-muted-foreground text-lg"
      >
        Contract records: {transformedData.length}
      </Typography>

      <Typography variant="muted" className="text-left text-md">
        Explorer references across {networks.length} networks.
      </Typography>

      <Typography variant="muted" className="text-left text-sm">
        Explorer links are provided for reference.
      </Typography>

      <div className="contracts-table py-10">
        <DataTable columns={columns} data={transformedData} />
      </div>
    </PageLayout>
  );
};

export default ContractsPage;
