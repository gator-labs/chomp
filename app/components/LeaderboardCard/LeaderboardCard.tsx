"use client";

/* eslint-disable @next/next/no-img-element */
import useIsOverflowing from "@/app/hooks/useIsOverflowing";
import Image from "next/image";
import Link from "next/link";
import { ReactNode, useRef } from "react";
import ActiveIndicator from "../ActiveIndicator/ActiveIndicator";
import { HalfArrowRightIcon } from "../Icons/HalfArrowRightIcon";
import Marquee from "../Marquee/Marquee";

interface Props {
  href?: string;
  name: string;
  imageSrc?: string;
  icon?: ReactNode;
  isActive?: boolean;
  showActiveIndicator?: boolean;
}

const LeaderboardCard = ({
  href,
  name,
  imageSrc,
  icon,
  isActive = false,
  showActiveIndicator,
}: Props) => {
  const leaderboardNameRef = useRef(null);
  const isOverflowing = useIsOverflowing(leaderboardNameRef);

  const CardContent = (
    <li className="px-4 py-[15px] border-[0.5px] border-gray-500 rounded-lg bg-gray-700 flex items-center justify-between h-[70px]">
      <div className="flex items-center gap-4 overflow-hidden">
        <div className="relative w-[38px] h-[38px] flex-shrink-0">
          {showActiveIndicator && <ActiveIndicator isActive={isActive} />}
          {imageSrc && (
            <Image
              fill
              src={imageSrc}
              alt={`${name}-logo`}
              className="object-cover w-full h-full rounded-full"
            />
          )}
          {icon}
        </div>

        {isOverflowing ? (
          <Marquee text={name} />
        ) : (
          <p
            ref={leaderboardNameRef}
            className="text-base text-nowrap overflow-hidden flex-1"
          >
            {name}
          </p>
        )}
      </div>
      {!!href && (
        <div className="flex-shrink-0">
          <HalfArrowRightIcon />
        </div>
      )}
    </li>
  );

  return href ? <Link href={href}>{CardContent}</Link> : CardContent;
};

export default LeaderboardCard;
