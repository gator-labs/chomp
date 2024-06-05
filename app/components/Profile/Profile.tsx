import { formatAddress } from "@/app/utils/wallet";
import dayjs from "dayjs";
import { Avatar } from "../Avatar/Avatar";

type ProfileProps = {
  address: string;
  joinDate: Date;
  avatarSrc: string;
};

export function Profile({ address, avatarSrc, joinDate }: ProfileProps) {
  return (
    <div className="flex items-center p-6 rounded-2xl bg-[#333] gap-4">
      <Avatar size="large" src={avatarSrc} />
      <div className="flex flex-col font-sora text-white gap-y-5">
        <span className="text-base font-bold">{formatAddress(address)}</span>
        <span className="text-sm">
          Joined {dayjs(joinDate).format("MMMM YYYY").toString()}
        </span>
      </div>
    </div>
  );
}
