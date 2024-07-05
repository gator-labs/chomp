import { formatAddress } from "@/app/utils/wallet";
import { Avatar } from "../Avatar/Avatar";
import { Button } from "../Button/Button";

type ProfileProps = {
  address: string;
  avatarSrc: string;
};

export function Profile({ address, avatarSrc }: ProfileProps) {
  return (
    <div className="flex items-center p-4 rounded-2xl bg-[#0D0D0D] gap-4">
      <Avatar
        size="extralarge"
        className="border-chomp-purple"
        src={avatarSrc}
      />
      <div className="flex flex-col font-sora text-white gap-y-4">
        <span className="font-light text-sm">{"Welcome back,"}</span>
        <Button
          className="text-sm font-normal inline-flex items-center gap-2 !border-0 bg-[#333]"
          isPill
          size="small"
        >
          <span className="font-normal font-sora">
            {formatAddress(address)}
          </span>
        </Button>
      </div>
    </div>
  );
}
