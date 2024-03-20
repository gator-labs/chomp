import Link from "next/link";
import { Button } from "../Button/Button";
import classNames from "classnames";

type SwitchNavigationProps = {
  navigationItems: {
    href: string;
    label: string;
    isActive: boolean;
  }[];
};

export function SwitchNavigation({ navigationItems }: SwitchNavigationProps) {
  return (
    <div className="bg-black flex rounded-full p-1 space-x-2 w-full">
      {navigationItems.map((ni, index) => (
        <Link key={index} href={ni.href} className="w-1/2">
          <Button
            className={classNames("!rounded-full", {
              "text-gray !border-gray": !ni.isActive,
            })}
            variant={ni.isActive ? "white" : "secondary"}
          >
            {ni.label}
          </Button>
        </Link>
      ))}
    </div>
  );
}
