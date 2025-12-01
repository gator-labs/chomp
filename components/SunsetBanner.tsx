import classNames from "classnames";
import Link from "next/link";

export type SunsetBannerProps = {
  className?: string;
};

export function SunsetBanner({ className }: SunsetBannerProps) {
  return (
    <div className={classNames("flex justify-center w-full", className)}>
      <div className="max-w-lg bg-[#ED6A5A] px-5 sm:p-6 py-4">
        <div className="font-black text-md/2xl sm:text-lg">
          CHOMPY IS MOVING 🐊💜
        </div>
        <div className="text-xs sm:text-[12px]/[1.2] font-medium">
          This version of CHOMP will sunset on Dec 19 at 11:59pm UTC. Chompy’s
          leaving you a farewell gift, read the full plan{" "}
          <Link href="/" className="underline">
            here
          </Link>
          .
        </div>
      </div>
    </div>
  );
}
