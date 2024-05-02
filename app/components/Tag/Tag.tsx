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
        "font-sora font-normal text-sm border-[0.5px] rounded-md border-gray px-4 py-2",
        {
          "text-btn-text-primary": isSelected,
          "bg-[#e6e6e6]": isSelected,
          "text-search-gray": !isSelected,
          "bg-black": !isSelected,
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
