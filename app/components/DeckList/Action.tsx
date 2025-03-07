"use client";

import { copyDeck, deleteDeck } from "@/app/actions/deck/deck";
import { useToast } from "@/app/providers/ToastProvider";
import { copyTextToClipboard } from "@/app/utils/clipboard";
import { Row } from "@tanstack/react-table";
import Link from "next/link";
import { useEffect, useState } from "react";

import { Modal } from "../Modal/Modal";
import { Button } from "../ui/button";
import { DeckRowType } from "./DeckList";

type Props = {
  row: Row<DeckRowType>;
};

const Action = ({ row }: Props) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isCopyModalOpen, setIsCopyModalOpen] = useState(false);
  const [totalNumberOfAnswersInDeck, setTotalNumberOfAnswersInDeck] =
    useState(0);
  const [isDeleting, setIsDeleting] = useState(false);
  const [isCopying, setIsCopying] = useState(false);
  const [isFetching, setIsFetching] = useState(false);
  const { infoToast, successToast } = useToast();

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

  const handleCopyPublicDeckLink = async () => {
    await copyTextToClipboard(
      `${window.location.origin}/application/decks/${row.original.id}`,
    );
    infoToast("Deck link copied to clipboard!");
  };
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
              variant="destructive"
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
              disabled={isDeleting || isFetching}
              onClick={() => setIsModalOpen(false)}
            >
              No
            </Button>
          </div>
        </div>
      </Modal>
      <Modal
        isOpen={isCopyModalOpen}
        onClose={() => !isDeleting && setIsCopyModalOpen(false)}
        title={`Deck: ${row.original.deck}`}
      >
        <div className="flex flex-col gap-2">
          <p>
            Create a copy of <b>{row.original.deck}</b>?
          </p>
          <div className="flex gap-2">
            <Button
              variant="primary"
              disabled={isCopying || isFetching}
              onClick={async () => {
                setIsCopying(true);
                await copyDeck(row.original.id);
                setIsCopying(false);
                setIsCopyModalOpen(false);
                successToast(`${row.original.deck} copied!`);
              }}
            >
              {isCopying ? "Copying" : "Copy"}
            </Button>
            <Button
              variant={"outline"}
              disabled={isDeleting || isFetching}
              onClick={() => setIsModalOpen(false)}
            >
              No
            </Button>
          </div>
        </div>
      </Modal>
      <Button isFullWidth={false} onClick={handleCopyPublicDeckLink}>
        Deck link
      </Button>
      <Link href={`/admin/decks/${row.original.id}`}>
        <Button isFullWidth={true} className="h-full">
          Edit
        </Button>
      </Link>
      <Button isFullWidth={false} onClick={() => setIsCopyModalOpen(true)}>
        Copy
      </Button>
      <Button
        variant="destructive"
        isFullWidth={false}
        onClick={() => setIsModalOpen(true)}
      >
        Delete
      </Button>
    </div>
  );
};

export default Action;
