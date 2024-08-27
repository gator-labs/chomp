const SkeletonCard = () => {
  return (
    <div
      role="status"
      className="w-full border border-neutral-600 shadow p-6 rounded-2xl"
    >
      <div className="animate-pulse space-y-4">
        <div className="flex flex-col justify-between h-full">
          <div>
            <div className="h-2.5 bg-neutral-500 rounded-full w-60 mb-4"></div>
            <div className="w-32 h-2 bg-neutral-500 rounded-full"></div>
          </div>
          <div className="h-2.5 bg-neutral-500 rounded-full w-12 self-end"></div>
        </div>
      </div>
    </div>
  );
};

export default SkeletonCard;
