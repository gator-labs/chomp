import Skeleton from "../Skeleton/Skeleton";

const HistoryListSkeleton = () => {
  const skeletons = new Array(8).fill(null);

  return (
    <div className="flex flex-col gap-2">
      <Skeleton className="h-[19px] w-[81px] rounded-[56px]" />
      <ul className="flex flex-col gap-2">
        {skeletons.map((_, i) => (
          <Skeleton key={i} />
        ))}
      </ul>
    </div>
  );
};

export default HistoryListSkeleton;
