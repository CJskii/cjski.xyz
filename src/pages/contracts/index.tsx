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

const ContractsPage: NextPage = () => {
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
      address: any;
      name: string;
    }[]
  ) => {
    return contracts.sort((a, b) => {
      if (a.name.includes("Mintly")) return -1;
      if (b.name.includes("Mintly")) return 1;
      if (a.name.includes("Etherway")) return -1;
      if (b.name.includes("Etherway")) return 1;
      return a.name.localeCompare(b.name);
    });
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
        `${networkData.explorerLink}/address/${contract.address}`
      ),
      iconUrl: networkData.iconUrl,
    }));
  });

  return (
    <PageLayout
      title="Mainnet deployments"
      description="This is an example page"
      flexDirection="col"
      justify="start"
      align="center"
      gap={12}
    >
      <Typography variant="h1" className="text-left">
        Mainnet deployments
      </Typography>

      <div className="container mx-auto py-10">
        <DataTable columns={columns} data={transformedData} />
      </div>
    </PageLayout>
  );
};

export default ContractsPage;
