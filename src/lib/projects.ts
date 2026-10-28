import records from "@/constants/project-data.json";
import featured from "../../content/featured-projects.json";
import repositoryDates from "../../content/project-dates.json";
import register from "../../content/project-register.json";
import etherwayCase from "../../content/etherway-case-study.json";
const details: Record<
  number,
  {
    summary: string;
    category: string;
    stack: string[];
    image?: string;
    imageAlt?: string;
    imageWidth?: number;
    imageHeight?: number;
  }
> = {
  1: {
    summary:
      "Cross-chain transfers, token swaps and gas refuelling in one application.",
    category: "Applications",
    stack: [],
  },
  2: {
    summary:
      "An application for minting tokens and NFTs across multiple networks.",
    category: "Applications",
    stack: [],
  },
  3: {
    summary: "An airdrop discovery platform with staking and reward features.",
    category: "Applications",
    stack: [],
  },
  4: {
    summary:
      "A Next.js starter with wallet authentication, UI components and theme support.",
    category: "Developer tools",
    stack: ["Next.js", "TypeScript", "Tailwind CSS"],
  },
  5: {
    summary:
      "A Next.js API serving NFT metadata and media references from IPFS.",
    category: "Developer tools",
    stack: ["Next.js", "IPFS"],
  },
  6: {
    summary:
      "Search Ethereum and Polygon addresses, transactions and wallet activity.",
    category: "Applications",
    stack: ["Next.js", "TypeScript"],
  },
  7: {
    summary: "A reporting interface for bug bounties and security researchers.",
    category: "Applications",
    stack: ["Next.js", "TypeScript", "Tailwind CSS"],
  },
  8: {
    summary: "A photo-tagging game with a character search and leaderboard.",
    category: "Applications",
    stack: ["React", "TypeScript", "Firebase"],
    image: "/projects/photo-tagging.png",
    imageAlt:
      "The photo-tagging game’s home screen with illustrated characters and a start button.",
  },
  9: {
    summary: "A shopping interface with product filtering and a dynamic cart.",
    category: "Applications",
    stack: ["React", "Tailwind CSS"],
    image: "/projects/react-storefront.png",
    imageAlt:
      "The shopping application’s homepage with navigation, an introduction and a graphics-card image.",
  },
  10: {
    summary: "A memory game with shuffled cards and score tracking.",
    category: "Applications",
    stack: ["React", "Tailwind CSS"],
  },
  11: {
    summary:
      "A CV builder with editable sections, live preview and PDF export.",
    category: "Applications",
    stack: ["React"],
  },
  13: {
    summary: "A browser-based Battleship game built with JavaScript.",
    category: "Applications",
    stack: ["JavaScript", "HTML", "CSS"],
  },
};
export interface Project {
  area?: string;
  status?: string;
  contribution?: string;
  caseStudy?: typeof etherwayCase;
  repositoryCreatedAt?: string;
  id: number | string;
  title: string;
  summary: string;
  description: string;
  category: string;
  stack: string[];
  githubLink: string;
  demoLink: string;
  codeAvailable: boolean;
  demoAvailable: boolean;
  image?: string;
  imageAlt?: string;
  imageWidth?: number;
  imageHeight?: number;
  cover?: string;
  sourceFile?: string;
  sourceExcerpt?: string;
  scope?: string[];
  evidence?: { label: string; path: string }[];
}
const existingProjects: Project[] = records.map((project) => ({
  ...project,
  ...details[project.id],
  codeAvailable: project.id !== 7,
  demoAvailable: project.id !== 1,
}));
const showcaseOverrides: Record<number, Partial<Project>> = {
  4: {
    title: "Next Web3 Template",
    summary:
      "A Next.js scaffold with wallet sign-in, reusable UI components and theme support.",
    description:
      "A reusable Next.js template combining RainbowKit and Wagmi wallet connections, SIWE authentication through NextAuth, and a shadcn/Tailwind interface with light and dark themes.",
    stack: ["Next.js", "RainbowKit", "SIWE", "Tailwind CSS"],
    image: "/projects/next-web3-template-card.svg",
    imageAlt:
      "Illustrated connected wallet and interface blocks for Next Web3 Template.",
    imageWidth: 1200,
    imageHeight: 675,
    scope: [
      "Wallet connection with RainbowKit and Wagmi.",
      "SIWE authentication with NextAuth.",
      "Reusable UI components and light/dark themes.",
    ],
    evidence: [
      { label: "Template and setup guide", path: "README.md" },
      { label: "Wallet configuration", path: "src/wagmi.ts" },
    ],
  },
  1: {
    title: "Etherway",
    caseStudy: etherwayCase,
    description:
      "A cross-chain application combining swaps, token and NFT transfers, and gas refuelling. Built end to end by CJSKI.",
    summary:
      "Cross-chain swaps, token and NFT transfers, and gas refuelling in one application.",
    stack: ["Next.js", "TypeScript", "LayerZero", "Hyperlane"],
    image: "/projects/etherway-banner.png",
    imageWidth: 700,
    imageHeight: 350,
    imageAlt: "Etherway project banner from its public repository.",
    scope: [
      "Cross-chain swaps and transfers through integrated bridging providers.",
      "LayerZero V2 and Hyperlane token/NFT workflows.",
      "Gas-refuel interfaces, authentication and transaction data flows.",
    ],
    evidence: [
      { label: "Bridge interface", path: "src/components/squid/bridge.tsx" },
      { label: "PostgreSQL data models", path: "prisma/schema.prisma" },
      {
        label: "Gas-refuel workflow",
        path: "src/components/gas/gas-refuel.tsx",
      },
      {
        label: "Contract interaction handlers",
        path: "src/utils/contracts/handlers/handleBridging.ts",
      },
    ],
  },
  2: {
    title: "OmniMinter",
    summary:
      "A multi-chain minting application for tokens, NFTs and cross-chain transfers.",
    stack: ["Next.js", "TypeScript", "LayerZero", "Wormhole"],
    image: "/projects/omniminter-banner.jpeg",
    imageWidth: 1500,
    imageHeight: 500,
    imageAlt: "OmniMinter project banner from its public repository.",
    scope: [
      "Token and NFT minting and bridging interfaces.",
      "LayerZero V1 and Wormhole integration paths.",
      "Gas refuelling, account activity and Prisma-backed data features.",
    ],
    evidence: [
      {
        label: "Token bridging interface",
        path: "components/Token/TokenBridge.tsx",
      },
      { label: "Gas-refuel interface", path: "components/GasRefuel/Gas.tsx" },
      {
        label: "Contract access helpers",
        path: "common/utils/getters/contracts/oft.ts",
      },
    ],
  },
};
export const projects: Project[] = [
  ...existingProjects.map((project) => ({
    ...project,
    ...(typeof project.id === "number" ? showcaseOverrides[project.id] : {}),
  })),
  ...featured,
].map((project) => {
  const entry = register.find((entry) => entry.id === project.id);
  const repositoryCreatedAt = (repositoryDates as Record<string, string>)[
    project.githubLink
  ];
  return {
    ...project,
    ...(entry
      ? {
          area: entry.area,
          status: entry.status,
          ...(entry.contribution ? { contribution: entry.contribution } : {}),
        }
      : {}),
    ...(repositoryCreatedAt ? { repositoryCreatedAt } : {}),
  };
});
export const portfolioProjects: Project[] = register.map((entry) =>
  projects.find((project) => project.id === entry.id)!,
);
export const selectedProjects: Project[] = register
  .filter((entry) => entry.homepage)
  .map((entry) => projects.find((project) => project.id === entry.id)!);
export const earlierProjects = portfolioProjects.filter(
  (project) => project.area === "earlier",
);
