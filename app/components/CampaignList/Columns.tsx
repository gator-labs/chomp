"use client";

import { Campaign } from "@prisma/client";

import { ColumnDef } from "@tanstack/react-table";
import Link from "next/link";
import { Button } from "../Button/Button";

export const columns: ColumnDef<Campaign>[] = [
  { accessorKey: "name", header: "Campaign" },
  {
    accessorKey: "logo",
    header: "Logo",
    cell: ({ row }) => (
      <img
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
          <Button variant="primary" isFullWidth={false}>
            Edit
          </Button>
        </Link>
      </div>
    ),
  },
];
