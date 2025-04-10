import { Button } from "@/app/components/Button/Button";
import { Check } from "lucide-react";
import { useRouter } from "next/navigation";

export type AskQuestionSubmittedProps = {
  points: number;
};

export function AskQuestionSubmitted({ points }: AskQuestionSubmittedProps) {
  const router = useRouter();

  const handleGoHome = () => {
    router.push("/application");
  };

  return (
    <div className="flex flex-col gap-3 h-[calc(100vh_-_10em)] justify-center">
      <div className="bg-gray-700 rounded-2xl flex flex-col px-4 py-12 justify-center items-center gap-2">
        <div className="text-2xl font-bold flex gap-2 justify-center">
          Question submitted!
          <span className="bg-green text-white rounded-full p-2 flex">
            <Check size={18} color="#000000" />
          </span>
        </div>

        <div className="text-gray-200 flex flex-col justify-center gap-4 text-sm font-medium max-w-[20em]">
          <p className="text-center">Your submission will now be reviewed.</p>

          <p className="text-center">
            Once approved, it will show up on CHOMP, and you will get {points}{" "}
            points &mdash; plus an additional point every time your question is
            answered!
          </p>
        </div>
      </div>
      <Button variant="primary" onClick={handleGoHome}>
        Back to homepage
      </Button>
    </div>
  );
}
