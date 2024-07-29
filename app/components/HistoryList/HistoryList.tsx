import { getQuestionsHistory } from "@/app/actions/history";

import {
  dehydrate,
  HydrationBoundary,
  QueryClient,
} from "@tanstack/react-query";
import History from "../History/History";

const HistoryList = async () => {
  const queryClient = new QueryClient();

  await queryClient.prefetchInfiniteQuery({
    queryKey: ["questions-history"],
    queryFn: ({ pageParam }) => getQuestionsHistory({ pageParam }),
    initialPageParam: 1,
  });

  return (
    <HydrationBoundary state={dehydrate(queryClient)}>
      <History />
    </HydrationBoundary>
  );
};

export default HistoryList;
