import { Button } from "../Button/Button";
import { ShareBoxIcon } from "../Icons/ShareBoxIcon";

type RevealHistoryInfoProps = {
  onClick: () => void;
};

export default function RevealHistoryInfo({ onClick }: RevealHistoryInfoProps) {
  return (
    <>
      <p className="flex w-full h-[17.5rem]">
        You full history and other features are available in the Chomp web app.
      </p>
      <Button
        variant="purple"
        className="gap-2 text-black font-medium"
        isFullWidth
        onClick={onClick}
      >
        Go to Chomp Web App <ShareBoxIcon fill="#000" />
      </Button>
    </>
  );
}
