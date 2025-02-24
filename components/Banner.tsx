import { XMarkIcon } from "@/app/components/Icons/XMarkIcon";
import Image from "next/image";
import Link from "next/link";

type BannerProps = {
  url?: string;
  iconUrl: string;
  text: string;
  onDismiss: () => void;
};

export function Banner({ url, iconUrl, text, onDismiss }: BannerProps) {
  const content = (
    <div className="flex gap-x-4 items-center">
      <div>
        <Image src={iconUrl} alt="Banner icon" width={48} height={48} />
      </div>
      <div className="flex flex-col gap-1">
        <div className="text-sm font-black overflow-hidden">{text}</div>
      </div>
    </div>
  );

  return (
    <div className="flex flex-row justify-between items-center text-white rounded-lg p-4 bg-gray-700 border-[1px] border-gray-500 h-24 overflow-hidden mx-4 my-2">
      {url ? <Link href={url}>{content}</Link> : content}
      <div className="flex items-start h-full -mt-2">
        <div
          onClick={onDismiss}
          className="rounded-full bg-gray-600 cursor-pointer"
        >
          <XMarkIcon />
        </div>
      </div>
    </div>
  );
}
