import { ADMIN_PATH, STACKS_PATH } from "@/lib/urls";
import { BackIcon } from "../Icons/BackIcon";
import { FilterIcon } from "../Icons/FilterIcon";
import { HomeIcon } from "../Icons/HomeIcon";
import { MoneyIcon } from "../Icons/MoneyIcon";
import { SortByIcon } from "../Icons/SortByIcon";
import { Navigation } from "../Navigation/Navigation";

const navigationItems = [
  { label: "App", icon: <BackIcon />, href: "/application" },
  { label: "Home", icon: <HomeIcon />, href: "/admin" },
  {
    label: "Decks",
    icon: <SortByIcon />,
    href: "/admin/decks",
    isActiveRegex: "/admin/decks.*",
  },
  {
    label: "Tags",
    icon: <FilterIcon />,
    href: "/admin/tags",
    isActiveRegex: "/admin/tags.*",
  },
  {
    label: "Stacks",
    icon: <MoneyIcon />,
    href: `${ADMIN_PATH}${STACKS_PATH}`,
    isActiveRegex: `${ADMIN_PATH}${STACKS_PATH}.*`,
  },
  {
    label: "Banners",
    icon: <MoneyIcon />,
    href: "/admin/banners",
    isActiveRegex: "/admin/banners.*",
  },
];

export function AdminTabNavigation() {
  return <Navigation items={navigationItems} />;
}
