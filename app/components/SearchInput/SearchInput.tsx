import classNames from "classnames";
import { SearchIcon } from "../Icons/SearchIcon";
import { useRef } from "react";

type SearchInputProps = {} & React.InputHTMLAttributes<HTMLInputElement>;

export function SearchInput({ ...props }: SearchInputProps) {
  const inputRef = useRef<HTMLInputElement | null>();

  return (
    <div
      onClick={() => {
        inputRef.current?.focus();
      }}
      className={classNames(
        "flex align-center uppercase border-4 border-search-gray gap-[4px] py-2 px-3 rounded-full w-full text-white bg-black"
      )}
    >
      <SearchIcon width={24} height={24} />
      <input
        ref={(ref) => (inputRef.current = ref)}
        {...props}
        className={classNames("transparent outline-none text-[10px] bg-black")}
      />
    </div>
  );
}
