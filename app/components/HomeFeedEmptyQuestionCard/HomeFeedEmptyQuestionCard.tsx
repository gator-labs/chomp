interface Props {
  title: string;
  description: string;
}

export function HomeFeedEmptyQuestionCard({ title, description }: Props) {
  return (
    <div className="bg-[#333] border-[#666] border-[0.5px] rounded-lg p-4 flex gap-[20px] h-full flex-col">
      <p className="text-[#999] text-xs font-normal w-full">{title}</p>
      <p className="text-[#999] text-xs font-normal w-full">{description} </p>
    </div>
  );
}
