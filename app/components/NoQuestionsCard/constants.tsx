import { formatDistanceToNowStrict } from "date-fns";
import Link from "next/link";
import { TrophyGraphic } from "../Graphics/TrophyGraphic";
import FlagIcon from "../Icons/FlagIcon";
import HeartIcon from "../Icons/HeartIcon";

export const QUESTION_CARD_CONTENT = {
  "daily-deck": {
    title: "Fantastic!",
    body: () => (
      <>
        You just chomped through today&apos;s Daily Deck. <br /> <br /> Now you
        can browse other questions on Chomp! <br /> <br /> Today&apos;s Daily
        Deck will be revealed in 3 days. Come back then to reveal, see how you
        did, and get rewarded!
      </>
    ),
    backgroundIcon: <TrophyGraphic />,
  },
  "regular-deck": {
    title: "Nice!",
    body: (date?: Date | null) => (
      <>
        You just chomped through that deck!{" "}
        {!!date && (
          <>
            The deck will be revealed in{" "}
            <span className="text-[#A3A3EC]">
              {formatDistanceToNowStrict(date)}
            </span>
            .
          </>
        )}
        <br />
        <br /> Meanwhile, go check out some more chomps in{" "}
        <b>
          <Link href="/application/answer">answer</Link>
        </b>{" "}
        page or go back{" "}
        <b>
          <Link href="/application">home</Link>
        </b>{" "}
        to check for more decks.
      </>
    ),
    backgroundIcon: <TrophyGraphic />,
  },
  "answer-page": {
    title: "Wait, is there more?",
    body: () => (
      <>
        There just might be! <br /> <br /> Check out what decks are still
        available for you to chomp through under{" "}
        <b>
          <Link href="/application">Home!</Link>
        </b>
      </>
    ),
    backgroundIcon: <TrophyGraphic />,
  },
  "answered-none": {
    title: "You missed out :(",
    body: () => (
      <>
        Chompy is sad that you didn&apos;t answer any of today&apos;s Daily Deck
        questions.
        <br /> <br />
        For now, waddle over to Home and see what else is available for you to
        Chomp on!
      </>
    ),
    backgroundIcon: <HeartIcon />,
  },
  "answered-some": {
    title: "You can do better!",
    body: () => (
      <>
        Chompy is sad that you didn&apos;t answer all the questions of
        today&apos;s Daily Deck. <br /> <br />
        Today&apos;s Daily Deck will be revealed in 3 days! Come back then to
        burn some BONK, reveal the answer, see how you did, and get rewarded!
        <br /> <br />
        For now, waddle over to Home and see what else is available for you to
        Chomp on!
      </>
    ),
    backgroundIcon: <FlagIcon />,
  },
};
