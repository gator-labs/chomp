import { cn } from "@/lib/utils";

export type TabsItem<T> = {
  id: T;
  title: string;
  count: number | null;
};

export type CommunityAskListTabsProps<T extends string> = {
  options: TabsItem<T>[];
  selected: T;
  onSelect: (tab: T) => void;
};

export function CommunityAskListTabs<T extends string>({
  options,
  selected,
  onSelect,
}: CommunityAskListTabsProps<T>) {
  return (
    <div className="flex w-full gap-2 border-b border-gray-600">
      {options.map((option) => (
        <div
          className={cn("bg-gray-300 rounded-t-lg py-2 px-4 grow", {
            "bg-gray-300 text-black font-bold": selected === option.id,
            "bg-gray-600 cursor-pointer": selected !== option.id,
          })}
          onClick={() => selected !== option.id && onSelect?.(option.id)}
          key={option.id}
        >
          {option.title}{" "}
          {option.count !== null && (
            <span className="float-right">{option.count}</span>
          )}
        </div>
      ))}
    </div>
  );
}
