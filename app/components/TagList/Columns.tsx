"use client";
import { ColumnDef } from "@tanstack/react-table";

import { Tag } from "@prisma/client";
import Link from "next/link";
import { Button } from "../Button/Button";

export const columns: ColumnDef<Tag>[] = [
  { accessorKey: "tag", header: "Tag" },
  {
    header: "Actions",
    cell: ({ row }) => (
      <div>
        <Link href={`/admin/tags/${row.original.id}`}>
          <Button variant="primary" isFullWidth={false}>
            Edit
          </Button>
        </Link>
      </div>
    ),
  },
];
