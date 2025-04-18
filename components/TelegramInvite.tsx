import { TELEGRAM_SUPPORT_LINK } from "@/app/constants/support";

import ChatIcon from "./icons/ChatIcon";

export default function TelegramInvite() {
  return (
    <div className="bg-gray-700 rounded-2xl p-2 flex flex-col gap-2 h-full mt-2">
      <div className="flex bg-gray-600 p-2 rounded-2xl gap-2 items-center relative">
        <div className="w-[60px] h-[60px] bg-primary rounded-full flex-shrink-0 relative p-1 flex items-center justify-center">
          <ChatIcon className="text-white" />
        </div>
        <div className="z-10 ml-2">
          <div className="text-white text-[16px] font-[900] text-base line-clamp-2">
            Hang with CHOMPers
          </div>
          <div className="text-gray-400 text-[14px] font-[500]">
            Daily Rewards, Challenges & More 🔥
          </div>
        </div>
      </div>

      <a
        href={TELEGRAM_SUPPORT_LINK}
        target="_blank"
        rel="noopener noreferrer"
        className="bg-primary cursor-pointer w-full py-3 rounded-xl text-white text-lg text-[14px] font-medium font-bold flex items-center justify-center border border-gray-500"
      >
        Open Telegram
      </a>
    </div>
  );
}
