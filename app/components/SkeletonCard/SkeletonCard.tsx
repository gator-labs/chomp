const SkeletonCard = () => {
  return (
    <div
      role="status"
      className="w-full border border-gray-200 shadow p-6 dark:border-gray-700 rounded-2xl "
    >
      <div className="animate-pulse space-y-4">
        <div className="flex flex-col justify-between h-full">
          <div>
            <div className="h-2.5 bg-gray rounded-full dark:bg-gray-600 w-60 mb-4"></div>
            <div className="w-32 h-2 bg-gray rounded-full dark:bg-gray-700"></div>
          </div>
          <div className="h-2.5 bg-gray rounded-full dark:bg-gray-700 w-12 self-end"></div>
        </div>
      </div>
    </div>
  );
};

export default SkeletonCard;
