interface Props {
  title: string;
  description: string;
}

export function HomeFeedEmptyQuestionCard({ title, description }: Props) {
  return (
    <div className="bg-grey-800 border-grey-600 border-[0.5px] rounded-lg p-4 flex gap-[20px] h-full flex-col">
      <p className="text-grey-400 text-xs font-normal w-full">{title}</p>
      <p className="text-grey-400 text-xs font-normal w-full">{description} </p>
    </div>
  );
}
