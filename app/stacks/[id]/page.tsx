import TrophyOutlineIcon from "@/app/components/Icons/TrophyOutlinedIcon";
import StackDeckCard from "@/app/components/StackDeckCard/StackDeckCard";
import StacksHeader from "@/app/components/StacksHeader/StacksHeader";
import { getStack } from "@/app/queries/stack";
import { getCurrentUser } from "@/app/queries/user";
import { ChompResult, Question } from "@prisma/client";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";

type PageProps = {
  params: {
    id: string;
  };
};

const StackPage = async ({ params: { id } }: PageProps) => {
  const [stack, user] = await Promise.all([getStack(+id), getCurrentUser()]);

  console.log("stack", stack);

  if (!stack || (stack.isActive === false && stack?.isVisible === false))
    return notFound();

  return (
    <div className="flex flex-col gap-2 pt-4 overflow-hidden pb-2">
      <StacksHeader backAction="stacks" />
      <div className="p-4 bg-gray-850 flex gap-4">
        <div className="relative w-[100.5px] h-[100.5px]">
          <Image
            src={stack.image}
            fill
            alt={stack.name}
            className="object-cover"
          />
        </div>
        <div className="flex flex-col">
          <h1 className="text-base mb-3">{stack.name}</h1>
          <p className="text-xs mb-6">
            {stack.deck.length} deck{stack.deck.length === 1 ? "" : "s"},{" "}
            {stack.deck.flatMap((d) => d.deckQuestions).length} cards
          </p>
          <Link
            href={`/application/leaderboard/stack/${id}`}
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
        {stack.deck.map((deck) => (
          <StackDeckCard
            key={deck.id}
            deckId={deck.id}
            chompResults={
              deck.deckQuestions.flatMap(
                (dq) => dq.question.chompResults,
              ) as (ChompResult & { question: Question })[]
            }
            deckQuestions={deck.deckQuestions.map((dq) => dq.question)}
            deckName={deck.deck}
            imageUrl={deck.imageUrl ? deck.imageUrl : stack.image}
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
            activeFromDate={deck.activeFromDate || deck.createdAt}
            userId={user?.id}
          />
        ))}
      </ul>
    </div>
  );
};

export default StackPage;
