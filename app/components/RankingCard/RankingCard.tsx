import { Avatar } from "@/app/components/Avatar/Avatar";
import { cn } from "@/app/utils/tailwind";

interface Props {
  name: string;
  imageSrc: string;
  points: number;
  loggedUserId: string;
  userId: string;
  rank: number;
}

const RankingCard = ({
  name,
  imageSrc,
  points,
  loggedUserId,
  userId,
  rank,
}: Props) => {
  return (
    <li
      className={cn(
        "p-4 bg-[#1B1B1B] rounded-lg justify-between items-center flex",
        {
          "bg-[#333333]": loggedUserId === userId,
        },
      )}
    >
      <div className="flex items-center">
        <div
          className={cn(
            "w-10 h-10 flex items-center justify-center rounded-full text-[#A3A3EC] font-semibold mr-2",
            {
              "bg-[#FFF294]": rank === 1,
              "bg-[#DFDFDF]": rank === 2,
              "bg-[#E2956C]": rank === 3,
              "text-[#0D0D0D]": rank < 4,
            },
          )}
        >
          <p className="text-[20px] leading-[15px]">{rank}</p>
        </div>
        <Avatar src={imageSrc} size="medium" />
        <p className="ml-6 text-sm">{name}</p>
      </div>
      <p className="text-base font-bold">{points}</p>
    </li>
  );
};

export default RankingCard;
