"use client";

import { getCampaignLeaderboard } from "@/app/queries/leaderboard";
import AvatarPlaceholder from "@/public/images/avatar_placeholder.png";
import { shortenWalletAddress } from "@dynamic-labs/sdk-react-core";
import { User, Wallet } from "@prisma/client";
import { useEffect, useState } from "react";
import { useInView } from "react-intersection-observer";
import { SpinnerIcon } from "../Icons/ToastIcons/SpinnerIcon";
import RankingCard from "../RankingCard/RankingCard";

interface Props {
  initialRanking: {
    user: {
      wallets: Wallet[];
    } & User;
    points: number;
  }[];
  loggedUserId: string;
  campaignId: number;
}

const MAX_PAGE_SIZE = 100;

const CampaignRanking = ({
  initialRanking,
  loggedUserId,
  campaignId,
}: Props) => {
  const [ranking, setRanking] = useState(initialRanking);
  const [page, setPage] = useState(2);
  const [hasNext, setHasNext] = useState(initialRanking.length === 10);

  const { ref, inView } = useInView();

  useEffect(() => {
    const fetchNextPage = async () => {
      const nextRanking = await getCampaignLeaderboard(campaignId, page);
      const newRanking = [...ranking, ...nextRanking];
      setRanking(newRanking);

      if (nextRanking.length < 10 || newRanking.length >= MAX_PAGE_SIZE)
        return setHasNext(false);

      setPage((prev) => prev + 1);
    };

    if (inView && hasNext) {
      fetchNextPage();
    }
  }, [inView, hasNext]);

  let rankNumber = 0;

  return (
    <div className="flex flex-col gap-2 overflow-hidden">
      <div className="flex justify-between">
        <p className="text-base">User</p>
        <p className="text-base">Points Earned</p>
      </div>
      {!!ranking.length ? (
        <ul className="flex flex-col gap-2 overflow-y-auto">
          {ranking.map((rankItem, index) => {
            if (rankItem.points !== ranking[index - 1]?.points)
              rankNumber = rankNumber + 1;

            return (
              <RankingCard
                key={index || rankItem.user.id}
                points={rankItem.points}
                rank={rankNumber}
                // TODO: remove this when merge to prod
                name={shortenWalletAddress(
                  rankItem.user.wallets[0]?.address || "mocked user",
                )}
                loggedUserId={loggedUserId}
                userId={rankItem.user.id}
                imageSrc={rankItem.user!.profileSrc || AvatarPlaceholder.src}
              />
            );
          })}
          {hasNext && (
            <li ref={ref} className="flex items-center justify-center py-1">
              {inView && <SpinnerIcon fill="#A3A3EC" />}
            </li>
          )}
        </ul>
      ) : (
        <p className="text-center pt-5">No records yet.</p>
      )}
    </div>
  );
};

export default CampaignRanking;
