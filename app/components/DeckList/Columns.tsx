"use client";
import { deleteDeck } from "@/app/actions/deck/deck";
import { useToast } from "@/app/providers/ToastProvider";
import { ColumnDef } from "@tanstack/react-table";
import dayjs from "dayjs";
import Link from "next/link";
import { useEffect, useState } from "react";
import { Button } from "../Button/Button";
import { Modal } from "../Modal/Modal";
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
      // eslint-disable-next-line react-hooks/rules-of-hooks
      const [isModalOpen, setIsModalOpen] = useState(false);
      const [totalNumberOfAnswersInDeck, setTotalNumberOfAnswersInDeck] =
        useState(0);
      const [isDeleting, setIsDeleting] = useState(false);
      const [isFetching, setIsFetching] = useState(false);
      const { successToast } = useToast();

      useEffect(() => {
        const fetchTotalNumberOfAnswersInDeck = async () => {
          setIsFetching(true);
          const res = await fetch(
            `${process.env.NEXT_PUBLIC_API_URL!}/deck?deckId=${row.original.id}`,
          );
          const data = await res.json();

          setTotalNumberOfAnswersInDeck(data.totalNumberOfAnswersInDeck);
          setIsFetching(false);
        };

        if (isModalOpen) fetchTotalNumberOfAnswersInDeck();
      }, [isModalOpen]);

      return (
        <div className="flex gap-2">
          <Modal
            isOpen={isModalOpen}
            onClose={() => !isDeleting && setIsModalOpen(false)}
            title={`Deck: ${row.original.deck}`}
          >
            <div className="flex flex-col gap-2">
              <p>
                Are you sure you want to delete <b>{row.original.deck}</b>?
              </p>
              <p>
                Total number of answers:{" "}
                {isFetching ? "..." : totalNumberOfAnswersInDeck}
              </p>
              <div className="flex gap-2">
                <Button
                  variant="warning"
                  disabled={isDeleting || isFetching}
                  onClick={async () => {
                    setIsDeleting(true);
                    await deleteDeck(row.original.id);
                    setIsDeleting(false);
                    setIsModalOpen(false);
                    successToast(`${row.original.deck} deleted!`);
                  }}
                >
                  {isDeleting ? "Deleting" : "Delete"}
                </Button>
                <Button
                  variant="primary"
                  disabled={isDeleting || isFetching}
                  onClick={() => setIsModalOpen(false)}
                >
                  No
                </Button>
              </div>
            </div>
          </Modal>
          <Link href={`/admin/decks/${row.original.id}`}>
            <Button variant="primary" isFullWidth={false}>
              Edit
            </Button>
          </Link>
          <Button
            variant="warning"
            isFullWidth={false}
            onClick={() => setIsModalOpen(true)}
          >
            Delete
          </Button>
        </div>
      );
    },
  },
];
