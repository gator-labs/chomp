import { CommunityAskPeriodStats } from "@/lib/ask/getCommunityAskStats";

export type CommunityAskStatsProps = {
  stats: CommunityAskPeriodStats;
};

const formatNumber = (n: number) => new Intl.NumberFormat("en-US").format(n);

export function CommunityAskStats({ stats }: CommunityAskStatsProps) {
  return (
    <div className="grid grid-cols-5 bg-gray-700 rounded-md p-2 text-sm sm:text-lg">
      <div></div>
      <div className="font-medium border-b">Today</div>
      <div className="font-medium border-b">Week</div>
      <div className="font-medium border-b">Month</div>
      <div className="font-medium border-b">All Time</div>

      <div className="font-medium">Pending</div>
      <div>{formatNumber(stats.submittedDay - stats.acceptedDay)}</div>
      <div>{formatNumber(stats.submittedWeek - stats.acceptedWeek)}</div>
      <div>{formatNumber(stats.submittedMonth - stats.acceptedMonth)}</div>
      <div>{formatNumber(stats.submittedAllTime - stats.acceptedAllTime)}</div>

      <div className="font-medium">Accepted</div>
      <div>{formatNumber(stats.acceptedDay)}</div>
      <div>{formatNumber(stats.acceptedWeek)}</div>
      <div>{formatNumber(stats.acceptedMonth)}</div>
      <div>{formatNumber(stats.acceptedAllTime)}</div>

      <div className="font-medium">Total</div>
      <div>{formatNumber(stats.submittedDay)}</div>
      <div>{formatNumber(stats.submittedWeek)}</div>
      <div>{formatNumber(stats.submittedMonth)}</div>
      <div>{formatNumber(stats.submittedAllTime)}</div>
    </div>
  );
}
