"use client";

import { deleteQuestions } from "@/app/actions/deck/deck";
import { useToast } from "@/app/providers/ToastProvider";
import { Row } from "@tanstack/react-table";
import Link from "next/link";
import { useEffect, useState } from "react";
import { Button } from "../Button/Button";
import { Modal } from "../Modal/Modal";
import { QuestionRowType } from "./QuestionList";

type Props = {
  row: Row<QuestionRowType>;
};

const Action = ({ row }: Props) => {
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
        `${process.env.NEXT_PUBLIC_API_URL!}/question/totalNumberOfAnswers?questionId=${row.original.id}`,
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
        title={`Question id : ${row.original.id}`}
      >
        <div className="flex flex-col gap-2">
          <p>
            Are you sure you want to delete <b>{row.original.question}</b>?
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
                await deleteQuestions([row.original.id]);
                setIsDeleting(false);
                setIsModalOpen(false);
                successToast(`${row.original.question} deleted!`);
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
      <Link href={`/admin/questions/${row.original.id}`}>
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
};

export default Action;
