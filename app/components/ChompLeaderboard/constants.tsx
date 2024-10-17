import TrophyIcon from "../Icons/TrophyIcon";
import CalendarIcon from "../Icons/CalendarIcon";
import ChartIcon from "../Icons/ChartIcon";

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
