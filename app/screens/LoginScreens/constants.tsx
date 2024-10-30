import { BetaIcon } from "@/app/components/Icons/BetaIcon";
import CarIcon from "@/app/components/Icons/CarIcon";
import WelcomeIcon from "@/app/components/Icons/WelcomeIcon";

import ChompIcon from "../../components/Icons/ChompIcon";
import CommunicationIcon from "../../components/Icons/CommunicationIcon";

export const SLIDESHOW = [
  {
    icon: <BetaIcon />,
    title: "Welcome to Chomp's Beta!",
    description: [
      "Chomp is the fast-paced quiz game that rewards you for your insights!",
      "All you need to do is to answer each question — and guess what others have answered.",
    ],
  },
  {
    icon: <CommunicationIcon />,
    title: "Wisdom of the Crowd",
    description: [
      "Under the hood, Chomp is a social consensus platform that distills the best (or most likely) answers using empirical research-based Wisdom of the Crowd mechanisms.",
    ],
  },
  {
    icon: <WelcomeIcon />,
    title: "Gauge high-signal sentiment, make more informed decisions",
    description: [
      "What do people REALLY think about a token, a product, or a controversial debate? Chomp cuts through the noise and gets you the closest to the truth than ever before.",
    ],
  },
  {
    icon: <CarIcon />,
    title: "Race with your community toward information symmetry",
    description: [
      "Who are your loyal community members? Did they understand what you have shared?",
      "Engage your community over a game of Chomp to test their knowledge or identify gaps in understanding. ",
      "Community gains rewards and fun, you gain better insights, it's a easy win-win.",
    ],
  },
  {
    icon: <ChompIcon />,
    title: "Ready to begin?",
    description: ["Connect wallet to start chompin!"],
  },
];
