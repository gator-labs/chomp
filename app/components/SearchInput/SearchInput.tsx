import classNames from "classnames";
import { SearchIcon } from "../Icons/SearchIcon";
import { useRef } from "react";

type SearchInputProps = {
  name?: string;
  onChange: () => string;
  value: string;
};

export function SearchInput({ onChange, value, name }: SearchInputProps) {
  const inputRef = useRef<HTMLInputElement | null>();

  return (
    <div
      onClick={() => {
        inputRef.current?.focus();
      }}
      className={classNames(
        "flex align-center uppercase border-4 border-search-gray gap-[4px] py-3 px-4 rounded-full w-full text-white bg-black"
      )}
    >
      <SearchIcon width={24} height={24} />
      <input
        ref={(ref) => (inputRef.current = ref)}
        onChange={onChange}
        value={value}
        name={name}
        className={classNames("transparent outline-none text-[10px] bg-black")}
      />
    </div>
  );
}
