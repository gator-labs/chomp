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
        alt="banner-image"
        className="object-contain"
        src={row.original.image}
        width={80}
        height={80}
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
          <Button isFullWidth={false}>Edit</Button>
        </Link>
      </div>
    ),
  },
];
