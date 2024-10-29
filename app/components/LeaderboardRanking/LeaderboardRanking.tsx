"use client";

import { formatAddress } from "@/app/utils/wallet";
import AvatarPlaceholder from "@/public/images/avatar_placeholder.png";
import { User, Wallet } from "@prisma/client";

import RankingCard from "../RankingCard/RankingCard";

interface Props {
  label: string;
  loggedUserId: string;
  ranking: {
    user: {
      wallets: Wallet[];
    } & User;
    value: number;
    rank: number;
  }[];
}

const LeaderboardRanking = ({ label, loggedUserId, ranking }: Props) => {
  return (
    <div className="flex flex-col gap-2 overflow-hidden">
      <div className="flex justify-between">
        <p className="text-base">User</p>
        <p className="text-base">{label}</p>
      </div>
      {!!ranking.length ? (
        <ul className="flex flex-col gap-2 overflow-y-auto">
          {ranking.map((rankItem) => {
            const name = rankItem.user.username
              ? `@${rankItem.user.username}`
              : rankItem.user.wallets[0].address
                ? formatAddress(rankItem.user.wallets[0].address)
                : "mocked user";
            return (
              <RankingCard
                key={rankItem.user.id}
                value={rankItem.value}
                rank={rankItem.rank}
                name={name}
                loggedUserId={loggedUserId}
                userId={rankItem.user.id}
                imageSrc={rankItem?.user?.profileSrc || AvatarPlaceholder.src}
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

export default LeaderboardRanking;
