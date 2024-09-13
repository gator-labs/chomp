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
        "p-4 bg-gray-800 rounded-lg justify-between items-center flex",
        {
          "bg-gray-700": loggedUserId === userId,
        },
      )}
    >
      <div className="flex items-center">
        <div
          className={cn(
            "w-10 h-10 flex items-center justify-center rounded-full text-secondary font-semibold mr-2",
            {
              "bg-[#FFF294]": rank === 1,
              "bg-[#DFDFDF]": rank === 2,
              "bg-[#E2956C]": rank === 3,
              "text-gray-900": rank < 4,
            },
          )}
        >
          <p className="text-xl">{rank}</p>
        </div>
        <Avatar src={imageSrc} size="medium" />
        <p className="ml-6 text-sm">{name}</p>
      </div>
      <p className="text-base font-bold">{value.toLocaleString("en-US")}</p>
    </li>
  );
};

export default RankingCard;
