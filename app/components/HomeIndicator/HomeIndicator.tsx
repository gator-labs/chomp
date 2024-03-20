import classNames from "classnames";
import Link from "next/link";

type HomeIndicator = {
  theme: "light" | "dark";
  href: string;
};

export function HomeIndicator({ theme, href }: HomeIndicator) {
  return (
    <div
      className={classNames("flex justify-center w-full pb-2 pt-5", {
        "bg-white": theme === "light",
        "bg-black": theme === "dark",
      })}
    >
      <Link href={href}>
        <div
          className={classNames("w-[134px] rounded-full h-[5px]", {
            "bg-white": theme === "dark",
            "bg-black": theme === "light",
          })}
        ></div>
      </Link>
    </div>
  );
}
