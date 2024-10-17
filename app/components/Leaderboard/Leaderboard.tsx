"use client";

/* eslint-disable @next/next/no-img-element */

import { getLeaderboard, getPreviousUserRank } from "@/app/actions/leaderboard";
import useIsOverflowing from "@/app/hooks/useIsOverflowing";
import { nthNumber } from "@/app/utils/number";
import { cn } from "@/app/utils/tailwind";
import AvatarPlaceholder from "@/public/images/avatar_placeholder.png";
import { User } from "@prisma/client";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import ActiveIndicator from "../ActiveIndicator/ActiveIndicator";
import { Avatar } from "../Avatar/Avatar";
import Chip from "../Chip/Chip";
import DownIcon from "../Icons/DownIcon";
import { HalfArrowLeftIcon } from "../Icons/HalfArrowLeftIcon";
import { SpinnerIcon } from "../Icons/ToastIcons/SpinnerIcon";
import UpIcon from "../Icons/UpIcon";
import LeaderboardRanking from "../LeaderboardRanking/LeaderboardRanking";
import Marquee from "../Marquee/Marquee";
import { FILTERS } from "./constants";

interface Props {
  leaderboardName: string;
  variant: "weekly" | "daily" | "stack" | "all-time";
  loggedUser: User;
  stackId?: number;
  leaderboardImage?: string;
  isLeaderboardActive?: boolean;
}

export interface Ranking {
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
  stackId,
  leaderboardImage,
  isLeaderboardActive = false,
  loggedUser,
}: Props) => {
  const [activeFilter, setActiveFilter] = useState(FILTERS[0]);
  const [ranking, setRanking] = useState<Ranking[] | []>([]);
  const leaderboardNameRef = useRef(null);
  const isOverflowing = useIsOverflowing(leaderboardNameRef);
  const router = useRouter();
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
  const [previousUserRank, setPreviousUserRank] = useState<number | undefined>(
    undefined,
  );
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    const effect = async (
      filter: "totalPoints" | "totalBonkClaimed" | "chompedQuestions",
    ) => {
      const res = await getLeaderboard({
        filter,
        variant,
        stackId,
      });
      setLoggedInUserScore(res?.loggedInUserScore);
      setRanking(res?.ranking || []);
      setIsLoading(false);

      if (variant !== "stack" && variant !== "all-time") {
        const rank = await getPreviousUserRank(variant, filter);
        setPreviousUserRank(rank);
      } else {
        setPreviousUserRank(undefined);
      }
    };

    setIsLoading(true);
    effect(
      activeFilter.value as
        | "totalPoints"
        | "totalBonkClaimed"
        | "chompedQuestions",
    );
  }, [activeFilter, stackId]);

  const rankDifference =
    previousUserRank && loggedInUserScore?.loggedInUserRank
      ? previousUserRank - loggedInUserScore?.loggedInUserRank
      : undefined;

  return (
    <div className="pb-1 flex flex-col gap-4 h-full overflow-hidden">
      <div className="flex items-center gap-4 py-[5px]">
        <div onClick={() => router.back()}>
          <HalfArrowLeftIcon />
        </div>
        {leaderboardImage && (
          <div className="relative w-[38px] h-[38px] flex-shrink-0">
            <ActiveIndicator isActive={isLeaderboardActive} />
            <Image
              fill
              src={leaderboardImage}
              alt={`${leaderboardName}-logo`}
              className="object-cover w-full h-full rounded-full"
              sizes="(max-width: 600px) 38px, (min-width: 601px) 50px"
            />
          </div>
        )}
        {isOverflowing ? (
          <Marquee text={leaderboardName} />
        ) : (
          <p
            ref={leaderboardNameRef}
            className="text-xl leading-6 text-nowrap overflow-hidden"
          >
            {leaderboardName}
          </p>
        )}
      </div>

      <div className="p-4 rounded-lg bg-gray-700 gap-4 flex">
        <div className="h-10">
          <Avatar
            src={loggedUser?.profileSrc || AvatarPlaceholder.src}
            size="medium"
          />
        </div>
        <div className="flex flex-col gap-2 flex-1 justify-center">
          <span className="text-xs  text-gray-400">
            {variant === "stack"
              ? "All time ranking"
              : variant === "daily"
                ? "Today" : variant === "weekly" ? "This week"
                : "All time"}
          </span>
          {!!rankDifference && (
            <div className="flex gap-1 items-center">
              {rankDifference >= 1 ? (
                <UpIcon fill="#6DECAF" />
              ) : (
                <DownIcon fill="#ED6A5A" />
              )}
              <p
                className={cn("text-sm  font-bold", {
                  "text-aqua": rankDifference > 0,
                  "text-destructive": rankDifference < 0,
                })}
              >
                {Math.abs(rankDifference)}
                {Math.abs(rankDifference) > 1 ? " Places" : " Place"}
              </p>
            </div>
          )}
          <div className="flex justify-between">
            <div className="flex flex-col gap-2">
              <p
                className={cn("text-xs ", {
                  "text-sm  font-bold": !rankDifference,
                })}
              >
                {!!loggedInUserScore?.loggedInUserRank
                  ? `Ranking ${loggedInUserScore.loggedInUserRank}${nthNumber(loggedInUserScore.loggedInUserRank)} place`
                  : "- No Ranking Yet"}
              </p>
              {!loggedInUserScore?.loggedInUserRank && (
                <p className="text-xs ">
                  Your ranking will be displayed once ready!
                </p>
              )}
            </div>

            {!!loggedInUserScore?.loggedInUserRank && (
              <p className="text-xs font-bold">
                {loggedInUserScore?.loggedInUserPoints || 0}{" "}
                {activeFilter.label}
              </p>
            )}
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
