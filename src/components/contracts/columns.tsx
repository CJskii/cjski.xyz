import Link from "next/link";
import Image from "next/image";

import { ColumnDef } from "@tanstack/react-table";
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

export const columns: ColumnDef<Contract>[] = [
  {
    accessorKey: "chainId",
    header: ({ column }) => {
      return (
        <div
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
          className="flex justify-start items-center cursor-pointer hover:underline hover:font-semibold"
        >
          Chain ID
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </div>
      );
    },
  },
  {
    accessorKey: "chain",
    header: ({ column }) => {
      return (
        <div
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
          className="flex justify-start items-center cursor-pointer hover:underline hover:font-semibold"
        >
          Chain Name
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </div>
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
        <div
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
          className="flex justify-start items-center cursor-pointer hover:underline hover:font-semibold"
        >
          Contract Address
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </div>
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
        <div
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
          className="flex justify-start items-center cursor-pointer hover:underline hover:font-semibold"
        >
          Contract Name
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </div>
      );
    },
  },
];
