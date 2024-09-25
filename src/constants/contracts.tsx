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
    iconUrl: "/static/chain-icons/arbitrum.svg",
  },
  {
    ...base,
    iconUrl: "/static/chain-icons/base.svg",
  },
  {
    ...optimism,
    iconUrl: "/static/chain-icons/optimism.svg",
  },
  {
    ...blast,
    iconUrl: "/static/chain-icons/blast.webp",
  },
  {
    ...scroll,
    iconUrl: "/static/chain-icons/scroll.svg",
  },
  {
    ...zkSync,
    iconUrl: "/static/chain-icons/zksync.svg",
  },
  {
    ...mantle,
    iconUrl: "/static/chain-icons/mantle.svg",
  },
  {
    ...linea,
    iconUrl: "/static/chain-icons/linea.svg",
  },
  {
    ...mode,
    iconUrl: "/static/chain-icons/mode.svg",
  },
  {
    ...manta,
    iconUrl: "/static/chain-icons/manta.svg",
  },
  {
    ...metis,
    iconUrl: "/static/chain-icons/metis.svg",
  },
  {
    ...polygon,
    iconUrl: "/static/chain-icons/polygon.svg",
  },
  {
    ...bsc,
    iconUrl: "/static/chain-icons/bsc.svg",
  },
  {
    ...zora,
    iconUrl: "/static/chain-icons/zora.svg",
  },
  {
    ...polygonZkEvm,
    iconUrl: "/static/chain-icons/polygon-zkevm.svg",
  },
  {
    ...opBNB,
    iconUrl: "/static/chain-icons/opbnb.svg",
  },
  {
    ...canto,
    iconUrl: "/static/chain-icons/canto.svg",
  },
  {
    ...harmonyOne,
    iconUrl: "/static/chain-icons/harmony.svg",
  },
  {
    ...celo,
    iconUrl: "/static/chain-icons/celo.svg",
  },
  {
    ...fantom,
    iconUrl: "/static/chain-icons/fantom.svg",
  },
  {
    ...avalanche,
    iconUrl: "/static/chain-icons/avalanche.svg",
  },
  {
    ...moonbeam,
    iconUrl: "/static/chain-icons/moonbeam.svg",
  },
  {
    ...moonriver,
    iconUrl: "/static/chain-icons/moonriver.svg",
  },
  {
    ...arbitrumNova,
    iconUrl: "/static/chain-icons/arb-nova.svg",
  },
  {
    ...fuse,
    iconUrl: "/static/chain-icons/fuse.svg",
  },
  {
    ...meter,
    iconUrl: "/static/chain-icons/meter.svg",
  },
  {
    ...aurora,
    iconUrl: "/static/chain-icons/aurora.svg",
  },
  {
    ...klaytn,
    iconUrl: "/static/chain-icons/klaytn.svg",
  },

  {
    ...coreDao,
    iconUrl: "/static/chain-icons/coredao.svg",
  },
  {
    ...tenet,
    iconUrl: "/static/chain-icons/tenet.svg",
  },
  {
    ...astar,
    iconUrl: "/static/chain-icons/astar.svg",
  },
  {
    ...kava,
    iconUrl: "/static/chain-icons/kava.svg",
  },
  {
    ...pgn,
    iconUrl: "/static/chain-icons/pgn.svg",
  },

  {
    ...gnosis,
    iconUrl: "/static/chain-icons/gnosis.svg",
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
