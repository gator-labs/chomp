"use client";
import { Suspense, useState } from "react";
import { HomeFeed, HomeFeedProps } from "../components/HomeFeed/HomeFeed";
import { HomeFilters } from "../components/HomeFilters/HomeFilters";
import { getHomeFeed } from "../queries/question";
import { CountdownIcon } from "../components/Icons/CountdownIcon";
import { useIsomorphicLayoutEffect } from "../hooks/useIsomorphicLayoutEffect";

type PageProps = {
  searchParams: { query: string };
};

export default function Page({ searchParams }: PageProps) {
  const [response, setResponse] = useState<any>();
  const getData = async (query: string | undefined) => {
    const searchParams = new URLSearchParams();
    if (query) {
      searchParams.set("query", query);
    }
    const params = searchParams.toString() ? `?${searchParams}` : "";
    const data = await fetch(
      `${process.env.NEXT_PUBLIC_API_URL}/home-feed${params}`
    );
    const json = await data.json();
    setResponse(json.homeFeed);
  };
  useIsomorphicLayoutEffect(() => {
    getData(searchParams.query);
  }, []);

  return (
    <>
      <HomeFilters
        initialQuery={searchParams.query}
        onQueryChange={(query) => {
          getData(query);
        }}
      />
      <Suspense
        fallback={
          <div className="flex justify-center h-full items-center">
            <CountdownIcon />
          </div>
        }
      >
        {response && <HomeFeed {...(response as HomeFeedProps)} />}
      </Suspense>
    </>
  );
}
