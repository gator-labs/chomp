import { HomeFeed } from "../components/HomeFeed/HomeFeed";
import { HomeFilters } from "../components/HomeFilters/HomeFilters";
import { LogoutButton } from "../components/LogoutButton/LogoutButton";
import { getUnansweredDailyQuestions } from "../queries/question";

export default async function Page() {
  const unansweredDailyQuestions = await getUnansweredDailyQuestions();

  return (
    <>
      <HomeFilters />
      <HomeFeed unansweredQuestions={unansweredDailyQuestions} />
      <LogoutButton />
    </>
  );
}
