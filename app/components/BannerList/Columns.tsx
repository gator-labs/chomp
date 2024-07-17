"use client";

import { Banner } from "@prisma/client";

import { ColumnDef } from "@tanstack/react-table";
import Link from "next/link";
import { Button } from "../Button/Button";

export const columns: ColumnDef<Banner>[] = [
  { accessorKey: "title", header: "Banner" },
  {
    accessorKey: "image",
    header: "Image",
    cell: ({ row }) => (
      <img className="w-32 h-32 object-contain" src={row.original.image} />
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
        <Link href={`/admin/banners/${row.original.id}`}>
          <Button variant="primary" isFullWidth={false}>
            Edit
          </Button>
        </Link>
      </div>
    ),
  },
];
