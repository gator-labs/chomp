import classNames from "classnames";

interface Props {
  numberOfSteps: number;
  activeStep: number;
  color?: "purple" | "green";
  className?: string;
}

const Stepper = ({
  color = "purple",
  numberOfSteps,
  activeStep,
  className,
}: Props) => {
  return (
    <ul className={classNames("py-10 flex gap-2 w-full px-1 pb-0", className)}>
      {new Array(numberOfSteps).fill(null).map((_, index) => (
        <li
          key={index}
          className="h-2 flex-1 rounded-[40px] bg-[#666666] overflow-hidden"
        >
          <div
            className={classNames(
              `w-0 h-full transition-all duration-300 ease-out`,
              index <= activeStep && "w-full",
              color === "purple" && "bg-[#CFC5F7]",
              color === "green" && "bg-[#6DECAF]",
            )}
          />
        </li>
      ))}
    </ul>
  );
};

export default Stepper;
