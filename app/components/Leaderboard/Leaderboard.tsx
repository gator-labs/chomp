"use client";

/* eslint-disable @next/next/no-img-element */

import { getLeaderboard } from "@/app/actions/leaderboard";
import { nthNumber } from "@/app/utils/number";
import AvatarPlaceholder from "@/public/images/avatar_placeholder.png";
import { User } from "@prisma/client";
import Link from "next/link";
import { useEffect, useState } from "react";
import ActiveIndicator from "../ActiveIndicator/ActiveIndicator";
import { Avatar } from "../Avatar/Avatar";
import Chip from "../Chip/Chip";
import { HalfArrowLeftIcon } from "../Icons/HalfArrowLeftIcon";
import { SpinnerIcon } from "../Icons/ToastIcons/SpinnerIcon";
import LeaderboardRanking from "../LeaderboardRanking/LeaderboardRanking";
import { FILTERS } from "./constants";

interface Props {
  leaderboardName: string;
  variant: "weekly" | "daily" | "campaign";
  loggedUser: User;
  campaignId?: number;
  leaderboardImage?: string;
  isLeaderboardActive?: boolean;
}

interface Ranking {
  user: {
    wallets: {
      address: string;
      userId: string;
      createdAt: Date;
      updatedAt: Date;
    }[];
  } & {
    id: string;
    isAdmin: boolean;
    createdAt: Date;
    updatedAt: Date;
    firstName: string | null;
    lastName: string | null;
    username: string | null;
    profileSrc: string | null;
    tutorialCompletedAt: Date | null;
  };
  value: number;
  rank: number;
}

const Leaderboard = ({
  leaderboardName,
  variant,
  campaignId,
  leaderboardImage,
  isLeaderboardActive = false,
  loggedUser,
}: Props) => {
  const [activeFilter, setActiveFilter] = useState(FILTERS[0]);
  const [ranking, setRanking] = useState<Ranking[] | []>([]);
  const [loggedInUserScore, setLoggedInUserScore] = useState<
    | {
        loggedInUserRank: number | undefined;
        loggedInUserPoints: number | undefined;
      }
    | undefined
  >({
    loggedInUserRank: undefined,
    loggedInUserPoints: undefined,
  });
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    const effect = async (
      filter: "totalPoints" | "totalBonkClaimed" | "chompedQuestions",
    ) => {
      const res = await getLeaderboard({
        filter,
        variant,
        campaignId,
      });

      setLoggedInUserScore(res?.loggedInUserScore);
      setRanking(res?.ranking || []);
      setIsLoading(false);
    };

    setIsLoading(true);
    effect(
      activeFilter.value as
        | "totalPoints"
        | "totalBonkClaimed"
        | "chompedQuestions",
    );
  }, [activeFilter, campaignId]);

  return (
    <div className="pb-1 flex flex-col gap-4 h-full overflow-hidden">
      <div className="flex items-center gap-4 py-[5px]">
        <Link href="/application/profile/leaderboard">
          <HalfArrowLeftIcon />
        </Link>
        {leaderboardImage && (
          <div className="relative w-[38px] h-[38px]">
            <ActiveIndicator isActive={isLeaderboardActive} />
            <img
              src={leaderboardImage}
              alt={`${leaderboardName}-logo`}
              className="object-cover w-full h-full rounded-full"
            />
          </div>
        )}
        <p className="text-[20px] leading-6">{leaderboardName}</p>
      </div>

      <div className="p-4 rounded-lg bg-[#333333] gap-4 flex">
        <Avatar
          src={loggedUser.profileSrc || AvatarPlaceholder.src}
          size="medium"
        />
        <div className="flex flex-col gap-2 flex-1">
          <span className="text-xs text-[#999999]">
            {variant === "campaign"
              ? "All time ranking"
              : variant === "daily"
                ? "Today"
                : "This week"}
          </span>
          <div className="flex justify-between items-center">
            <p className="text-[15px] leading-[17.25px] font-bold">
              {!!loggedInUserScore?.loggedInUserRank
                ? `Ranking ${loggedInUserScore.loggedInUserRank}${nthNumber(loggedInUserScore.loggedInUserRank)} place`
                : "- No Ranking Yet"}
            </p>
            <p className="text-xs font-bold">
              {loggedInUserScore?.loggedInUserPoints || 0} {activeFilter.label}
            </p>
          </div>
        </div>
      </div>

      <div>
        <ul className="flex overflow-x-auto gap-2 no-scrollbar">
          {FILTERS.map((filter) => (
            <Chip
              key={filter.value}
              label={filter.label}
              isActive={filter.value === activeFilter.value}
              onClick={() => setActiveFilter(filter)}
            />
          ))}
        </ul>
      </div>

      {isLoading ? (
        <div className="flex items-center justify-center">
          <SpinnerIcon fill="#A3A3EC" />
        </div>
      ) : (
        <LeaderboardRanking
          label={activeFilter.label}
          ranking={ranking}
          loggedUserId={loggedUser.id}
        />
      )}
    </div>
  );
};

export default Leaderboard;
