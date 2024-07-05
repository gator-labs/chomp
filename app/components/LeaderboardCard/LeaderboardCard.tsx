/* eslint-disable @next/next/no-img-element */
import Link from "next/link";
import ActiveIndicator from "../ActiveIndicator/ActiveIndicator";
import { HalfArrowRightIcon } from "../Icons/HalfArrowRightIcon";

interface Props {
  href: string;
  name: string;
  imageSrc: string;
  isActive: boolean;
  showActiveIndicator: boolean;
}

const LeaderboardCard = ({
  href,
  name,
  imageSrc,
  isActive,
  showActiveIndicator,
}: Props) => {
  return (
    <Link href={href}>
      <li className="px-4 py-[15px] border-[0.5px] border-[#666666] rounded-lg bg-[#333333] flex items-center justify-between">
        <div className="flex items-center gap-4">
          <div className="relative w-[38px] h-[38px]">
            {showActiveIndicator && <ActiveIndicator isActive={isActive} />}
            <img
              src={imageSrc}
              alt={`${name}-logo`}
              className="object-cover w-full h-full rounded-full"
            />
          </div>
          <p className="text-base">{name}</p>
        </div>
        <HalfArrowRightIcon />
      </li>
    </Link>
  );
};

export default LeaderboardCard;
