"use client";
import { Suspense, useState } from "react";
import { HomeFeed, HomeFeedProps } from "../components/HomeFeed/HomeFeed";
import { SearchFilters } from "../components/SearchFilters/SearchFilters";
import { CountdownIcon } from "../components/Icons/CountdownIcon";
import { useIsomorphicLayoutEffect } from "../hooks/useIsomorphicLayoutEffect";
import AvatarPlaceholder from "@/public/images/avatar_placeholder.png";
import { Navbar } from "@/app/components/Navbar/Navbar";

type PageProps = {
  searchParams: { query: string };
};

let lastQuery: string | undefined = "";

export default function Page({ searchParams }: PageProps) {
  const [response, setResponse] = useState<any>();
  const getData = async (query: string | undefined) => {
    lastQuery = query;
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

  const onRefreshCards = () => {
    getData(lastQuery);
  };

  return (
    <>
      <Navbar
        avatarSrc={AvatarPlaceholder.src}
        avatarLink="/application/profile"
        walletLink=""
      />
      <SearchFilters
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
        {response && (
          <HomeFeed
            {...(response as HomeFeedProps)}
            onRefreshCards={onRefreshCards}
          />
        )}
      </Suspense>
    </>
  );
}
