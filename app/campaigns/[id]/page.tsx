import BackButton from "@/app/components/BackButton/BackButton";
import CampaignDeckCard from "@/app/components/CampaignDeckCard/CampaignDeckCard";
import TrophyOutlineIcon from "@/app/components/Icons/TrophyOutlinedIcon";
import { getCampaign } from "@/app/queries/campaign";
import Link from "next/link";
import { notFound } from "next/navigation";

type PageProps = {
  params: {
    id: string;
  };
};

const CampaignPage = async ({ params: { id } }: PageProps) => {
  const campaign = await getCampaign(+id);

  if (!campaign) return notFound();

  return (
    <div className="flex flex-col gap-2 pt-4 overflow-hidden pb-2">
      <div className="px-4">
        <BackButton />
      </div>
      <div className="p-4 bg-gray-850 flex gap-4">
        <img
          src={campaign.image}
          width={100.5}
          height={100.5}
          alt={campaign.name}
        />
        <div className="flex flex-col">
          <h1 className="text-base mb-3">{campaign.name}</h1>
          <p className="text-xs">
            {campaign.deck.length} deck{campaign.deck.length === 1 ? "" : "s"},{" "}
            {campaign.deck.flatMap((d) => d.deckQuestions).length} cards
          </p>
          <Link
            href={`/application/leaderboard/campaign/${id}`}
            className="mt-auto py-1 flex gap-1 items-center w-fit px-2 bg-gray-800 border border-gray-600 rounded-[56px]"
          >
            <p className="text-[12px] leading-[16px]">Leaderboards</p>
            <TrophyOutlineIcon />
          </Link>
        </div>
      </div>
      <div className="py-2 px-4 overflow-hidden">
        <p className="text-sm">Decks</p>
      </div>
      <ul className="flex flex-col gap-2 px-4 overflow-auto">
        {campaign.deck.map((deck) => (
          <CampaignDeckCard
            key={deck.id}
            deckId={deck.id}
            chompResults={deck.deckQuestions.flatMap(
              (dq) => dq.question.chompResults,
            )}
            deckQuestions={deck.deckQuestions.map((dq) => dq.question)}
            deckName={deck.deck}
            imageUrl={campaign.image}
            revealAtDate={deck.revealAtDate!}
            numberOfQuestionsOptions={
              deck.deckQuestions.flatMap((dq) => dq.question.questionOptions)
                .length
            }
            numberOfUserQuestionsAnswers={
              deck.deckQuestions.flatMap((dq) =>
                dq.question.questionOptions.flatMap((qo) => qo.questionAnswers),
              ).length
            }
            activeFromDate={deck.activeFromDate!}
          />
        ))}
      </ul>
    </div>
  );
};

export default CampaignPage;
