"use client";

import { Banner } from "@prisma/client";

import { ColumnDef } from "@tanstack/react-table";
import Image from "next/image";
import Link from "next/link";
import { Button } from "../ui/button";

export const columns: ColumnDef<Banner>[] = [
  {
    accessorKey: "image",
    header: "Image",
    cell: ({ row }) => (
      <Image
        fill
        alt="banner-image"
        className="w-32 h-32 object-contain"
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
        <Link href={`/admin/banners/${row.original.id}`}>
          <Button isFullWidth={false}>
            Edit
          </Button>
        </Link>
      </div>
    ),
  },
];
