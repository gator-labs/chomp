import { formatAddress } from "@/app/utils/wallet";
import { Avatar } from "../Avatar/Avatar";
import { Button } from "../Button/Button";
import { PencilIcon } from "../Icons/PencilIcon";

type ProfileProps = {
  address: string;
  avatarSrc: string;
};

export function Profile({ address, avatarSrc }: ProfileProps) {
  return (
    <div className="flex items-center p-6 rounded-2xl gap-4">
      <Avatar
        size="extra-large"
        className="border-chomp-purple"
        src={avatarSrc}
      />
      <div className="flex flex-col font-sora text-white gap-y-4">
        <span className="">Welcome back,</span>
        <Button
          className="text-base font-bold inline-flex items-center gap-2 !border-0 bg-[#333]"
          isPill
          size="small"
        >
          <span>{formatAddress(address)}</span>
          <PencilIcon width={12} height={13} />
        </Button>
      </div>
    </div>
  );
}
