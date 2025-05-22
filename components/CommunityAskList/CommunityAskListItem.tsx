import { Button } from "@/app/components/Button/Button";
import { useToast } from "@/app/providers/ToastProvider";
import { formatDate } from "@/app/utils/date";
import { AskQuestionPreview } from "@/components/AskWizard/AskQuestionPreview";
import { useCommunityAskAddToDeck } from "@/hooks/useCommunityAskAddToDeck";
import { useCommunityAskArchive } from "@/hooks/useCommunityAskArchive";
import { useCommunityAskUnarchive } from "@/hooks/useCommunityAskUnarchive";
import { CommunityAskQuestion } from "@/lib/ask/getCommunityAskList";
import AvatarPlaceholder from "@/public/images/avatar_placeholder.png";
import { useQueryClient } from "@tanstack/react-query";
import Image from "next/image";
import { useEffect } from "react";

export type CommunityAskListItemProps = {
  question: CommunityAskQuestion;
};

export function CommunityAskListItem({ question }: CommunityAskListItemProps) {
  const { successToast, errorToast } = useToast();
  const queryClient = useQueryClient();

  const addToDeck = useCommunityAskAddToDeck();
  const archive = useCommunityAskArchive();
  const unarchive = useCommunityAskUnarchive();

  const avatarSrc = question.user?.profileSrc || AvatarPlaceholder.src;

  const handleAddToDeck = async () => {
    addToDeck.mutate(question.id);
  };

  const handleArchive = async () => {
    archive.mutate(question.id);
  };

  const handleUnarchive = async () => {
    unarchive.mutate(question.id);
  };

  useEffect(() => {
    if (addToDeck.isError)
      errorToast("Failed to add question to the community deck.");
  }, [addToDeck.isError]);

  useEffect(() => {
    if (addToDeck.isSuccess) {
      successToast("Successfully added question to the community deck");
      queryClient.invalidateQueries({ queryKey: ["communityAskStats"] });
    }
  }, [addToDeck.isSuccess]);

  useEffect(() => {
    if (archive.isError) errorToast("Failed to archive question.");
  }, [archive.isError]);

  useEffect(() => {
    if (archive.isSuccess) {
      successToast("Successfully archived question");
      queryClient.invalidateQueries({ queryKey: ["communityAskStats"] });
    }
  }, [archive.isSuccess]);

  useEffect(() => {
    if (unarchive.isSuccess) {
      successToast("Successfully unarchived question");
      queryClient.invalidateQueries({ queryKey: ["communityAskStats"] });
    }
  }, [unarchive.isSuccess]);

  const isLoading =
    addToDeck.isPending || archive.isPending || unarchive.isPending;

  return (
    <div className="border p-2 m-2 rounded-md bg-gray-900 flex flex-col gap-2 relative">
      {(question.isArchived || archive.isSuccess) && !unarchive.isSuccess && (
        <div className="bg-red-400 text-xs font-bold float-right z-[100] absolute right-[3em] rounded-b-lg px-2 py-1">
          Archived
        </div>
      )}
      <AskQuestionPreview
        title={question.question}
        options={question.questionOptions.map((qo) => qo.option)}
        imageUrl={question.imageUrl}
        hideHeader={true}
      />
      <div className="bg-gray-600 rounded-md p-2 grid grid-cols-[1fr_auto] text-sm">
        <div className="text-nowrap">Submitted by:</div>
        <div className="text-right truncate">
          <span className="mr-1">
            <Image
              src={avatarSrc}
              alt="Avatar"
              width={16}
              height={16}
              className={"rounded-full border-2 inline-block"}
              style={{
                width: 16,
                height: 16,
              }}
            />
          </span>
          {question.user.username || question.user.id}
        </div>
        <div>Wallet:</div>
        <div className="text-right truncate">
          {question.user.wallets?.[0]?.address || "?"}
        </div>
        <div>At:</div>
        <div className="text-right">{formatDate(question.createdAt)}</div>
      </div>
      <div className="flex gap-2">
        {question.isArchived ? (
          <Button
            variant={unarchive.isSuccess ? "secondary" : "primary"}
            onClick={handleUnarchive}
            disabled={isLoading || unarchive.isSuccess}
          >
            {unarchive.isPending
              ? "Unarchiving..."
              : unarchive.isSuccess
                ? "✔️ Unarchived"
                : "Unarchive"}
          </Button>
        ) : question.addedToDeckAt ? (
          <Button variant="primary" disabled={true}>
            Accepted at {formatDate(question.addedToDeckAt)}
          </Button>
        ) : (
          <>
            <Button
              variant={addToDeck.isSuccess ? "secondary" : "primary"}
              onClick={handleAddToDeck}
              disabled={
                isLoading ||
                addToDeck.isSuccess ||
                archive.isSuccess ||
                unarchive.isSuccess
              }
            >
              {addToDeck.isPending
                ? "Adding..."
                : addToDeck.isSuccess
                  ? "✔️ Added to Community Deck"
                  : "Add to Community Deck"}
            </Button>
            <Button
              variant={addToDeck.isSuccess ? "secondary" : "warning"}
              onClick={handleArchive}
              disabled={isLoading || archive.isSuccess || addToDeck.isSuccess}
            >
              {archive.isPending
                ? "Archiving..."
                : archive.isSuccess
                  ? "✔️ Archived"
                  : "Archive"}
            </Button>
          </>
        )}
      </div>
    </div>
  );
}
