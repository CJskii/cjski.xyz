import { ColumnDef } from "@tanstack/react-table";
import Link from "next/link";
import Image from "next/image";

export type Contract = {
  chainId: string;
  contractName: string;
  address: string;
  chain: string;
  explorerUrl: string;
  iconUrl: string;
  contractNumber: number;
};

export const columns: ColumnDef<Contract>[] = [
  {
    accessorKey: "chainId",
    header: "Chain ID",
  },
  {
    accessorKey: "chain",
    header: "Chain",
    cell: ({ row }) => (
      <div className="flex items-center">
        <Image
          src={row.original.iconUrl}
          alt={row.original.chain}
          className="w-5 h-5 mr-2"
          width={12}
          height={12}
        />
        <span>{row.original.chain}</span>
      </div>
    ),
  },
  {
    accessorKey: "address",
    header: "Contract Address",
    cell: ({ row }) => (
      <Link
        href={row.original.explorerUrl || "#"}
        target="_blank"
        rel="noopener noreferrer"
        className="text-blue-500 underline"
      >
        {row.original.address}
      </Link>
    ),
  },
  {
    accessorKey: "contractName",
    header: "Contract Name",
  },
];
