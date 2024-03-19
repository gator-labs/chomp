type ProgressBarProps = {
  percentage: number;
};

export function ProgressBar({ percentage }: ProgressBarProps) {
  const percentageCapped = percentage > 100 ? 100 : percentage;
  return (
    <div className="relative rounded-full h-3.5 bg-search-gray w-full overflow-hidden">
      <div
        className="h-full bg-purple absolute top-0 l-0 w-full"
        style={{ width: `${percentageCapped}%` }}
      ></div>
    </div>
  );
}
