import { getHistoryDecks } from "@/app/actions/history";
import History from "@/app/components/History/History";
import HistoryHeader from "@/app/components/HistoryHeader/HistoryHeader";
import {
  getAllQuestionsReadyForReveal,
  getTotalClaimableRewards,
} from "@/app/queries/history";

type PageProps = {
  searchParams: { sort: string; type: string; openIds: string };
};

export default async function Page({ searchParams }: PageProps) {
  const [deckHistory, totalClaimableRewards, revealableQuestions] =
    await Promise.all([
      getHistoryDecks(),
      getTotalClaimableRewards(),
      getAllQuestionsReadyForReveal(),
    ]);

  return (
    <div className="flex flex-col gap-4 overflow-hidden">
      <HistoryHeader
        totalClaimableRewards={totalClaimableRewards}
        revealableQuestions={revealableQuestions}
      />
      <History deckHistory={deckHistory} />
    </div>
  );
}
