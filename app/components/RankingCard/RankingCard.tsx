import { Avatar } from "@/app/components/Avatar/Avatar";
import { cn } from "@/app/utils/tailwind";

interface Props {
  name: string;
  imageSrc: string;
  value: number;
  loggedUserId: string;
  userId: string;
  rank: number;
}

const RankingCard = ({
  name,
  imageSrc,
  value,
  loggedUserId,
  userId,
  rank,
}: Props) => {
  return (
    <li
      className={cn(
        "p-4 bg-grey-850 rounded-lg justify-between items-center flex",
        {
          "bg-grey-800": loggedUserId === userId,
        },
      )}
    >
      <div className="flex items-center">
        <div
          className={cn(
            "w-10 h-10 flex items-center justify-center rounded-full text-purple-500 font-semibold mr-2",
            {
              "bg-[#FFF294]": rank === 1,
              "bg-[#DFDFDF]": rank === 2,
              "bg-[#E2956C]": rank === 3,
              "text-grey-950": rank < 4,
            },
          )}
        >
          <p className="text-[20px] leading-[15px]">{rank}</p>
        </div>
        <Avatar src={imageSrc} size="medium" />
        <p className="ml-6 text-sm">{name}</p>
      </div>
      <p className="text-base font-bold">{value.toLocaleString("en-US")}</p>
    </li>
  );
};

export default RankingCard;
