import {
  base,
  polygonZkEvm,
  bsc,
  zora,
  mantle,
  metis,
  zkSync,
  canto,
  harmonyOne,
  optimism,
  arbitrum,
  polygon,
  celo,
  fantom,
  moonbeam,
  avalanche,
  moonriver,
  opBNB,
  scroll,
  arbitrumNova,
  fuse,
  meter,
  aurora,
  klaytn,
  manta,
  linea,
  coreDao,
  tenet,
  astar,
  kava,
  pgn,
  blast,
  gnosis,
  mode,
} from "wagmi/chains";

import deployments from "./deployed-contracts.json";

interface DeployedContract {
  name: string;
  address: string;
}

export interface Network {
  chainId: number;
  name: string;
  iconUrl: string;
  deployedContracts: DeployedContract[];
}

export const networks = [
  {
    ...arbitrum,
    iconUrl: "/chain-icons/arbitrum.svg",
  },
  {
    ...base,
    iconUrl: "/chain-icons/base.svg",
  },
  {
    ...optimism,
    iconUrl: "/chain-icons/optimism.svg",
  },
  {
    ...blast,
    iconUrl: "/chain-icons/blast.webp",
  },
  {
    ...scroll,
    iconUrl: "/chain-icons/scroll.svg",
  },
  {
    ...zkSync,
    iconUrl: "/chain-icons/zksync.svg",
  },
  {
    ...mantle,
    iconUrl: "/chain-icons/mantle.svg",
  },
  {
    ...linea,
    iconUrl: "/chain-icons/linea.svg",
  },
  {
    ...mode,
    iconUrl: "/chain-icons/mode.svg",
  },
  {
    ...manta,
    iconUrl: "/chain-icons/manta.svg",
  },
  {
    ...metis,
    iconUrl: "/chain-icons/metis.svg",
  },
  {
    ...polygon,
    iconUrl: "/chain-icons/polygon.svg",
  },
  {
    ...bsc,
    iconUrl: "/chain-icons/bsc.svg",
  },
  {
    ...zora,
    iconUrl: "/chain-icons/zora.svg",
  },
  {
    ...polygonZkEvm,
    iconUrl: "/chain-icons/polygon-zkevm.svg",
  },
  {
    ...opBNB,
    iconUrl: "/chain-icons/opbnb.svg",
  },
  {
    ...canto,
    iconUrl: "/chain-icons/canto.svg",
  },
  {
    ...harmonyOne,
    iconUrl: "/chain-icons/harmony.svg",
  },
  {
    ...celo,
    iconUrl: "/chain-icons/celo.svg",
  },
  {
    ...fantom,
    iconUrl: "/chain-icons/fantom.svg",
  },
  {
    ...avalanche,
    iconUrl: "/chain-icons/avalanche.svg",
  },
  {
    ...moonbeam,
    iconUrl: "/chain-icons/moonbeam.svg",
  },
  {
    ...moonriver,
    iconUrl: "/chain-icons/moonriver.svg",
  },
  {
    ...arbitrumNova,
    iconUrl: "/chain-icons/arb-nova.svg",
  },
  {
    ...fuse,
    iconUrl: "/chain-icons/fuse.svg",
  },
  {
    ...meter,
    iconUrl: "/chain-icons/meter.svg",
  },
  {
    ...aurora,
    iconUrl: "/chain-icons/aurora.svg",
  },
  {
    ...klaytn,
    iconUrl: "/chain-icons/klaytn.svg",
  },

  {
    ...coreDao,
    iconUrl: "/chain-icons/coredao.svg",
  },
  {
    ...tenet,
    iconUrl: "/chain-icons/tenet.svg",
  },
  {
    ...astar,
    iconUrl: "/chain-icons/astar.svg",
  },
  {
    ...kava,
    iconUrl: "/chain-icons/kava.svg",
  },
  {
    ...pgn,
    iconUrl: "/chain-icons/pgn.svg",
  },

  {
    ...gnosis,
    iconUrl: "/chain-icons/gnosis.svg",
  },
].map((network) => {
  const deployment = Object.entries(deployments).find(
    ([chainId, d]) => Number(chainId) === network.id
  )?.[1];
  return {
    ...network,
    deployedContracts: deployment?.deployedContracts || [],
  };
});
