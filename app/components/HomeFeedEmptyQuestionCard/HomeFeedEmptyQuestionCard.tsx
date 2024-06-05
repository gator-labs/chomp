interface Props {
  title: string;
  description: string;
}

export function HomeFeedEmptyQuestionCard({ title, description }: Props) {
  return (
    <div className="bg-[#333] border-[#666] rounded-2xl p-4 flex gap-2 h-full flex-col">
      <p className="text-[#999] text-sm gap-y-2 w-full max-w-[196px]">
        {title}
      </p>
      <p className="text-[#999] text-sm gap-y-2 w-full max-w-[196px]">
        {description}{" "}
      </p>
    </div>
  );
}
