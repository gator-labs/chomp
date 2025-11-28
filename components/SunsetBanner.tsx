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
          CHOMPY IS MOVING
        </div>
        <div className="text-xs sm:text-[15px]/[1.2] font-medium">
          This version of CHOMP will go offline on December 19th 11:59pm UTC. Be
          in Top 100 All Time Points{" "}
          <Link href="/application/leaderboard" className="underline">
            Leaderboard
          </Link>{" "}
          by December 14th 11:59pm to claim a gift from Chompy! Read more about
          it{" "}
          <Link href="/" className="underline">
            here
          </Link>
          .
        </div>
      </div>
    </div>
  );
}
