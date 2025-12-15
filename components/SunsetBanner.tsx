import classNames from "classnames";

export type SunsetBannerProps = {
  className?: string;
};

export function SunsetBanner({ className }: SunsetBannerProps) {
  return (
    <div className={classNames("flex justify-center w-full", className)}>
      <div className="max-w-lg bg-[#ED6A5A] px-5 sm:p-6 py-4">
        <div className="font-black text-md/2xl sm:text-lg">
          Bye CHOMP V1! 👋 💜 🐊
        </div>
        <div className="text-xs sm:text-[12px]/[1.2] font-medium">
          Claim any remaining mystery boxes by Dec 19, 11:59pm UTC before we officially sunset 🐊.
        </div>
      </div>
    </div>
  );
}
