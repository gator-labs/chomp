"use client";

import { Campaign } from "@prisma/client";

import { ColumnDef } from "@tanstack/react-table";
import Image from "next/image";
import Link from "next/link";
import { Button } from "../ui/button";

export const columns: ColumnDef<Campaign>[] = [
  { accessorKey: "name", header: "Campaign" },
  {
    accessorKey: "logo",
    header: "Logo",
    cell: ({ row }) => (
      <Image
        width={40}
        height={40}
        alt="campaign-image"
        className="w-10 h-10 rounded-full object-cover"
        src={row.original.image}
      />
    ),
  },
  {
    accessorKey: "isActive",
    header: "isActive",
  },
  {
    header: "Actions",
    cell: ({ row }) => (
      <div>
        <Link href={`/admin/campaigns/${row.original.id}`}>
          <Button isFullWidth={false}>Edit</Button>
        </Link>
      </div>
    ),
  },
];
