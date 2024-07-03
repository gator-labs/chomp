import { BackIcon } from "../Icons/BackIcon";
import { CommentIcon } from "../Icons/CommentIcon";
import { FilterIcon } from "../Icons/FilterIcon";
import { HomeIcon } from "../Icons/HomeIcon";
import { MoneyIcon } from "../Icons/MoneyIcon";
import { SortByIcon } from "../Icons/SortByIcon";
import { Navigation } from "../Navigation/Navigation";

const navigationItems = [
  { label: "App", icon: <BackIcon />, href: "/application" },
  { label: "Home", icon: <HomeIcon />, href: "/admin" },
  {
    label: "Questions",
    icon: <CommentIcon />,
    href: "/admin/questions",
    isActiveRegex: "/admin/questions.*",
  },
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
    label: "Campaigns",
    icon: <MoneyIcon />,
    href: "/admin/campaigns",
    isActiveRegex: "/admin/campaigns.*",
  },
];

export function AdminTabNavigation() {
  return <Navigation items={navigationItems} />;
}
