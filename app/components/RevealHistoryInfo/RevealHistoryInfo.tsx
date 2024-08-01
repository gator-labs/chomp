import { RiShareBoxLine } from "react-icons/ri";
import { Button } from "../Button/Button";

type RevealHistoryInfoProps = {
  onClick: () => void;
};

export default function RevealHistoryInfo({ onClick }: RevealHistoryInfoProps) {
  return (
    <>
      <p className="flex w-full h-[18rem]">
        You full history and other features are available in the Chomp web app.
      </p>
      <Button
        variant="purple"
        size="normal"
        className="gap-2 text-black font-medium mt-4"
        isFullWidth
        onClick={onClick}
      >
        Go to Chomp Web App <RiShareBoxLine />
      </Button>
    </>
  );
}
