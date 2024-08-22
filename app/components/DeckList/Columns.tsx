"use client";
import { ColumnDef } from "@tanstack/react-table";
import dayjs from "dayjs";
import Link from "next/link";
import { Button } from "../Button/Button";
import { Tag } from "../Tag/Tag";
import { DeckRowType } from "./DeckList";

export const columns: ColumnDef<DeckRowType>[] = [
  { accessorKey: "deck", header: "Deck" },
  {
    header: "Token",
    cell: ({ row }) => (
      <div>{row.original.deckQuestions[0]?.question.revealToken}</div>
    ),
  },
  {
    header: "Reveal Token Amount",
    cell: ({ row }) => (
      <div>{row.original.deckQuestions[0]?.question.revealTokenAmount}</div>
    ),
  },
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
          {row.original.deckQuestions[0]?.question.questionTags.map((t) => (
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
        <Link href={`/admin/decks/${row.original.id}`}>
          <Button variant="primary" isFullWidth={false}>
            Edit
          </Button>
        </Link>
      );
    },
  },
];
