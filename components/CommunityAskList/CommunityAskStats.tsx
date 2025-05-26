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
      <div>{formatNumber(stats.pendingDay)}</div>
      <div>{formatNumber(stats.pendingWeek)}</div>
      <div>{formatNumber(stats.pendingMonth)}</div>
      <div>{formatNumber(stats.pendingAllTime)}</div>

      <div className="font-medium">Accepted</div>
      <div>{formatNumber(stats.acceptedDay)}</div>
      <div>{formatNumber(stats.acceptedWeek)}</div>
      <div>{formatNumber(stats.acceptedMonth)}</div>
      <div>{formatNumber(stats.acceptedAllTime)}</div>

      <div className="font-medium">Archived</div>
      <div>{formatNumber(stats.archivedDay)}</div>
      <div>{formatNumber(stats.archivedWeek)}</div>
      <div>{formatNumber(stats.archivedMonth)}</div>
      <div>{formatNumber(stats.archivedAllTime)}</div>

      <div className="font-medium">Total</div>
      <div>
        {formatNumber(stats.pendingDay + stats.acceptedDay + stats.archivedDay)}
      </div>
      <div>
        {formatNumber(
          stats.pendingWeek + stats.acceptedWeek + stats.archivedWeek,
        )}
      </div>
      <div>
        {formatNumber(
          stats.pendingMonth + stats.acceptedMonth + stats.archivedMonth,
        )}
      </div>
      <div>
        {formatNumber(
          stats.pendingAllTime + stats.acceptedAllTime + stats.archivedAllTime,
        )}
      </div>
    </div>
  );
}
