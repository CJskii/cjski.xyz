import Link from "next/link";
import Image from "next/image";

import { ColumnDef } from "@tanstack/react-table";
import { contractFeatures } from "./features";
import { ArrowUpDown } from "lucide-react";

export type Contract = {
  chainId: string;
  contractName: string;
  address: string;
  chain: string;
  explorerUrl: string;
  iconUrl: string;
  contractNumber: number;
};

export const columns: ColumnDef<typeof contractFeatures, Contract>[] = [
  {
    accessorKey: "chainId",
    header: ({ column }) => {
      return (
        <button
          type="button"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
          className="flex justify-start items-center cursor-pointer hover:underline hover:font-semibold"
        >
          Chain ID
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </button>
      );
    },
  },
  {
    accessorKey: "chain",
    header: ({ column }) => {
      return (
        <button
          type="button"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
          className="flex justify-start items-center cursor-pointer hover:underline hover:font-semibold"
        >
          Chain Name
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </button>
      );
    },
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
    header: ({ column }) => {
      return (
        <button
          type="button"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
          className="flex justify-start items-center cursor-pointer hover:underline hover:font-semibold"
        >
          Contract Address
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </button>
      );
    },
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
    header: ({ column }) => {
      return (
        <button
          type="button"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
          className="flex justify-start items-center cursor-pointer hover:underline hover:font-semibold"
        >
          Contract Name
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </button>
      );
    },
  },
];
