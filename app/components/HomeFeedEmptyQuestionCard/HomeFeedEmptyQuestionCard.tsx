interface Props {
  title: string;
  description: string;
}

export function HomeFeedEmptyQuestionCard({ title, description }: Props) {
  return (
    <div className="bg-gray-700 border-gray-500 border-[0.5px] rounded-lg p-4 flex gap-[20px] h-full flex-col">
      <p className="text-gray-400 text-xs font-normal w-full">{title}</p>
      <p className="text-gray-400 text-xs font-normal w-full">{description} </p>
    </div>
  );
}
