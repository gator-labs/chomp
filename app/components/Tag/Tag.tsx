import classNames from "classnames";

type TagProps = {
  onSelected?: () => void;
  isSelected?: boolean;
  tag: string;
  className?: string;
};

export function Tag({ onSelected, tag, isSelected, className }: TagProps) {
  return (
    <button
      className={classNames(
        " font-normal text-sm border-[0.5px] rounded-md border-gray px-4 py-2",
        {
          "text-gray-900": isSelected,
          "bg-gray-100": isSelected,
          "text-gray-600": !isSelected,
          "bg-gray-800": !isSelected,
        },
        className,
      )}
      onClick={onSelected}
      type="button"
    >
      {tag}
    </button>
  );
}
