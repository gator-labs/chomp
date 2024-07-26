import Skeleton from "../Skeleton/Skeleton";

const HistoryListSkeleton = () => {
  const skeletons = new Array(8).fill(null);

  return (
    <ul className="flex flex-col gap-2">
      {skeletons.map((_, i) => (
        <Skeleton key={i} />
      ))}
    </ul>
  );
};

export default HistoryListSkeleton;
