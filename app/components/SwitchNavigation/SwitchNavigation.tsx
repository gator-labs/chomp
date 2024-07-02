import classNames from "classnames";
import Link from "next/link";
import { Button } from "../Button/Button";

type SwitchNavigationProps = {
  navigationItems: {
    href: string;
    label: string;
    isActive: boolean;
  }[];
};

export function SwitchNavigation({ navigationItems }: SwitchNavigationProps) {
  return (
    <div className="bg-[#333333] flex rounded-full p-1 space-x-2 w-full">
      {navigationItems.map((ni, index) => (
        <Link
          key={index}
          href={ni.href}
          style={{ width: `${100 / navigationItems.length}%` }}
        >
          <Button
            size="small"
            className={classNames("!rounded-full !border-0", {
              "text-gray": !ni.isActive,
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
