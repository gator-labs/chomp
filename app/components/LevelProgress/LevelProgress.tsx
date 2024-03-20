import { ProgressBar } from "../ProgressBar/ProgressBar";

type LevelProgressProps = { level: string; progress: number };

export function LevelProgress({ level, progress }: LevelProgressProps) {
  return (
    <div className="flex items-center gap-2">
      <span className="whitespace-nowrap text-white font-sora font-semibold text-xs">
        Lvl. {level}
      </span>
      <ProgressBar
        bgColor="#fff"
        progressColor="#CFC5F7"
        percentage={progress}
      />
    </div>
  );
}
