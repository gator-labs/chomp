"use client";

import AvatarPlaceholder from "@/public/images/avatar_placeholder.png";
import { shortenWalletAddress } from "@dynamic-labs/sdk-react-core";
import { User, Wallet } from "@prisma/client";
import RankingCard from "../RankingCard/RankingCard";

interface Props {
  ranking: {
    user: {
      wallets: Wallet[];
    } & User;
    points: number;
    rank: number;
  }[];
  loggedUserId: string;
}

const CampaignRanking = ({ ranking, loggedUserId }: Props) => {
  return (
    <div className="flex flex-col gap-2 overflow-hidden">
      <div className="flex justify-between">
        <p className="text-base">User</p>
        <p className="text-base">Points Earned</p>
      </div>
      {!!ranking.length ? (
        <ul className="flex flex-col gap-2 overflow-y-auto">
          {ranking.map((rankItem, index) => {
            if (rankItem.rank > 100) return;

            return (
              <RankingCard
                key={index || rankItem.user.id}
                points={rankItem.points}
                rank={rankItem.rank}
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
        </ul>
      ) : (
        <p className="text-center pt-5">No records yet.</p>
      )}
    </div>
  );
};

export default CampaignRanking;
