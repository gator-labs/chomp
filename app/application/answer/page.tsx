import { getUnansweredDailyQuestions } from "@/app/queries/question";
import { shuffleArray } from "@/app/utils/randomUtils";
import Link from "next/link";
import { redirect } from "next/navigation";

export default async function Page() {
  const unansweredQuestions = await getUnansweredDailyQuestions();

  const [randomQuestion] = shuffleArray(unansweredQuestions);

  if (randomQuestion) {
    redirect(`/application/answer/question/${randomQuestion.id}`);
  }

  return (
    <div className="flex justify-center items-center h-full">
      <div>
        “No question available”? <br />
        <br />
        Let&#x2019;s say this “thank you for your interested in Chomp! Closed
        alpha is now over, follow us{" "}
        <Link href="https://twitter.com/chompdotgames">@chompdotgames</Link> on
        Twitter for when the beta will be available for you to play!
      </div>
    </div>
  );
}
