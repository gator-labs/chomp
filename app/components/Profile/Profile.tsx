"use client";

import dayjs from "dayjs";
import { useRouter } from "next/navigation";
import { Avatar } from "../Avatar/Avatar";

type ProfileProps = {
  handle: string;
  fullName: string;
  joinDate: Date;
  avatarSrc: string;
};

export function Profile({
  avatarSrc,
  handle,
  fullName,
  joinDate,
}: ProfileProps) {
  const router = useRouter();

  return (
    <div className="flex justify-between items-center p-6 rounded-2xl bg-[#333] gap-4">
      <Avatar size="large" src={avatarSrc} />
      <div className="flex flex-col font-sora text-white gap-y-[3px]">
        <span className="text-base font-bold">{handle}</span>
        <span className="text-sm font-bold">{fullName}</span>
        <span className="text-xs leading-4">
          Joined {dayjs(joinDate).format("MMMM YYYY").toString()}
        </span>
      </div>
      <div className="h-[80px] w-[1px] bg-white"></div>
      <div>
        <button
          onClick={() => {
            router.push("/application/profile/settings");
          }}
          className="outline-none text-white font-sora text-sm"
        >
          Settings
        </button>
      </div>
    </div>
  );
}
