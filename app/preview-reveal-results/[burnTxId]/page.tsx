import { getQuestionRewards } from "@/app/queries/question";

type PreviewRevealResultsPageProps = {
  burnTxId: string;
  searchParams: {
    questionId: string;
    userId: string;
  };
};

export async function generateMetadata({
  burnTxId,
  searchParams,
}: PreviewRevealResultsPageProps) {
  if (!searchParams.userId || !searchParams.questionId) return {};

  const questionId = Number(searchParams.questionId);

  if (typeof questionId !== "number") return;

  console.log(searchParams.userId, "uid");

  const result = await getQuestionRewards(
    questionId,
    burnTxId,
    searchParams.userId,
  )!;

  console.log(result);

  const claimableAmount = Math.round(
    result?.reduce(
      (acc, curr) => acc + (curr.rewardTokenAmount?.toNumber() ?? 0),
      0,
    ),
  ).toLocaleString("en-US");

  const userImage = result[0].user.profileSrc;

  let selectedOption = "";

  if (!!questionId) {
    selectedOption = result[0].userAnswers.find((answer) => answer.selected)!
      .questionOption.option;
  }

  const questionOptions = result[0].question?.questionOptions.map(
    (qo) => `questionOptions=${qo.option}&`,
  );

  const ogUrl = new URL(
    `${process.env.NEXT_PUBLIC_API_URL!}/og?claimableAmount=${claimableAmount}&userImage=${userImage}&selectedOption=${selectedOption}&questionType=${result[0].question?.type}&${questionOptions?.join("")}question=${result[0].question?.question}`,
  );

  console.log(ogUrl.href);

  return {};
}

const PreviewRevealResults = ({ burnTxId }: PreviewRevealResultsPageProps) => {
  return null;
};

export default PreviewRevealResults;
