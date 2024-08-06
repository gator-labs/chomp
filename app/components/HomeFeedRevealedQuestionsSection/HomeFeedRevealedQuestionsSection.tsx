"use client";

import { dismissQuestion, revealQuestion } from "@/app/actions/chompResult";
import { CloseIcon } from "@/app/components/Icons/CloseIcon";
import { RevealProps } from "@/app/hooks/useReveal";
import { useRevealedContext } from "@/app/providers/RevealProvider";
import { RevealedQuestion } from "@/app/queries/home";
import { useRouter } from "next-nprogress-bar";
import { FeedQuestionCard } from "../FeedQuestionCard/FeedQuestionCard";
import { HomeFeedCardCarousel } from "../HomeFeedCardsCarousel/HomeFeedCardsCarousel";
import { HomeFeedEmptyQuestionCard } from "../HomeFeedEmptyQuestionCard/HomeFeedEmptyQuestionCard";

type HomeFeedRevealedQuestionsSectionProps = {
  questions: RevealedQuestion[];
};

const QUESTIONS_IN_SECTION = 5;
export function HomeFeedRevealedQuestionsSection({
  questions,
}: HomeFeedRevealedQuestionsSectionProps) {
  const router = useRouter();
  const { openRevealModal } = useRevealedContext();

  const handleView = (q: RevealedQuestion) => {
    openRevealModal({
      reveal: async ({ burnTx, nftAddress, nftType }: RevealProps) => {
        await revealQuestion(q.id, burnTx, nftAddress, nftType);
        router.push("/application/answer/reveal/" + q.id);
        router.refresh();
      },
      amount: q.revealTokenAmount ?? 0,
      questionId: q.id,
    });
  };

  const questionSlides = questions
    .filter((q) => !!q.image)
    .map((q) => (
      <FeedQuestionCard
        key={q.id}
        image={q.image}
        question={q.question}
        answerCount={q.answerCount}
        revealAtAnswerCount={q.revealAtAnswerCount}
        revealAtDate={q.revealAtDate}
        onTopCornerAction={(e) => {
          dismissQuestion(q.id);
          e.stopPropagation();
        }}
        topCornerActionIcon={<CloseIcon />}
        onClick={() => handleView(q)}
        statusLabel={
          <button
            onClick={() => handleView(q)}
            className="text-xs leading-6 text-white font-bold cursor-pointer"
          >
            View
          </button>
        }
      />
    ));

  if (questionSlides.length < QUESTIONS_IN_SECTION) {
    questionSlides.push(
      <HomeFeedEmptyQuestionCard
        title="That’s all for now!"
        description="Come back later to see new suggested questions here"
      />,
    );
  }

  return (
    <HomeFeedCardCarousel
      className="mt-6 mb-4"
      title={
        <span className="text-base text-white">
          Check out others’ revealed questions
        </span>
      }
      slides={questionSlides}
    />
  );
}
