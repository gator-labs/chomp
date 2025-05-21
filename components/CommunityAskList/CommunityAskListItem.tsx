import { Button } from "@/app/components/Button/Button";
import { useToast } from "@/app/providers/ToastProvider";
import { formatDate } from "@/app/utils/date";
import { AskQuestionPreview } from "@/components/AskWizard/AskQuestionPreview";
import { useCommunityAskAddToDeck } from "@/hooks/useCommunityAskAddToDeck";
import { useCommunityAskArchive } from "@/hooks/useCommunityAskArchive";
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

  const avatarSrc = question.user?.profileSrc || AvatarPlaceholder.src;

  const handleAddToDeck = async () => {
    addToDeck.mutate(question.id);
  };

  const handleArchive = async () => {
    archive.mutate(question.id);
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

  return (
    <div className="border p-2 m-2 rounded-md bg-gray-900 flex flex-col gap-2">
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
        {question.addedToDeckAt ? (
          <Button variant="primary" disabled={true}>
            Added at {formatDate(question.addedToDeckAt)}
          </Button>
        ) : addToDeck.isSuccess ? (
          <Button variant="secondary" disabled={true}>
            ✔️ Added to Community Deck
          </Button>
        ) : (
          <Button
            variant="primary"
            onClick={handleAddToDeck}
            disabled={
              addToDeck.isPending || archive.isPending || archive.isSuccess
            }
          >
            {addToDeck.isPending ? "Adding..." : "Add to Community Deck"}
          </Button>
        )}
        {question.isArchived ? (
          <Button variant="primary" disabled={true}>
            Archived at {formatDate(question.updatedAt)}
          </Button>
        ) : archive.isSuccess ? (
          <Button variant="secondary" disabled={true}>
            ✔️ Archived
          </Button>
        ) : (
          <Button
            variant="warning"
            onClick={handleArchive}
            disabled={archive.isPending || addToDeck.isPending}
          >
            {archive.isPending ? "Archiving..." : "Archive"}
          </Button>
        )}
      </div>
    </div>
  );
}
