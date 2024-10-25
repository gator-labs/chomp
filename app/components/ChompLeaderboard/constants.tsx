import CalendarIcon from "../Icons/CalendarIcon";
import ChartIcon from "../Icons/ChartIcon";
import TrophyIcon from "../Icons/TrophyIcon";

export const CHOMP_LEADERBOARD = [
  {
    icon: <TrophyIcon />,
    label: "All-time Leaderboard",
    href: "/application/leaderboard/all-time",
  },
  {
    icon: <CalendarIcon />,
    label: "Weekly Leaderboard",
    href: "/application/leaderboard/weekly",
  },
  {
    icon: <ChartIcon />,
    label: "Daily Leaderboard",
    href: "/application/leaderboard/daily",
  },
];
