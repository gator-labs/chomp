import Link from "next/link";

export const QUESTION_CARD_CONTENT = {
  "daily-deck": {
    title: "Fantastic!",
    body: (
      <>
        You just chomped through today&apos;s Daily Deck. <br /> <br /> Now you
        can browse other questions on Chomp! <br /> <br /> Today&apos;s Daily
        Deck will be revealed in 3 days. Come back then to reveal, see how you
        did, and get rewarded!
      </>
    ),
  },
  "regular-deck": {
    title: "Nice!",
    body: (
      <>
        You just chomped through that deck! You&apos;ll be notified when this
        deck is ready to reveal. <br />
        <br /> Meanwhile, go check out some more chomps in{" "}
        <b>
          <Link href="/application/answer">home</Link>
        </b>{" "}
        page or go back{" "}
        <b>
          <Link href="/application">home</Link>
        </b>{" "}
        to check for more decks.
      </>
    ),
  },
  "answer-page": {
    title: "Wait, is there more?",
    body: (
      <>
        There just might be! <br /> <br /> Check out what decks are still
        available for you to chomp through under{" "}
        <b>
          <Link href="/application">Home!</Link>
        </b>
      </>
    ),
  },
};
