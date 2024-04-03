import { Suspense } from "react";
import dynamic from "next/dynamic";
const HomeFeed = dynamic(() => import("../components/HomeFeed/HomeFeed"), {
  ssr: false,
});
import { HomeFeedProps } from "../components/HomeFeed/HomeFeed";
import { HomeFilters } from "../components/HomeFilters/HomeFilters";
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
    </>
  );
}
