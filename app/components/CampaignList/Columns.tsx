"use client";

import { Campaign } from "@prisma/client";

import { ColumnDef } from "@tanstack/react-table";
import Image from "next/image";
import Link from "next/link";
import { Button } from "../Button/Button";
import { ADMIN_PATH, STACKS_PATH } from "@/lib/urls";

export const columns: ColumnDef<Campaign>[] = [
  { accessorKey: "name", header: "Stack" },
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
        <Link href={`${ADMIN_PATH}${STACKS_PATH}/${row.original.id}`}>
          <Button variant="primary" isFullWidth={false}>
            Edit
          </Button>
        </Link>
      </div>
    ),
  },
];
