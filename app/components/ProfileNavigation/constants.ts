import {
  HISTORY_PATH,
  HOME_PATH,
  LEADERBOARD_PATH,
  REWARDS_PATH,
} from "@/lib/urls";

const PROFILE_LINKS = [
  { label: "Dashboard", href: HOME_PATH },
  { label: "Leaderboard", href: LEADERBOARD_PATH },
  { label: "Reveal", href: HISTORY_PATH },
];

if (process.env.NEXT_PUBLIC_FF_CREDIT_COST_PER_QUESTION === "true") {
  PROFILE_LINKS.push({ label: "Reward", href: REWARDS_PATH });
}

export default PROFILE_LINKS;
