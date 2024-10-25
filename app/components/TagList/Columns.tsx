"use client";

import { Tag } from "@prisma/client";
import { ColumnDef } from "@tanstack/react-table";
import Link from "next/link";

import { Button } from "../ui/button";

export const columns: ColumnDef<Tag>[] = [
  { accessorKey: "tag", header: "Tag" },
  {
    header: "Actions",
    cell: ({ row }) => (
      <div>
        <Link href={`/admin/tags/${row.original.id}`}>
          <Button isFullWidth={false}>Edit</Button>
        </Link>
      </div>
    ),
  },
];
