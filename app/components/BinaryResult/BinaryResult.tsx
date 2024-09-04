type BinaryResultProps = {
  optionSelected: string;
  percentage: number;
};

export default function BinaryResult({
  optionSelected,
  percentage,
}: BinaryResultProps) {
  return (
    <div className="border-gray-600 border-[1px] rounded-lg flex items-center w-full justify-between px-4 relative overflow-hidden min-h-10">
      <div className="text-white text-sm font-bold z-10 flex items-center gap-1">
        <div>{percentage}% answered </div>
        <div className="text-gray-850 bg-white py-1 px-2 rounded-full">
          {optionSelected}
        </div>
      </div>
      <div
        className="bg-gray-700 h-full absolute"
        style={{ left: "-5px", width: `calc(${percentage}% + 5px)` }}
      ></div>
    </div>
  );
}
