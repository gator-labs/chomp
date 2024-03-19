import classNames from "classnames";

type ToggleProps = {
  isOn: boolean;
  onToggle: () => void;
};

export function Toggle({ isOn, onToggle }: ToggleProps) {
  return (
    <button
      onClick={onToggle}
      className={classNames(
        "bg-[#eee] border-[1px] border-btn-text-disabled rounded-full p-1 flex",
        {
          "!bg-aqua": isOn,
          "!border-aqua": isOn,
        }
      )}
    >
      <div
        className={classNames("h-6 w-6 bg-[#666] rounded-full invisible", {
          "!visible": !isOn,
        })}
      ></div>
      <div
        className={classNames("h-6 w-6 bg-white rounded-full invisible", {
          "!visible": isOn,
        })}
      ></div>
    </button>
  );
}
