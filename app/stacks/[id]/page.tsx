import { Stack } from "@/app/components/Stack/Stack";
import { getStack } from "@/app/queries/stack";
import { getCurrentUser } from "@/app/queries/user";
import { getBlurData } from "@/app/utils/getBlurData";
import { getTotalNumberOfDeckQuestions } from "@/app/utils/question";
import { ESpecialStack } from "@prisma/client";
import { notFound } from "next/navigation";

type PageProps = {
  params: {
    id: string;
  };
};

const StackPage = async ({ params: { id } }: PageProps) => {
  const [stack, user] = await Promise.all([getStack(+id), getCurrentUser()]);

  const FF_ASK = process.env.NEXT_PUBLIC_FF_ASK === "true";

  if (!FF_ASK && stack?.specialId == ESpecialStack.CommunityAsk)
    return notFound();

  if (!stack || (stack.isActive === false && stack?.isVisible === false))
    return notFound();

  const deckQuestions = stack.deck.flatMap((d) => d.deckQuestions);

  const totalNumberOfCards = getTotalNumberOfDeckQuestions(deckQuestions);

  const blurData = stack.image ? await getBlurData(stack.image) : undefined;

  return (
    <Stack
      stack={stack}
      totalNumberOfCards={totalNumberOfCards}
      blurData={blurData}
      userId={user?.id}
    />
  );
};

export default StackPage;
