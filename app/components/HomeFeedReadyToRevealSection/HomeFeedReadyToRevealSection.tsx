import { getQuestionsForReadyToRevealSection } from "@/app/queries/home";
import { HomeFeedCardCarousel } from "../HomeFeedCardsCarousel/HomeFeedCardsCarousel";
import { HomeFeedEmptyQuestionCard } from "../HomeFeedEmptyQuestionCard/HomeFeedEmptyQuestionCard";
import { RevealFeedQuestionCard } from "../RevealFeedQuestionCard/RevealFeedQuestionCard";

export async function HomeFeedReadyToRevealSection() {
  const questions = await getQuestionsForReadyToRevealSection();

  const questionSlides = !!questions.length
    ? questions.map((q) => (
        <RevealFeedQuestionCard
          image={q.image}
          key={q.id}
          id={q.id}
          question={q.question}
          answerCount={q.answerCount}
          revealAtAnswerCount={q.revealAtAnswerCount}
          revealAtDate={q.revealAtDate}
          revealTokenAmount={q.revealTokenAmount}
        />
      ))
    : [
        <HomeFeedEmptyQuestionCard
          title="That’s all for now!"
          description="Come back later to see new answers to reveal here"
          key={0}
        />,
      ];

  return (
    <HomeFeedCardCarousel
      className="mt-6"
      title={
        <span className="text-base text-grey-0">
          Your Chomps ready to reveal
        </span>
      }
      slides={questionSlides}
    />
  );
}
