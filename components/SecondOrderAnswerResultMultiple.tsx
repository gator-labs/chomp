import { QuestionUnansweredIcon } from "@/app/components/Icons/QuestionUnansweredIcon";
import AquaCheckIcon from "./icons/AquaCheckIcon";
import RedXIcon from "./icons/RedXIcon";
import { InfoIcon } from "@/app/components/Icons/InfoIcon";

export default function SecondOrderAnswerResultsMultiple() {
  const optionSelected = true;
  const isUserAnswerCorrect = true;


  const options = [
    { label: 'A', text: 'Iris', percentage: 10.5 },
    { label: 'B', text: 'Cornea', percentage: 33 },
    { label: 'C', text: 'Optic Nerve', percentage: 25.6 },
    { label: 'D', text: 'Pupil', percentage: 8.9 }
  ];

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

        <div className="mt-4 pr-2 pr-4 pl-2">
          {options.map((option, index) => (
            <div key={index} className="flex items-center mb-2">
              {/* Letter box - fixed width */}
              <div className="flex items-center justify-center bg-gray-600 w-12 h-12 rounded-lg mr-2 flex-shrink-0">
                <span className="text-white text-xl font-medium">{option.label}</span>
              </div>

              {/* Progress bar container - full width */}
              <div className="flex-grow relative">
                <div className="h-12 w-full rounded-lg border border-gray-500 overflow-hidden">
                  <div
                    className="bg-gray-600 h-full rounded-l-lg"
                    style={{ width: `${option.percentage}%` }}
                  ></div>
                </div>

                <div className="absolute inset-0 flex items-center px-2">
                  <span className="text-white text-lg pl-2">{option.text}</span>
                </div>
              </div>

              {/* Percentage - fixed width */}
              <div className="text-white text-xl font-medium ml-2 w-16 text-right flex-shrink-0">
                {option.percentage}%
              </div>
            </div>
          ))}
        </div>

        <div className="mt-8 border-t border-gray-600 pt-4 pr-4">

          <p className="text-green font-medium mb-2 text-sm">Nice! Your prediction was within the reward range.</p>

          <div className="flex items-center mb-2">
            {/* Letter box - fixed width */}
            <div className="flex items-center justify-center bg-gray-600 w-12 h-12 rounded-lg mr-2 flex-shrink-0">
              <span className="text-white text-xl font-medium">A</span>
            </div>

            {/* Progress bar container - full width */}
            <div className="flex-grow relative">
              <div className="h-12 w-full rounded-lg border border-gray-500 overflow-hidden">
                <div
                  className="bg-dark-green h-full rounded-l-lg"
                  style={{ width: `10%` }}
                ></div>
              </div>

              <div className="absolute inset-0 flex items-center px-2">
                <span className="text-white text-lg pl-2">Iris</span>
              </div>
            </div>


            {/* Percentage - fixed width */}
            <div className="text-white text-xl font-medium ml-2 w-16 text-right flex-shrink-0">
              10%
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}

