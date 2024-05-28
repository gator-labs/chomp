"use client";
import { ColumnDef } from "@tanstack/react-table";
import dayjs from "dayjs";
import Link from "next/link";
import { Button } from "../Button/Button";
import { Tag } from "../Tag/Tag";
import { QuestionRowType } from "./QuestionList";

export const columns: ColumnDef<QuestionRowType>[] = [
  { accessorKey: "question", header: "Question" },
  { accessorKey: "type", header: "Type" },
  { accessorKey: "revealToken", header: "Token" },
  { accessorKey: "revealTokenAmount", header: "Reveal Token Amount" },
  {
    header: "Reveal at",
    cell: ({ row }) => {
      return (
        <div>
          {row.original.revealAtDate
            ? dayjs(row.original.revealAtDate).format("MM.DD.YYYY HH:mm")
            : ""}{" "}
          {row.original.revealAtAnswerCount &&
            `(${row.original.revealAtAnswerCount} answers)`}
        </div>
      );
    },
  },
  {
    header: "Tags",
    cell: ({ row }) => {
      return (
        <div className="flex gap-2">
          {row.original.questionTags.map((t) => (
            <Tag tag={t.tag.tag} key={t.id} />
          ))}
        </div>
      );
    },
  },
  {
    header: "Actions",
    cell: ({ row }) => {
      return (
        <Link href={`/admin/questions/${row.original.id}`}>
          <Button variant="primary" isFullWidth={false}>
            Edit
          </Button>
        </Link>
      );
    },
  },
];
