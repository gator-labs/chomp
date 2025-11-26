import Link from "next/link";
import classNames from "classnames";

export type SunsetBannerProps = {
  className?: string;
}

export function SunsetBanner({ className }: SunsetBannerProps) {
  return (
    <div className={classNames("flex justify-center w-full", className)}>
      <div className="max-w-lg bg-[#ED6A5A] p-5">
        <div className="font-bold font-black text-xs sm:text-lg">CHOMPY IS MOVING</div>
        <div className="text-xs sm:text-sm">
          This version of CHOMP will go offline on December 19th 11:59pm UTC.
          Be in Top 100 All Time Points <Link href="/Leaderboard" className="underline">Leaderboard</Link> by December 14th
          11:59pm to claim a gift from Chompy! Read more about it <Link href="/" className="underline">here</Link>.
        </div>
      </div>
    </div>
  );
}
