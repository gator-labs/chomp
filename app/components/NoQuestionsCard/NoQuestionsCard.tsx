import { ChompGraphic } from "../Graphics/ChompGraphic";

type NoQuestionsCardProps = {};

export function NoQuestionsCard({}: NoQuestionsCardProps) {
  return (
    <div className="questions-card text-white font-sora">
      <div>
        <div className="text-xl font-semibold mb-2">Fantastic!</div>
        <div className="text-sm max-w-72">
          You chomped through 24 questions today.
          <br />
          <br />
          Go back to home and look out for more decks when they are available.
        </div>
      </div>
      <div className="flex justify-between items-end">
        <div className="text-sm max-w-44">
          Free questions unlocks every 24 hours!
        </div>
        <div>
          <ChompGraphic className="-mr-4 -mb-6" />
        </div>
      </div>
    </div>
  );
}
