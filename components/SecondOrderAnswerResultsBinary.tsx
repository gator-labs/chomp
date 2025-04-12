import { QuestionUnansweredIcon } from "@/app/components/Icons/QuestionUnansweredIcon";
import AquaCheckIcon from "./icons/AquaCheckIcon";
import RedXIcon from "./icons/RedXIcon";
import { InfoIcon } from "@/app/components/Icons/InfoIcon";

type SecondOrderAnswerResultsBinaryProps = {
  aPercentage: number;
  bPercentage: number;
};

export default function SecondOrderAnswerResultsBinary({ aPercentage, bPercentage }: SecondOrderAnswerResultsBinaryProps) {
  const optionSelected = true;
  const isUserAnswerCorrect = true;
  return (
    <div className="bg-gray-700 rounded-xl my-3">
      <div className="bg-dark-green text-white flex justify-between items-center rounded-t-xl py-2 px-4">
        <p className="pl-2 font-bold">Second Order Answer</p>
        {optionSelected === null ? (
          <div className="rounded-full">
            <QuestionUnansweredIcon width={24} height={24} />{" "}
          </div>
        ) : isUserAnswerCorrect ? (
          <AquaCheckIcon width={32} height={32} />
        ) : (
          <RedXIcon width={24} height={24} />
        )}
      </div>

      <div className="p-4">
        <div className="flex items-center text-white mb-2">

          <p className="font-medium ml-2">This shows how users thought the crowd would vote for the best answer.</p>
          <span onClick={() => console.log('TODO')} className="cursor-pointer ml-6 mr-1">
            <InfoIcon width={24} height={24} fill="#FFFFFF" />
          </span>
        </div>

        <div className="mt-4">

          {/** "Would choose the best answer" bar **/}
          <div className="flex items-center mb-1 w-full rounded-full overflow-hidden">
            <div className="h-14 bg-purple-500 flex items-center relative" style={{ width: `${aPercentage}%`, minWidth: `${aPercentage}%` }}>
              <div className="absolute whitespace-nowrap z-10">
                <p className="text-white font-bold ml-4 inline">{aPercentage.toFixed(1)}%</p>
                <p className="text-white ml-2 inline">would choose the best answer</p>
              </div>
            </div>
            <div className="h-14 bg-gray-800" style={{ width: `${100 - aPercentage}%`, minWidth: '0.5rem' }}></div>
          </div>

          <div className="text-white text-center my-2 font-medium">and</div>

          {/** "Would not" bar **/}
          <div className="flex items-center mb-1 w-full rounded-full overflow-hidden">
            <div className="h-14 bg-purple-500 flex items-center relative" style={{ width: `${bPercentage}%`, minWidth: `${bPercentage}%` }}>
              <div className="absolute whitespace-nowrap z-10">
                <p className="text-white font-bold ml-4 inline">{bPercentage.toFixed(1)}%</p>
                <p className="text-white ml-2 inline">would not</p>
              </div>
            </div>
            <div className="h-14 bg-gray-800" style={{ width: `${100 - bPercentage}%`, minWidth: '0.5rem' }}></div>
          </div>
        </div>

        <div className="mt-8 border-t border-gray-600 pt-4">

          <p className="text-white font-medium mb-2">Your prediction was that</p>

          {/** Your prediction bar **/}
          <div className="flex items-center mb-1 w-full rounded-full overflow-hidden mt-4">
            <div className="h-14 bg-green flex items-center relative" style={{ width: `${aPercentage}%`, minWidth: `${aPercentage}%` }}>
              <div className="absolute whitespace-nowrap z-10">
                <p className="text-white font-bold ml-4 inline">{aPercentage.toFixed(1)}%</p>
                <p className="text-white ml-2 inline">would choose the best answer</p>
              </div>
            </div>
            <div className="h-14 bg-gray-800" style={{ width: `${100 - aPercentage}%`, minWidth: '0.5rem' }}></div>
          </div>


        </div>
      </div>
    </div>
  );
}

