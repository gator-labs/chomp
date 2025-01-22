import React from "react";

import Spinner from "../Spinner/Spinner";

function LoadMoreDecks({
  isFetching,
  fetchNextPage,
  hasNextPage,
}: {
  isFetching: boolean;
  fetchNextPage: () => void;
  hasNextPage: boolean;
}) {
  return (
    <div className="pb-9 flex flex-col justify-center">
      {isFetching ? (
        <Spinner />
      ) : hasNextPage ? (
        <button
          className="text-xs text-gray-400 cursor-pointer pt-5"
          onClick={() => fetchNextPage()}
        >
          Load More
        </button>
      ) : null}
    </div>
  );
}

export default LoadMoreDecks;
