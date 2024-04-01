import { Suspense } from "react";
import { HomeFeed, HomeFeedProps } from "../components/HomeFeed/HomeFeed";
import { HomeFilters } from "../components/HomeFilters/HomeFilters";
import { LogoutButton } from "../components/LogoutButton/LogoutButton";
import { getHomeFeed } from "../queries/question";
import { CountdownIcon } from "../components/Icons/CountdownIcon";

export default async function Page() {
  const response = await getHomeFeed();

  return (
    <>
      <HomeFilters />
      <Suspense
        fallback={
          <div className="flex justify-center h-full items-center">
            <CountdownIcon />
          </div>
        }
      >
        <HomeFeed {...(response as HomeFeedProps)} />
      </Suspense>
      <LogoutButton />
    </>
  );
}
